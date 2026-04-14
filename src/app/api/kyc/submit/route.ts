import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createActivityEvent } from "@/lib/audit";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check user has at least one document uploaded
    const docs = await prisma.kycDocument.findMany({
      where: { userId: user.id },
    });

    if (docs.length === 0) {
      return NextResponse.json({ error: "Please upload at least one document first" }, { status: 400 });
    }

    // Only allow submission if KYC is NOT_STARTED or NEED_MORE_DOCS
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { kycStatus: true },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (fullUser.kycStatus !== "NOT_STARTED" && fullUser.kycStatus !== "NEED_MORE_DOCS") {
      return NextResponse.json(
        { error: `Cannot submit: KYC status is ${fullUser.kycStatus}` },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { kycStatus: "IN_REVIEW" },
    });

    await createActivityEvent({
      eventType: "kyc_submitted",
      userId: user.id,
      description: `${user.firstName} submitted KYC documents for review`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
