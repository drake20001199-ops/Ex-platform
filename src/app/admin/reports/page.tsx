"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader2, Users, ArrowLeftRight, BarChart3, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const REPORTS = [
  { key: "customers", label: "Customer Report", icon: Users, description: "All user data, KYC status, volume" },
  { key: "transactions", label: "Transaction Report", icon: ArrowLeftRight, description: "Full transaction details with rates" },
  { key: "volume", label: "Volume Summary", icon: BarChart3, description: "Aggregated totals by period" },
  { key: "ttr", label: "TTR Report", icon: AlertTriangle, description: "Transactions ≥ TTR threshold" },
];

export default function AdminReportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  async function generateReport(key: string) {
    setLoading(key);
    try {
      const params = new URLSearchParams({ type: key });
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) { toast.error("Failed to generate"); return; }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${key}-report.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports</h1>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>Date Range Filter</CardTitle>
          <CardDescription>Applied to all reports below</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {REPORTS.map((report) => (
          <Card key={report.key} className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <report.icon className="h-5 w-5 text-blue-400" />
                {report.label}
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => generateReport(report.key)} className="w-full gap-2"
                variant="outline" disabled={loading === report.key}>
                {loading === report.key
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Download className="h-4 w-4" />}
                Generate & Download
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
