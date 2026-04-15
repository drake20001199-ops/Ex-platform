// ============================================================
// FIX #4b: Example migration — src/app/api/auth/login/route.ts
// ============================================================
// Shows how to migrate from sync rateLimit() to rateLimitAsync().
// Apply the same pattern to: register, forgot-password, transactions POST
// FILE: src/app/api/auth/login/route.ts (replace entire file)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, setAuthCookies } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimitAsync } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // CHANGED: rateLimitAsync instead of rateLimit (works with Redis in production)
    const { allowed } = await rateLimitAsync(`login:${ip}`, 5, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // CHANGED: Pass passwordVersion to setAuthCookies
    await setAuthCookies(user.id, user.role, user.passwordVersion);

    return NextResponse.json({ success: true, role: user.role });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
