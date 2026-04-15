// ============================================================
// FIX M3: src/app/api/admin/transactions/[id]/status/route.ts
// PROBLEM: settledAt logic — `updateData.settledAt = updateData.settledAt || new Date()`
//          always sets new Date() because updateData.settledAt is undefined.
//          settledAt should only be set by the settle endpoint, not by COMPLETED status.
// FIX: Remove settledAt from COMPLETED transition (settle route handles it).
//      Also add email verify check on transactions POST.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog, createActivityEvent } from "@/lib/audit";
import { sendTransactionStatusEmail } from "@/lib/email";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  CREATED: ["AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_PAYMENT: ["PAYMENT_RECEIVED", "CANCELLED"],
  PAYMENT_RECEIVED: ["CRYPTO_SENT", "CANCELLED"],
  CRYPTO_SENT: ["COMPLETED", "CANCELLED"],
};

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

  if (!status || typeof status !== "string") {
    return NextResponse.json({ error: "Status is required" }, { status: 400 });
  }

  if (reason && reason.length > 1000) {
    return NextResponse.json({ error: "Reason too long (max 1000 characters)" }, { status: 400 });
  }

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const allowed = VALID_TRANSITIONS[tx.status] || [];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: `Cannot transition from ${tx.status} to ${status}` }, { status: 400 });
  }

  if (status === "CRYPTO_SENT" && !tx.blockchainTxHash) {
    return NextResponse.json({ error: "TX hash required before marking crypto sent" }, { status: 400 });
  }

  // FIX: COMPLETED requires that settlement was already done
  if (status === "COMPLETED" && !tx.settledAt) {
    return NextResponse.json(
      { error: "Cannot complete — settlement details not yet entered. Use the settle form first." },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = { status };
  if (status === "AWAITING_PAYMENT") updateData.bsbSentAt = new Date();
  // FIX: Removed settledAt from here — it's set by the settle endpoint
  if (status === "CANCELLED") {
    updateData.cancelledAt = new Date();
    updateData.cancelledReason = (reason || "Admin cancelled").slice(0, 1000);
  }

  const result = await prisma.transaction.updateMany({
    where: { id, status: tx.status },
    data: updateData,
  });

  if (result.count === 0) {
    return NextResponse.json(
      { error: "Transaction was modified by another operation. Please refresh and try again." },
      { status: 409 }
    );
  }

  const txUser = await prisma.user.findUnique({
    where: { id: tx.userId },
    select: { email: true, firstName: true },
  });

  await createAuditLog({
    actorId: admin.id,
    action: "transaction_status_changed",
    entityType: "transaction",
    entityId: id,
    oldValue: { status: tx.status },
    newValue: { status, reason },
  });

  await createActivityEvent({
    eventType: "transaction_status_changed",
    userId: tx.userId,
    entityId: id,
    description: `Transaction ${id.slice(0, 8)} changed to ${status.toLowerCase().replaceAll("_", " ")}`,
  });

  if (txUser) {
    try {
      await sendTransactionStatusEmail(txUser.email, txUser.firstName, id, status, {
        txLink: tx.blockchainTxLink || undefined,
      });
    } catch {
      // Email failure should not block status update
    }
  }

  return NextResponse.json({ success: true });
}
