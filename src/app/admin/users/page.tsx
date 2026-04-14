import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users, Download, Search } from "lucide-react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatShortDate } from "@/lib/format";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: { _count: { select: { transactions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">{users.length} users registered</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Excel
        </Button>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by name or email..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <EmptyState icon={Users} title="No Users Yet" description="Users will appear here once they register." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">KYC Status</th>
                    <th className="pb-3 font-medium">Transactions</th>
                    <th className="pb-3 font-medium">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3">
                        <Link href={`/admin/users/${u.id}`} className="text-blue-400 hover:underline">
                          {u.firstName} {u.lastName}
                        </Link>
                      </td>
                      <td className="py-3">{u.email}</td>
                      <td className="py-3"><StatusBadge status={u.kycStatus} type="kyc" /></td>
                      <td className="py-3">{u._count.transactions}</td>
                      <td className="py-3 text-muted-foreground">{formatShortDate(u.createdAt)}</td>
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
