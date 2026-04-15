import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserKycSection } from "@/components/admin/UserKycSection";
import { BackButton } from "@/components/shared/BackButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatShortDate } from "@/lib/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <BackButton fallback="/admin/users" />

      <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Email" value={user.email} />
            <Row label="Phone" value={user.phone ?? "—"} />
            <Row label="Date of Birth" value={formatShortDate(user.dateOfBirth)} />
            <Row label="Address" value={[user.addressStreet, user.addressCity, user.addressState, user.addressPostcode].filter(Boolean).join(", ") || "—"} />
            <Row label="Country" value={user.countryOfResidence ?? "—"} />
            <Row label="Registered" value={formatShortDate(user.createdAt)} />
          </CardContent>
        </Card>

        <UserKycSection
          userId={user.id}
          kycStatus={user.kycStatus}
          kycProviderRef={user.kycProviderRef}
          kycRejectionReason={user.kycRejectionReason}
        />
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transaction History</CardTitle>
          <Link href={`/admin/transactions?user=${id}`}>
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No transactions yet</p>
        </CardContent>
      </Card>
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
