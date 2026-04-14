"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Send, CreditCard, CheckCircle, XCircle, Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  transactionId: string;
  status: string;
  hasTxHash: boolean;
}

export function TransactionActions({ transactionId, status, hasTxHash }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(newStatus: string, reason?: string) {
    setLoading(newStatus);
    try {
      const res = await fetch(`/api/admin/transactions/${transactionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      if (!res.ok) { toast.error("Failed to update"); return; }
      toast.success(`Status updated to ${newStatus.toLowerCase().replace("_", " ")}`);
      window.location.reload();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "CREATED" && (
        <Button onClick={() => updateStatus("AWAITING_PAYMENT")} className="gap-1 bg-blue-600 hover:bg-blue-700"
          disabled={loading === "AWAITING_PAYMENT"}>
          {loading === "AWAITING_PAYMENT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send BSB & Mark Awaiting
        </Button>
      )}
      {status === "AWAITING_PAYMENT" && (
        <Button onClick={() => updateStatus("PAYMENT_RECEIVED")} className="gap-1 bg-purple-600 hover:bg-purple-700"
          disabled={loading === "PAYMENT_RECEIVED"}>
          {loading === "PAYMENT_RECEIVED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          Mark Payment Received
        </Button>
      )}
      {status === "PAYMENT_RECEIVED" && hasTxHash && (
        <Button onClick={() => updateStatus("CRYPTO_SENT")} className="gap-1 bg-cyan-600 hover:bg-cyan-700"
          disabled={loading === "CRYPTO_SENT"}>
          {loading === "CRYPTO_SENT" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Package className="h-4 w-4" />}
          Mark Crypto Sent
        </Button>
      )}
      {status === "CRYPTO_SENT" && (
        <Button onClick={() => updateStatus("COMPLETED")} className="gap-1 bg-green-600 hover:bg-green-700"
          disabled={loading === "COMPLETED"}>
          {loading === "COMPLETED" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Mark Completed
        </Button>
      )}
      {status !== "COMPLETED" && status !== "CANCELLED" && (
        <Button variant="destructive" className="gap-1"
          onClick={() => {
            const reason = prompt("Enter cancellation reason:");
            if (reason) updateStatus("CANCELLED", reason);
          }}>
          <XCircle className="h-4 w-4" /> Cancel
        </Button>
      )}
    </div>
  );
}
