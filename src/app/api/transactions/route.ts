import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createTransactionSchema, validateWalletAddress } from "@/lib/validations";
import { createActivityEvent } from "@/lib/audit";
import { getSetting } from "@/lib/settings";
import { rateLimit } from "@/lib/rate-limit";

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

    const { allowed } = rateLimit(`tx:${user.id}`, 3, 60 * 1000); // 3 per minute
    if (!allowed) {
      return NextResponse.json({ error: "Too many orders. Please wait before creating another." }, { status: 429 });
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

    const enabled = await getSetting(cryptoType === "BTC" ? "btc_trading_enabled" : "eth_trading_enabled");
    if (enabled !== "true") {
      return NextResponse.json({ error: `${cryptoType} trading is currently disabled` }, { status: 400 });
    }

    // Check for duplicate idempotency key (prevents double-submit)
    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return NextResponse.json({ id: existing.id, success: true }, { status: 200 });
    }

    const tx = await prisma.transaction.create({
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
      entityId: tx.id,
      description: `New ${cryptoType} order for A$${audAmount}`,
    });

    return NextResponse.json({ id: tx.id, success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
