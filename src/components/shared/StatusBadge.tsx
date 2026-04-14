import { Badge } from "@/components/ui/badge";
import { KYC_STATUS_COLORS, KYC_STATUS_LABELS, TX_STATUS_COLORS, TRANSACTION_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  status: string;
  type: "kyc" | "transaction";
}

export function StatusBadge({ status, type }: Props) {
  const colors = type === "kyc" ? KYC_STATUS_COLORS : TX_STATUS_COLORS;
  const labels = type === "kyc" ? KYC_STATUS_LABELS : TRANSACTION_STATUS_LABELS;

  return (
    <Badge variant="secondary" className={cn("font-medium", colors[status])}>
      {labels[status] || status}
    </Badge>
  );
}
