"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "ALL", label: "All" },
  { key: "CREATED", label: "New Orders" },
  { key: "AWAITING_PAYMENT", label: "Awaiting Payment" },
  { key: "PAYMENT_RECEIVED", label: "Ready to Process" },
  { key: "CRYPTO_SENT", label: "Crypto Sent" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

interface Props {
  counts: Record<string, number>;
}

export function TransactionStatusTabs({ counts }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("status") || "ALL";

  function setTab(key: string) {
    const params = new URLSearchParams(searchParams);
    if (key === "ALL") params.delete("status");
    else params.set("status", key);
    router.push(`/admin/transactions?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const count = tab.key === "ALL"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[tab.key] || 0;
        return (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition",
              active === tab.key
                ? "bg-blue-600/20 text-blue-400"
                : "text-muted-foreground hover:bg-white/5"
            )}
          >
            {tab.label}
            <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
