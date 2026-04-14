import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, emailVerifiedAt: true } } },
    });

    if (!record) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    if (record.usedAt) {
      return NextResponse.json({ error: "Token already used" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Token has expired" }, { status: 400 });
    }

    if (record.user.emailVerifiedAt) {
      return NextResponse.json({ success: true, message: "Email already verified" });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerifiedAt: new Date() },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
