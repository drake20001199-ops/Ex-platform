// ============================================================
// FIX #3b: src/app/api/auth/reset-password/route.ts
// ============================================================
// PROBLEM: After password reset, old JWT tokens remain valid.
// FIX:     Increment passwordVersion on the user record.
//          This invalidates ALL existing sessions instantly
//          (auth.ts checks passwordVersion matches JWT payload).
//
// ALSO:    Added rate limiting on this endpoint.
// FILE:    src/app/api/auth/reset-password/route.ts (replace entire file)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations";
import { rateLimitAsync } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 5 attempts per 15 minutes
    const { allowed } = await rateLimitAsync(`reset-pw:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (record.usedAt) {
      return NextResponse.json(
        { error: "Token already used" },
        { status: 400 }
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: {
          passwordHash,
          // INCREMENT passwordVersion → all existing JWTs become invalid
          passwordVersion: { increment: 1 },
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
