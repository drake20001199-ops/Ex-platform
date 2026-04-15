// ============================================================
// FIX M2: src/app/api/admin/users/[id]/kyc/route.ts
// PROBLEM: Admin can reject KYC without providing a reason
// FIX: Require reason when status is REJECTED
// ============================================================

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

  let body: { status?: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status, reason } = body;

  const validStatuses = ["APPROVED", "REJECTED", "NEED_MORE_DOCS"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // FIX: Require reason when rejecting
  if (status === "REJECTED" && (!reason || reason.trim().length === 0)) {
    return NextResponse.json(
      { error: "Rejection reason is required" },
      { status: 400 }
    );
  }

  // Validate reason length
  if (reason && reason.length > 1000) {
    return NextResponse.json(
      { error: "Reason too long (max 1000 characters)" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.user.update({
    where: { id },
    data: {
      kycStatus: status,
      kycRejectionReason: status === "REJECTED" ? reason!.trim() : null,
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
