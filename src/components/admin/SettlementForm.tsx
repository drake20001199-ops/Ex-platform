"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatAUD, formatCrypto } from "@/lib/format";

interface Props {
  transactionId: string;
  audAmount: string;
  cryptoType: string;
  defaultMarkup: number;
}

export function SettlementForm({ transactionId, audAmount, cryptoType, defaultMarkup }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    exchangeRate: "",
    markupPercentage: String(defaultMarkup),
    blockchainTxHash: "",
    blockchainTxLink: "",
  });

  const rate = parseFloat(form.exchangeRate) || 0;
  const markup = parseFloat(form.markupPercentage) || 0;
  const finalRate = rate * (1 + markup / 100);
  const aud = parseFloat(audAmount);
  const cryptoAmount = finalRate > 0 ? aud / finalRate : 0;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transactions/${transactionId}/settle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, cryptoAmount, finalCustomerRate: finalRate }),
      });
      if (!res.ok) { toast.error("Failed to save"); return; }
      toast.success("Settlement details saved");
      window.location.reload();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader><CardTitle>Settlement Details</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Exchange Rate (AUD/{cryptoType})</Label>
              <Input type="number" step="0.01" required value={form.exchangeRate}
                onChange={(e) => setForm({ ...form, exchangeRate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Markup %</Label>
              <Input type="number" step="0.1" required value={form.markupPercentage}
                onChange={(e) => setForm({ ...form, markupPercentage: e.target.value })} />
            </div>
          </div>

          {rate > 0 && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Final Customer Rate</span><span>{formatAUD(finalRate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Customer Receives</span><span className="font-bold text-blue-400">{formatCrypto(cryptoAmount)} {cryptoType}</span></div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Blockchain TX Hash</Label>
            <Input value={form.blockchainTxHash} placeholder="Transaction hash..."
              onChange={(e) => setForm({ ...form, blockchainTxHash: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Blockchain TX Link</Label>
            <Input value={form.blockchainTxLink} placeholder="https://blockchair.com/..."
              onChange={(e) => setForm({ ...form, blockchainTxLink: e.target.value })} />
          </div>

          <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Settlement
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
