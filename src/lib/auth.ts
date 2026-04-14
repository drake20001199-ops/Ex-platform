import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const JWT_SECRET = JWT_SECRET_ENV || "dev-secret-change-me";

const JWT_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";

interface TokenPayload {
  userId: string;
  role: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookies(userId: string, role: string) {
  const cookieStore = await cookies();
  const accessToken = generateAccessToken({ userId, role });
  const refreshToken = generateRefreshToken({ userId, role });

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

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  let payload = accessToken ? verifyToken(accessToken) : null;

  if (!payload) {
    const refreshToken = cookieStore.get("refresh_token")?.value;
    if (!refreshToken) return null;
    payload = verifyToken(refreshToken);
    if (!payload) return null;
    await setAuthCookies(payload.userId, payload.role);
  }

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
    },
  });

  return user;
}

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
