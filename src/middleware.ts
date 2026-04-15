// ============================================================
// FIX #1: middleware.ts — JWT Verification in Middleware
// ============================================================
// PROBLEM: Old middleware only checked if cookie EXISTS (!!accessToken).
//          An attacker could set a fake cookie value and bypass auth.
// FIX:     Actually verify the JWT signature using jose (Edge-compatible).
//          jsonwebtoken uses Node.js crypto and doesn't work in Edge Runtime.
// INSTALL: npm install jose
// FILE:    src/middleware.ts (replace entire file)
// ============================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/", "/login", "/register", "/forgot-password", "/reset-password",
  "/verify-email", "/terms", "/privacy", "/maintenance",
  "/api/auth", "/api/prices",
];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

// jose needs the secret as Uint8Array
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

async function verifyJWT(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Actually VERIFY the tokens, not just check existence
  let isAuthed = false;
  if (accessToken) {
    isAuthed = await verifyJWT(accessToken);
  }
  if (!isAuthed && refreshToken) {
    isAuthed = await verifyJWT(refreshToken);
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthed && !isPublic(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login/register
  if (isAuthed && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://api.coingecko.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
