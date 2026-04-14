import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

interface ActivityItem {
  id: string;
  eventType: string;
  description: string;
  createdAt: string;
}

const EVENT_ICONS: Record<string, string> = {
  user_registered: "👤",
  kyc_status_changed: "🛡️",
  transaction_created: "📄",
  transaction_status_changed: "🔄",
};

export function ActivityFeed({ events }: { events: ActivityItem[] }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0">
                <span className="text-lg">{EVENT_ICONS[event.eventType] || "📋"}</span>
                <div className="flex-1">
                  <p className="text-sm">{event.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
