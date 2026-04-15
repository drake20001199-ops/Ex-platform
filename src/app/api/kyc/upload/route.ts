import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createActivityEvent } from "@/lib/audit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_DOC_TYPES = [
  "PASSPORT",
  "ID_CARD",
  "ID_CARD_FRONT",
  "ID_CARD_BACK",
  "SELFIE",
  "PROOF_OF_ADDRESS",
  "SOURCE_OF_FUNDS",
  "DRIVING_LICENSE_FRONT",
  "DRIVING_LICENSE_BACK",
];

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const documentType = formData.get("documentType") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!documentType || !VALID_DOC_TYPES.includes(documentType)) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "File type not allowed. Use JPEG, PNG, WebP, or PDF" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    // Store locally for now — in production, use Supabase Storage or Cloudflare R2
    const uploadDir = path.join(process.cwd(), "data", "kyc-uploads", user.id);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "bin";
    const fileName = `${documentType.toLowerCase()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Relative URL for storage (would be a signed URL in production)
    const fileUrl = `/data/kyc-uploads/${user.id}/${fileName}`;

    const doc = await prisma.kycDocument.create({
      data: {
        userId: user.id,
        documentType: documentType as "PASSPORT" | "ID_CARD" | "SELFIE" | "PROOF_OF_ADDRESS",
        fileUrl,
      },
    });

    await createActivityEvent({
      eventType: "kyc_document_uploaded",
      userId: user.id,
      entityId: doc.id,
      description: `${user.firstName} uploaded ${documentType.toLowerCase().replace("_", " ")}`,
    });

    return NextResponse.json({ id: doc.id, success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
