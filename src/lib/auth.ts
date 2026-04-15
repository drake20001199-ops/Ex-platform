// ============================================================
// FIX #2 + #3: src/lib/auth.ts — Separate JWT Secrets + Session Invalidation
// ============================================================
// PROBLEM #2: Same secret for access & refresh tokens. If refresh token
//             leaks, it works as an access token too.
// FIX:        Use separate secrets (JWT_SECRET for access, JWT_REFRESH_SECRET for refresh).
//
// PROBLEM #3: Password reset doesn't invalidate existing sessions.
//             Old tokens keep working after password change.
// FIX:        Add passwordVersion field to User model. Include it in JWT payload.
//             Verify it matches on every getCurrentUser() call.
//             Increment it on password change → all old tokens instantly invalid.
//
// REQUIRES:   Add to .env:
//             JWT_REFRESH_SECRET=<different-random-string>
//
// REQUIRES:   Add to Prisma schema (users table):
//             passwordVersion  Int @default(0) @map("password_version")
//
// FILE:       src/lib/auth.ts (replace entire file)
// ============================================================

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ── Secrets ──────────────────────────────────────────────────
const ACCESS_SECRET_ENV = process.env.JWT_SECRET;
const REFRESH_SECRET_ENV = process.env.JWT_REFRESH_SECRET;

if (process.env.NODE_ENV === "production") {
  if (!ACCESS_SECRET_ENV) throw new Error("JWT_SECRET is required in production");
  if (!REFRESH_SECRET_ENV) throw new Error("JWT_REFRESH_SECRET is required in production");
}

const ACCESS_SECRET = ACCESS_SECRET_ENV || "dev-access-secret-change-me";
const REFRESH_SECRET = REFRESH_SECRET_ENV || "dev-refresh-secret-change-me";

const JWT_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

// ── Types ────────────────────────────────────────────────────
interface TokenPayload {
  userId: string;
  role: string;
  passwordVersion: number; // <-- NEW: for session invalidation
}

// ── Password Hashing ─────────────────────────────────────────
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Token Generation (separate secrets) ──────────────────────
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Keep backward compat for middleware (which uses jose, not this function)
export function verifyToken(token: string): TokenPayload | null {
  return verifyAccessToken(token);
}

// ── Cookie Management ────────────────────────────────────────
export async function setAuthCookies(userId: string, role: string, passwordVersion: number) {
  const cookieStore = await cookies();
  const payload: TokenPayload = { userId, role, passwordVersion };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60,
    path: "/",
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

// ── Get Current User (with session invalidation check) ───────
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Try access token first (uses ACCESS_SECRET)
  if (accessToken) {
    const payload = verifyAccessToken(accessToken);
    if (payload) {
      return fetchAndValidateUser(payload);
    }
  }

  // Fallback to refresh token (uses REFRESH_SECRET)
  if (refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload) {
      return fetchAndValidateUser(payload);
    }
  }

  return null;
}

async function fetchAndValidateUser(payload: TokenPayload) {
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      kycStatus: true,
      emailVerifiedAt: true,
      passwordVersion: true, // <-- NEW
    },
  });

  if (!user) return null;

  // SESSION INVALIDATION CHECK:
  // If user changed password (passwordVersion incremented),
  // all tokens with old passwordVersion are now invalid.
  if (user.passwordVersion !== payload.passwordVersion) {
    return null;
  }

  return user;
}

// ── Route Guards ─────────────────────────────────────────────
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

export async function requireVerified() {
  const user = await requireAuth();
  if (!user.emailVerifiedAt) redirect("/verify-email");
  return user;
}
