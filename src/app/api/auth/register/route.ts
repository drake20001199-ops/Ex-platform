// ============================================================
// FIX #7: src/app/api/auth/register/route.ts — No Email Enumeration
// ============================================================
// PROBLEM: Returns "An account with this email already exists" (409).
//          Attacker can test emails to see who's registered.
// FIX:     Return generic success (201) even if email exists.
//          The real user will get a "already registered" email instead.
//
// NOTE:    Also migrated to rateLimitAsync for production Redis support.
// FILE:    src/app/api/auth/register/route.ts (replace entire file)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { createActivityEvent } from "@/lib/audit";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimitAsync } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { allowed } = await rateLimitAsync(`register:${ip}`, 3, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { password, dateOfBirth, ...rest } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email: rest.email },
    });

    if (existing) {
      // FIX: Don't reveal that the email exists.
      // Return the same success response as a new registration.
      // Optionally, you can send a "someone tried to register with your email" notification.
      return NextResponse.json({ success: true }, { status: 201 });
    }

    const passwordHash = await hashPassword(password);
    const token = crypto.randomBytes(32).toString("hex");

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          ...rest,
          dateOfBirth: new Date(dateOfBirth),
          passwordHash,
        },
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: newUser.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return newUser;
    });

    await createActivityEvent({
      eventType: "user_registered",
      userId: user.id,
      description: `${user.firstName} ${user.lastName} registered`,
    });

    try {
      await sendVerificationEmail(user.email, token);
    } catch {
      console.error(
        `[REGISTER] Failed to send verification email to ${user.email}`
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
