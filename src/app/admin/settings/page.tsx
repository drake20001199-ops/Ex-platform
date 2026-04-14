"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({ ...DEFAULT_SETTINGS });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setForm((prev) => ({ ...prev, ...data })))
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setFetching(false));
  }, []);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { toast.error("Failed to save"); return; }
      toast.success("Settings saved");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Platform Settings</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <PricingCard form={form} set={set} />
        <LimitsCard form={form} set={set} />
        <TogglesCard form={form} set={set} />
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Settings
        </Button>
      </form>
    </div>
  );
}

function PricingCard({ form, set }: { form: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
        <CardDescription>Configure markup percentages for conversions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Global Markup %</Label>
          <Input type="number" step="0.1" value={form.global_markup_percent} onChange={(e) => set("global_markup_percent", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>BTC Markup Override %</Label>
            <Input type="number" step="0.1" placeholder="Uses global if empty" value={form.btc_markup_override} onChange={(e) => set("btc_markup_override", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>ETH Markup Override %</Label>
            <Input type="number" step="0.1" placeholder="Uses global if empty" value={form.eth_markup_override} onChange={(e) => set("eth_markup_override", e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LimitsCard({ form, set }: { form: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle>Transaction Limits</CardTitle>
        <CardDescription>Set minimum, maximum, and alert thresholds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minimum (AUD)</Label>
            <Input type="number" value={form.min_transaction_aud} onChange={(e) => set("min_transaction_aud", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Maximum (AUD)</Label>
            <Input type="number" value={form.max_transaction_aud} onChange={(e) => set("max_transaction_aud", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>TTR Threshold (AUD)</Label>
            <Input type="number" value={form.ttr_threshold_aud} onChange={(e) => set("ttr_threshold_aud", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Order Timeout (Hours)</Label>
            <Input type="number" value={form.order_timeout_hours} onChange={(e) => set("order_timeout_hours", e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TogglesCard({ form, set }: { form: Record<string, string>; set: (k: string, v: string) => void }) {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader><CardTitle>Toggles</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Toggle label="BTC Trading Enabled" value={form.btc_trading_enabled === "true"} onChange={(v) => set("btc_trading_enabled", String(v))} />
        <Toggle label="ETH Trading Enabled" value={form.eth_trading_enabled === "true"} onChange={(v) => set("eth_trading_enabled", String(v))} />
        <Toggle label="Maintenance Mode" value={form.maintenance_mode === "true"} onChange={(v) => set("maintenance_mode", String(v))} description="Customer-facing site will show maintenance page" />
      </CardContent>
    </Card>
  );
}

function Toggle({ label, value, onChange, description }: {
  label: string; value: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
