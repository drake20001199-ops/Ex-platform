import { Users, ShieldCheck, ArrowLeftRight, CheckCircle, DollarSign, Bitcoin, TrendingUp } from "lucide-react";
import { StatsGrid } from "@/components/admin/StatsCards";
import { QuickActions } from "@/components/admin/QuickActions";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { formatAUD } from "@/lib/format";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPrices } from "@/lib/crypto-price";

export default async function AdminDashboard() {
  await requireAdmin();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers, verifiedUsers, pendingKyc,
    activeTxns, completedToday, volumeAgg,
    prices, recentEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { kycStatus: "APPROVED" } }),
    prisma.user.count({ where: { kycStatus: "IN_REVIEW" } }),
    prisma.transaction.count({ where: { status: { in: ["CREATED", "AWAITING_PAYMENT", "PAYMENT_RECEIVED", "CRYPTO_SENT"] } } }),
    prisma.transaction.count({ where: { status: "COMPLETED", settledAt: { gte: todayStart } } }),
    prisma.transaction.aggregate({ where: { status: "COMPLETED" }, _sum: { audAmount: true } }),
    getPrices(),
    prisma.activityEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  const totalVolume = Number(volumeAgg._sum.audAmount ?? 0);

  const stats = [
    { title: "Total Users", value: totalUsers, icon: Users },
    { title: "Verified Users", value: verifiedUsers, icon: ShieldCheck },
    { title: "Pending KYC", value: pendingKyc, icon: ShieldCheck, description: "Awaiting review" },
    { title: "Active Transactions", value: activeTxns, icon: ArrowLeftRight },
    { title: "Completed Today", value: completedToday, icon: CheckCircle },
    { title: "Total Volume (AUD)", value: formatAUD(totalVolume), icon: DollarSign },
    { title: "BTC Rate (AUD)", value: formatAUD(prices.btc.aud), icon: Bitcoin },
    { title: "ETH Rate (AUD)", value: formatAUD(prices.eth.aud), icon: TrendingUp },
  ];

  const events = recentEvents.map((e) => ({
    id: e.id,
    eventType: e.eventType,
    description: e.description,
    createdAt: e.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and quick actions</p>
      </div>

      <StatsGrid stats={stats} />
      <QuickActions />
      <ActivityFeed events={events} />
    </div>
  );
}
