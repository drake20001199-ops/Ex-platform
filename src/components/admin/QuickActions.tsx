import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, CreditCard } from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/admin/users?kyc=pending">
        <Button variant="outline" className="gap-2">
          <ShieldCheck className="h-4 w-4" /> View Pending KYC
        </Button>
      </Link>
      <Link href="/admin/transactions?status=CREATED">
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" /> View New Orders
        </Button>
      </Link>
      <Link href="/admin/transactions?status=AWAITING_PAYMENT">
        <Button variant="outline" className="gap-2">
          <CreditCard className="h-4 w-4" /> View Awaiting Payment
        </Button>
      </Link>
    </div>
  );
}
