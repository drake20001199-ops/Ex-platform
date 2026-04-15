import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { BackButton } from "@/components/shared/BackButton";
import { ExternalLink, Copy } from "lucide-react";
import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAUD, formatShortDate } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TransactionDetailPage({ params }: Props) {
  const user = await requireAuth();
  const { id } = await params;

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx || tx.userId !== user.id) notFound();

  const audAmount = String(tx.audAmount);
  const cryptoAmount = tx.cryptoAmount ? String(tx.cryptoAmount) : null;
  const finalCustomerRate = tx.finalCustomerRate ? String(tx.finalCustomerRate) : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BackButton fallback="/dashboard/transactions" />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transaction Details</h1>
        <StatusBadge status={tx.status} type="transaction" />
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader><CardTitle>Order Information</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Transaction ID" value={tx.id} copyable />
          <Row label="Cryptocurrency" value={tx.cryptoType} />
          <Row label="AUD Amount" value={formatAUD(audAmount)} />
          <Row label="Crypto Amount" value={cryptoAmount ?? "Pending settlement"} />
          <Row label="Final Rate" value={finalCustomerRate ? formatAUD(finalCustomerRate) : "Pending settlement"} />
          <Row label="Wallet Address" value={tx.walletAddress} copyable />
          <Row label="Created" value={formatShortDate(tx.createdAt)} />
          {tx.settledAt && <Row label="Settled" value={formatShortDate(tx.settledAt)} />}
          {tx.blockchainTxLink && (
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Blockchain</span>
              <a href={tx.blockchainTxLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-blue-400 hover:underline">
                View on Explorer <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 font-mono text-xs">
        {value}
        {copyable && (
          <Copy
            className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => navigator.clipboard.writeText(value)}
          />
        )}
      </span>
    </div>
  );
}
