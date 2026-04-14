import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, History, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function CustomerDashboard() {
  const user = await requireAuth();
  const txCount = await prisma.transaction.count({ where: { userId: user.id } });
  const kycApproved = user.kycStatus === "APPROVED";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.firstName}</h1>
          <p className="text-muted-foreground">Manage your crypto purchases</p>
        </div>
        <Badge
          variant="secondary"
          className={kycApproved ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}
        >
          {kycApproved ? "Verified" : "Unverified"}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">KYC Status</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{kycApproved ? "Approved" : "Pending"}</p>
            {!kycApproved && (
              <Link href="/dashboard/kyc">
                <Button size="sm" variant="outline" className="mt-2">Complete Verification</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{txCount}</p>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Buy Crypto</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/buy">
              <Button className="bg-blue-600 hover:bg-blue-700" disabled={!kycApproved}>
                Buy Now
              </Button>
            </Link>
            {!kycApproved && (
              <p className="mt-2 text-xs text-muted-foreground">Complete KYC first</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
