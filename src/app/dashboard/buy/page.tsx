"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { formatAUD, formatAUDShort, formatUSD } from "@/lib/format";
import { validateWalletAddress } from "@/lib/validations";
import Link from "next/link";

// ── Proper crypto symbols ─────────────────────────────────────
// ₿ = Unicode Bitcoin sign (U+20BF)
// Ξ = Greek capital Xi, used as Ethereum symbol
function CryptoSymbol({ type }: { type: "BTC" | "ETH" }) {
  if (type === "BTC") {
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-sm font-bold text-orange-400">
        ₿
      </span>
    );
  }
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-400">
      Ξ
    </span>
  );
}

export default function BuyCryptoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);
  const [prices, setPrices] = useState({
    btc: { aud: 0, usd: 0, change24h: 0 },
    eth: { aud: 0, usd: 0, change24h: 0 },
  });
  const [form, setForm] = useState({
    cryptoType: "BTC" as "BTC" | "ETH",
    audAmount: "",
    walletAddress: "",
    acceptedTerms: false,
  });

  useEffect(() => {
    fetch("/api/prices")
      .then((r) => r.json())
      .then((d) => { setPrices({ btc: d.btc, eth: d.eth }); setPricesLoaded(true); })
      .catch(() => setPricesLoaded(true));
  }, []);

  const current = form.cryptoType === "BTC" ? prices.btc : prices.eth;
  const indicativeRate = current.aud;
  const amount = parseFloat(form.audAmount) || 0;
  const markupMultiplier = 1.03;
  const estimated = indicativeRate > 0 && amount > 0 ? amount / (indicativeRate * markupMultiplier) : 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount < 2000) { toast.error("Minimum amount is AUD 2,000"); return; }
    if (!form.acceptedTerms) { toast.error("You must accept the terms"); return; }
    if (!validateWalletAddress(form.walletAddress, form.cryptoType)) {
      toast.error(`Invalid ${form.cryptoType} wallet address format`);
      return;
    }
    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, audAmount: amount, idempotencyKey }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to create order"); return; }
      toast.success("Order created! Check your email for payment details.");
      router.push(`/dashboard/transactions/${data.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buy Crypto</h1>
        <p className="text-muted-foreground">Purchase BTC or ETH with AUD bank transfer</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(["BTC", "ETH"] as const).map((coin) => {
          const p = coin === "BTC" ? prices.btc : prices.eth;
          const up = p.change24h >= 0;
          return (
            <Card key={coin} className="border-white/10 bg-white/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CryptoSymbol type={coin} />
                  <span className="text-sm font-medium">{coin === "BTC" ? "Bitcoin" : "Ethereum"}</span>
                  {pricesLoaded && (
                    <span className={`ml-auto flex items-center gap-0.5 text-xs font-medium ${up ? "text-green-400" : "text-red-400"}`}>
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(p.change24h).toFixed(2)}%
                    </span>
                  )}
                </div>
                {pricesLoaded ? (
                  <>
                    {/* Primary price — AUD (already includes "AUD" suffix from formatAUD) */}
                    <p className="mt-2 text-lg font-bold">{formatAUD(p.aud)}</p>
                    {/* Secondary price — USD reference */}
                    <p className="text-xs text-muted-foreground">{formatUSD(p.usd)} USD</p>
                  </>
                ) : (
                  <>
                    <div className="mt-2 h-6 w-28 animate-pulse rounded bg-white/10" />
                    <div className="mt-1 h-4 w-24 animate-pulse rounded bg-white/5" />
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle>New Order</CardTitle>
          <CardDescription>Rates are indicative and finalised at settlement</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Select Cryptocurrency</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["BTC", "ETH"] as const).map((c) => (
                  <button key={c} type="button"
                    onClick={() => setForm({ ...form, cryptoType: c })}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${
                      form.cryptoType === c
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-white/10 hover:border-white/20"
                    }`}>
                    <CryptoSymbol type={c} />
                    {c === "BTC" ? "Bitcoin" : "Ethereum"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audAmount">AUD Amount (min $2,000)</Label>
              <Input id="audAmount" type="number" min="2000" step="100" required placeholder="5000"
                value={form.audAmount} onChange={(e) => setForm({ ...form, audAmount: e.target.value })} />
            </div>

            {amount > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Indicative Rate</span>
                  {/* Use Short version — context ("per BTC") makes AUD obvious */}
                  <span>{formatAUDShort(indicativeRate * markupMultiplier)} / {form.cryptoType}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span className="text-muted-foreground">Estimated Receive</span>
                  <span className="font-medium text-blue-400">~{estimated.toFixed(8)} {form.cryptoType}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Final rate determined at settlement. This is not binding.</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="wallet">Wallet Address</Label>
              <Input id="wallet" required placeholder={form.cryptoType === "BTC" ? "bc1q..." : "0x..."}
                value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} />
            </div>

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-1"
                checked={form.acceptedTerms} onChange={(e) => setForm({ ...form, acceptedTerms: e.target.checked })} />
              <span className="text-muted-foreground">
                I accept the <Link href="/terms" target="_blank" className="text-blue-400 hover:underline">Terms & Conditions</Link> and understand that the exchange rate is not locked until settlement.
              </span>
            </label>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Place Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
