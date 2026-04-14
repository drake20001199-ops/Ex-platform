"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CheckCircle, XCircle, FileQuestion } from "lucide-react";
import { toast } from "sonner";

interface Props {
  userId: string;
  kycStatus: string;
  kycProviderRef: string | null;
  kycRejectionReason: string | null;
}

export function UserKycSection({ userId, kycStatus, kycProviderRef, kycRejectionReason }: Props) {
  async function updateKyc(status: string, reason?: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/kyc`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (!res.ok) {
        toast.error("Failed to update KYC");
        return;
      }
      toast.success(`KYC ${status.toLowerCase()}`);
      window.location.reload();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          KYC Verification
          <StatusBadge status={kycStatus} type="kyc" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {kycProviderRef && (
          <div className="text-sm">
            <span className="text-muted-foreground">Provider Ref: </span>
            <span className="font-mono">{kycProviderRef}</span>
          </div>
        )}
        {kycRejectionReason && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            Rejection reason: {kycRejectionReason}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700"
            onClick={() => updateKyc("APPROVED")}>
            <CheckCircle className="h-4 w-4" /> Approve KYC
          </Button>
          <Button size="sm" variant="destructive" className="gap-1"
            onClick={() => {
              const reason = prompt("Enter rejection reason:");
              if (reason) updateKyc("REJECTED", reason);
            }}>
            <XCircle className="h-4 w-4" /> Reject KYC
          </Button>
          <Button size="sm" variant="outline" className="gap-1"
            onClick={() => updateKyc("NEED_MORE_DOCS")}>
            <FileQuestion className="h-4 w-4" /> Request More Docs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
