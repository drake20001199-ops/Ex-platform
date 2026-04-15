import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TransactionActions } from "@/components/admin/TransactionActions";
import { SettlementForm } from "@/components/admin/SettlementForm";
import { BackButton } from "@/components/shared/BackButton";
import { ExternalLink, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAUD, formatShortDate } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminTransactionDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  if (!tx) notFound();

  const audAmount = String(tx.audAmount);
  const cryptoAmount = tx.cryptoAmount ? String(tx.cryptoAmount) : null;
  const exchangeRate = tx.exchangeRate ? String(tx.exchangeRate) : null;
  const finalCustomerRate = tx.finalCustomerRate ? String(tx.finalCustomerRate) : null;
  const ttrThreshold = 10000;
  const isTTR = Number(tx.audAmount) >= ttrThreshold;

  return (
    <div className="space-y-6">
      <BackButton fallback="/admin/transactions" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction Detail</h1>
          <p className="font-mono text-sm text-muted-foreground">{tx.id}</p>
        </div>
        <div className="flex items-center gap-2">
          {isTTR && (
            <span className="flex items-center gap-1 rounded bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">
              <AlertTriangle className="h-3 w-3" /> TTR
            </span>
          )}
          <StatusBadge status={tx.status} type="transaction" />
        </div>
      </div>

      <TransactionActions
        transactionId={tx.id}
        status={tx.status}
        hasTxHash={!!tx.blockchainTxHash}
      />

      {/* Customer info */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Name" value={`${tx.user.firstName} ${tx.user.lastName}`} />
          <Row label="Email" value={tx.user.email} />
        </CardContent>
      </Card>

      {/* Order info */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader><CardTitle>Order Information</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Crypto Type" value={tx.cryptoType} />
          <Row label="AUD Amount" value={formatAUD(audAmount)} />
          <Row label="Wallet Address" value={tx.walletAddress} />
          <Row label="Status" value={tx.status} />
          <Row label="Created" value={formatShortDate(tx.createdAt)} />
          {tx.bsbSentAt && <Row label="BSB Sent" value={formatShortDate(tx.bsbSentAt)} />}
          {tx.settledAt && <Row label="Settled" value={formatShortDate(tx.settledAt)} />}
        </CardContent>
      </Card>

      {/* Settlement */}
      {(tx.status === "PAYMENT_RECEIVED" || cryptoAmount) && (
        <Card className="border-white/10 bg-white/5">
          <CardHeader><CardTitle>Settlement Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {exchangeRate && <Row label="Exchange Rate" value={formatAUD(exchangeRate)} />}
            {finalCustomerRate && <Row label="Customer Rate" value={formatAUD(finalCustomerRate)} />}
            {cryptoAmount && <Row label="Crypto Amount" value={`${cryptoAmount} ${tx.cryptoType}`} />}
            {tx.blockchainTxLink && (
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Blockchain TX</span>
                <a href={tx.blockchainTxLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:underline">
                  View on Explorer <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settlement form — shown when payment received */}
      {tx.status === "PAYMENT_RECEIVED" && (
        <SettlementForm
          transactionId={tx.id}
          audAmount={audAmount}
          cryptoType={tx.cryptoType}
          defaultMarkup={3}
        />
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
