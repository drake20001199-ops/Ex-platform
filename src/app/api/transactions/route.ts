// ============================================================
// FIX M4: src/app/api/transactions/route.ts
// PROBLEM: Only checks kycStatus but not emailVerifiedAt.
//          A user with approved KYC but unverified email could create orders.
// FIX: Add emailVerifiedAt check before allowing transaction creation.
//      Also migrate to rateLimitAsync.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createTransactionSchema, validateWalletAddress } from "@/lib/validations";
import { createActivityEvent } from "@/lib/audit";
import { getSetting } from "@/lib/settings";
import { rateLimitAsync } from "@/lib/rate-limit";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        cryptoType: true,
        audAmount: true,
        cryptoAmount: true,
        walletAddress: true,
        status: true,
        createdAt: true,
        settledAt: true,
      },
    });

    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // FIX: Rate limit with Redis
    const { allowed } = await rateLimitAsync(`tx:${user.id}`, 3, 60 * 1000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many orders. Please wait before creating another." }, { status: 429 });
    }

    // FIX: Check email verification
    if (!user.emailVerifiedAt) {
      return NextResponse.json({ error: "Please verify your email before placing orders" }, { status: 403 });
    }

    if (user.kycStatus !== "APPROVED") {
      return NextResponse.json({ error: "KYC not approved" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createTransactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { cryptoType, audAmount, walletAddress, idempotencyKey } = parsed.data;

    if (!validateWalletAddress(walletAddress, cryptoType)) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 });
    }

    const minAud = parseFloat(await getSetting("min_transaction_aud"));
    const maxAud = parseFloat(await getSetting("max_transaction_aud"));
    if (audAmount < minAud) return NextResponse.json({ error: `Minimum amount is AUD ${minAud}` }, { status: 400 });
    if (audAmount > maxAud) return NextResponse.json({ error: `Maximum amount is AUD ${maxAud}` }, { status: 400 });

    const enabled = await getSetting(cryptoType === "BTC" ? "btc_enabled" : "eth_enabled");
    if (enabled !== "true") {
      return NextResponse.json({ error: `${cryptoType} trading is currently disabled` }, { status: 400 });
    }

    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return NextResponse.json({ id: existing.id, duplicate: true });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        cryptoType,
        audAmount,
        walletAddress,
        idempotencyKey,
      },
    });

    await createActivityEvent({
      eventType: "transaction_created",
      userId: user.id,
      entityId: transaction.id,
      description: `New ${cryptoType} order for A$${audAmount}`,
    });

    return NextResponse.json({ id: transaction.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
