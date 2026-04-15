// ============================================================
// FIX M1: src/app/api/auth/forgot-password/route.ts
// PROBLEM: No rate limiting — attacker can spam reset emails
// FIX: Add rateLimitAsync (5 per 15 minutes per IP)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimitAsync } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Rate limit: 5 requests per 15 minutes
    const { allowed } = await rateLimitAsync(`forgot:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      // Still return success to prevent enumeration
      return NextResponse.json({ success: true });
    }

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      await sendPasswordResetEmail(user.email, token);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
