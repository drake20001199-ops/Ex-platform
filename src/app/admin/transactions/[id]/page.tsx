import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TransactionActions } from "@/components/admin/TransactionActions";
import { SettlementForm } from "@/components/admin/SettlementForm";
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";
import Link from "next/link";
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
      <Link href="/admin/transactions" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Transactions
      </Link>

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

      <TransactionActions transactionId={tx.id} status={tx.status} hasTxHash={!!tx.blockchainTxHash} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader><CardTitle>Order Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Customer" value={`${tx.user.firstName} ${tx.user.lastName}`} link={`/admin/users/${tx.user.id}`} />
            <Row label="Email" value={tx.user.email} />
            <Row label="Crypto" value={tx.cryptoType} />
            <Row label="AUD Amount" value={formatAUD(audAmount)} />
            {exchangeRate && <Row label="Exchange Rate" value={formatAUD(exchangeRate)} />}
            {cryptoAmount && <Row label="Crypto Amount" value={cryptoAmount} />}
            {finalCustomerRate && <Row label="Customer Rate" value={formatAUD(finalCustomerRate)} />}
            <Row label="Wallet" value={tx.walletAddress} />
            <Row label="Created" value={formatShortDate(tx.createdAt)} />
            {tx.settledAt && <Row label="Settled" value={formatShortDate(tx.settledAt)} />}
            {tx.blockchainTxLink && (
              <div className="flex justify-between border-b border-white/5 py-2">
                <span className="text-muted-foreground">Blockchain</span>
                <a href={tx.blockchainTxLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-400">
                  View <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {tx.status === "PAYMENT_RECEIVED" && (
          <SettlementForm transactionId={tx.id} audAmount={audAmount} cryptoType={tx.cryptoType} defaultMarkup={3} />
        )}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader><CardTitle>Admin Notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea defaultValue={tx.adminNotes || ""} placeholder="Internal notes about this transaction..." rows={4} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      {link ? (
        <Link href={link} className="text-blue-400 hover:underline">{value}</Link>
      ) : (
        <span className="font-mono text-xs">{value}</span>
      )}
    </div>
  );
}
