// ============================================================
// FIX M5: src/app/api/cron/cleanup-tokens/route.ts (NEW FILE)
// PROBLEM: Expired tokens accumulate in DB forever
// FIX: Cron endpoint that deletes expired/used tokens
// 
// SETUP: In Vercel, go to Settings → Cron Jobs, add:
//   Path: /api/cron/cleanup-tokens
//   Schedule: 0 3 * * * (daily at 3am UTC)
//
// Also add to vercel.json:
//   { "crons": [{ "path": "/api/cron/cleanup-tokens", "schedule": "0 3 * * *" }] }
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron (or allow in dev)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();

  // Delete expired OR used email verification tokens (older than 7 days)
  const emailResult = await prisma.emailVerificationToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { usedAt: { not: null }, createdAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
      ],
    },
  });

  // Delete expired OR used password reset tokens (older than 7 days)
  const passwordResult = await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: now } },
        { usedAt: { not: null }, createdAt: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } },
      ],
    },
  });

  return NextResponse.json({
    success: true,
    cleaned: {
      emailTokens: emailResult.count,
      passwordTokens: passwordResult.count,
    },
  });
}
