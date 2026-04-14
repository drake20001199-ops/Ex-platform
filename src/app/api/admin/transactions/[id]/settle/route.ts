import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { settleTransactionSchema } from "@/lib/validations";
import { getPrices } from "@/lib/crypto-price";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = settleTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { exchangeRate, markupPercentage, finalCustomerRate, cryptoAmount, blockchainTxHash, blockchainTxLink } = parsed.data;

  // Validate finalCustomerRate = exchangeRate * (1 + markup/100) within 1% tolerance
  const expectedFinalRate = exchangeRate * (1 + markupPercentage / 100);
  if (Math.abs(finalCustomerRate - expectedFinalRate) / expectedFinalRate > 0.01) {
    return NextResponse.json(
      { error: "Final customer rate does not match exchange rate + markup calculation" },
      { status: 400 }
    );
  }

  // Validate exchange rate is within ±15% of current market rate
  try {
    const prices = await getPrices();
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (tx) {
      const marketRate = tx.cryptoType === "BTC" ? prices.btc.aud : prices.eth.aud;
      if (marketRate > 0) {
        const deviation = Math.abs(exchangeRate - marketRate) / marketRate;
        if (deviation > 0.15) {
          return NextResponse.json(
            { error: `Exchange rate deviates more than 15% from market rate (A$${marketRate.toFixed(2)})` },
            { status: 400 }
          );
        }
      }
    }
  } catch {
    // If price check fails, proceed but log warning — admin can still settle manually
  }

  // Atomic update: only update if status is PAYMENT_RECEIVED and not yet settled
  // This prevents race conditions and double settlement
  const result = await prisma.transaction.updateMany({
    where: {
      id,
      status: "PAYMENT_RECEIVED",
      settledAt: null,
    },
    data: {
      exchangeRate,
      markupPercentage,
      finalCustomerRate,
      cryptoAmount,
      blockchainTxHash: blockchainTxHash || null,
      blockchainTxLink: blockchainTxLink || null,
      settledAt: new Date(),
    },
  });

  if (result.count === 0) {
    // Determine the reason for failure
    const tx = await prisma.transaction.findUnique({ where: { id } });
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    if (tx.settledAt) return NextResponse.json({ error: "Transaction already settled" }, { status: 409 });
    return NextResponse.json({ error: `Cannot settle: status is ${tx.status}, expected PAYMENT_RECEIVED` }, { status: 400 });
  }

  // Read the settled transaction for audit
  const settled = await prisma.transaction.findUnique({ where: { id } });

  await createAuditLog({
    actorId: admin.id,
    action: "settlement_details_saved",
    entityType: "transaction",
    entityId: id,
    oldValue: {
      exchangeRate: null,
      markupPercentage: null,
      finalCustomerRate: null,
      cryptoAmount: null,
      settledAt: null,
    },
    newValue: {
      exchangeRate,
      markupPercentage,
      finalCustomerRate,
      cryptoAmount,
      blockchainTxHash: blockchainTxHash || null,
      audAmount: settled?.audAmount,
    },
  });

  // Validate cryptoAmount ~ audAmount / finalCustomerRate (within 5% tolerance)
  if (settled) {
    const expectedCrypto = Number(settled.audAmount) / finalCustomerRate;
    const cryptoDeviation = Math.abs(cryptoAmount - expectedCrypto) / expectedCrypto;
    if (cryptoDeviation > 0.05) {
      // Settlement already saved (atomic), but warn admin
      return NextResponse.json({
        success: true,
        warning: `Crypto amount (${cryptoAmount}) deviates ${(cryptoDeviation * 100).toFixed(1)}% from expected (${expectedCrypto.toFixed(8)})`,
      });
    }
  }

  return NextResponse.json({ success: true });
}
