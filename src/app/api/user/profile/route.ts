// ============================================================
// FIX #5: src/app/api/user/profile/route.ts — Add Zod Validation
// ============================================================
// PROBLEM: PATCH accepts any value for any allowed field.
//          User can set firstName to empty string, phone to 99999 chars,
//          addressPostcode to script tags, etc.
// FIX:     Validate with Zod schema. Trim & sanitize all string inputs.
// FILE:    src/app/api/user/profile/route.ts (replace entire file)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Strict validation for profile fields
const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name too long")
    .optional(),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name too long")
    .optional(),
  phone: z
    .string()
    .trim()
    .min(6, "Phone number too short")
    .max(20, "Phone number too long")
    .regex(/^[+\d\s()-]+$/, "Invalid phone number format")
    .optional(),
  addressStreet: z
    .string()
    .trim()
    .min(1, "Street address is required")
    .max(200, "Street address too long")
    .optional(),
  addressCity: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City name too long")
    .optional(),
  addressState: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(50, "State name too long")
    .optional(),
  addressPostcode: z
    .string()
    .trim()
    .min(3, "Postcode too short")
    .max(10, "Postcode too long")
    .regex(/^[\d\w\s-]+$/, "Invalid postcode format")
    .optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true, firstName: true, lastName: true, email: true, phone: true,
      dateOfBirth: true, addressStreet: true, addressCity: true,
      addressState: true, addressPostcode: true, countryOfResidence: true,
      citizenship: true, taxStatus: true, sourceOfFunds: true, purpose: true,
      kycStatus: true, createdAt: true,
    },
  });

  return NextResponse.json(full);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // VALIDATE with Zod — rejects any invalid data
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Only include fields that were actually provided
  const data: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) data[key] = value;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ success: true });
}
