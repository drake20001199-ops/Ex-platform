import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog, createActivityEvent } from "@/lib/audit";
import { sendKycApprovedEmail, sendKycRejectedEmail } from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { status, reason } = await req.json();

  const validStatuses = ["APPROVED", "REJECTED", "NEED_MORE_DOCS"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.update({
    where: { id },
    data: {
      kycStatus: status,
      kycRejectionReason: status === "REJECTED" ? reason : null,
    },
  });

  await createAuditLog({
    actorId: admin.id,
    action: "kyc_status_changed",
    entityType: "user",
    entityId: id,
    oldValue: { kycStatus: user.kycStatus },
    newValue: { kycStatus: status, reason },
  });

  await createActivityEvent({
    eventType: "kyc_status_changed",
    userId: id,
    description: `KYC ${status.toLowerCase()} for ${user.firstName} ${user.lastName}`,
  });

  if (status === "APPROVED") {
    await sendKycApprovedEmail(user.email, user.firstName);
  } else if (status === "REJECTED") {
    await sendKycRejectedEmail(user.email, user.firstName, reason || "");
  }

  return NextResponse.json({ success: true });
}
