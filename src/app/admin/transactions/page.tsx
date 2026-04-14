import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TransactionStatusTabs } from "@/components/admin/TransactionStatusTabs";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ArrowLeftRight, Download, Search, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAUD, formatShortDate } from "@/lib/format";

export default async function AdminTransactionsPage() {
  await requireAdmin();

  const transactions = await prisma.transaction.findMany({
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const counts: Record<string, number> = {};
  for (const tx of transactions) {
    counts[tx.status] = (counts[tx.status] ?? 0) + 1;
  }

  const ttrThreshold = 10000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Transaction Management</h1>
          <p className="text-muted-foreground">Process orders and manage transactions</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      <TransactionStatusTabs counts={counts} />

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, email, or transaction ID..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState icon={ArrowLeftRight} title="No Transactions" description="Transactions will appear here when customers place orders." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Amount</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3">
                        <Link href={`/admin/transactions/${tx.id}`} className="font-mono text-xs text-blue-400 hover:underline">
                          {tx.id.slice(0, 8)}...
                        </Link>
                        {Number(tx.audAmount) >= ttrThreshold && (
                          <span title="TTR threshold"><AlertTriangle className="ml-1 inline h-3 w-3 text-yellow-400" /></span>
                        )}
                      </td>
                      <td className="py-3">
                        <div>{tx.user.firstName} {tx.user.lastName}</div>
                        <div className="text-xs text-muted-foreground">{tx.user.email}</div>
                      </td>
                      <td className="py-3">{tx.cryptoType}</td>
                      <td className="py-3">{formatAUD(String(tx.audAmount))}</td>
                      <td className="py-3"><StatusBadge status={tx.status} type="transaction" /></td>
                      <td className="py-3 text-muted-foreground">{formatShortDate(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
