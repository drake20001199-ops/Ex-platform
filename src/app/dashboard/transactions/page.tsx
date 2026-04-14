import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { History } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatAUD, formatShortDate } from "@/lib/format";

export default async function TransactionsPage() {
  const user = await requireAuth();

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      {transactions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Transactions Yet"
          description="Once you place your first order, it will appear here."
          actionLabel="Buy Crypto"
          actionHref="/dashboard/buy"
        />
      ) : (
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <p className="text-sm text-muted-foreground">{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
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
                        <Link href={`/dashboard/transactions/${tx.id}`} className="text-blue-400 hover:underline">
                          {tx.cryptoType}
                        </Link>
                      </td>
                      <td className="py-3">{formatAUD(String(tx.audAmount))}</td>
                      <td className="py-3"><StatusBadge status={tx.status} type="transaction" /></td>
                      <td className="py-3 text-muted-foreground">{formatShortDate(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
