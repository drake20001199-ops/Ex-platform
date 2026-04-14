import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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

  const body = await req.json();
  const allowed = [
    "firstName", "lastName", "phone", "addressStreet",
    "addressCity", "addressState", "addressPostcode",
  ];

  const data: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({ success: true });
}
