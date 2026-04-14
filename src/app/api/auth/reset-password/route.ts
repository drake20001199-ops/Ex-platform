import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { token, password } = parsed.data;

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
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

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
