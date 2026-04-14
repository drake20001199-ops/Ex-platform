import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700">{actionLabel}</Button>
        </Link>
      )}
    </div>
  );
}
