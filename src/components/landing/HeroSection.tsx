"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, CheckCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroDashboard } from "./HeroDashboard";
import { formatAUD } from "@/lib/format";

interface Props {
  btcPrice: number;
  ethPrice: number;
  btcChange: number;
  ethChange: number;
  user?: { role: string } | null;
}

const trustItems = [
  "AUSTRAC Registered",
  "Australian Owned",
  "Bank‑Grade Security",
];

export function HeroSection({ btcPrice, ethPrice, btcChange, ethChange, user }: Props) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-20 lg:min-h-[92vh] lg:flex lg:items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_600px_at_80%_50%,rgba(59,130,246,0.06),transparent)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
        <LeftCopy btcPrice={btcPrice} ethPrice={ethPrice} btcChange={btcChange} ethChange={ethChange} user={user} />

        {/* Right — Dashboard mockup (desktop only) */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="hidden lg:flex lg:items-center lg:justify-center">
          <HeroDashboard btcPrice={btcPrice} ethPrice={ethPrice} user={user} />
        </motion.div>
      </div>
    </section>
  );
}

function LeftCopy({ btcPrice, ethPrice, btcChange, ethChange, user }: Props) {
  // Dynamic CTA based on auth status
  const ctaHref = !user
    ? "/register"
    : user.role === "ADMIN"
    ? "/admin"
    : "/dashboard/buy";

  const ctaLabel = !user
    ? "Create Free Account"
    : user.role === "ADMIN"
    ? "Go to Admin Panel"
    : "Buy Crypto Now";

  return (
    <div className="flex flex-col justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-4 flex items-center gap-2 text-sm text-blue-400">
        <Shield className="h-4 w-4" />
        <span>AUSTRAC Regulated Digital Currency Exchange</span>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
        Buy Bitcoin & Ethereum in{" "}
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Australia</span>
        {" "}with AUD bank transfer
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
        Transparent fees, local bank transfer, human support.
        From sign‑up to verified in under 10 minutes — no experience needed.
      </motion.p>

      {/* CTA — dominant, dynamic based on auth */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mt-10">
        <Link href={ctaHref}>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Button size="lg" className="h-14 gap-2 bg-blue-600 px-10 text-base font-semibold shadow-lg shadow-blue-600/25 transition-shadow duration-300 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/40 sm:text-lg">
              {ctaLabel} <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </Link>
        {!user && (
          <p className="mt-3 text-xs text-muted-foreground">
            No fees until you deposit&ensp;·&ensp;Cancel anytime&ensp;·&ensp;ID verification later
          </p>
        )}
      </motion.div>

      {/* Trust badges */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
        className="mt-8 flex flex-wrap gap-4">
        {trustItems.map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> {t}
          </span>
        ))}
      </motion.div>

      {/* Mobile-only compact price strip */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="mt-6 flex gap-3 lg:hidden">
        <MobilePriceChip ticker="BTC" price={btcPrice} change={btcChange} />
        <MobilePriceChip ticker="ETH" price={ethPrice} change={ethChange} />
      </motion.div>
    </div>
  );
}

function MobilePriceChip({ ticker, price, change }: { ticker: string; price: number; change: number }) {
  const up = change >= 0;
  return (
    <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
      <span className="text-sm font-semibold">{ticker}</span>
      <span className="text-sm font-bold">{formatAUD(price)}</span>
      <span className={`ml-auto flex items-center gap-0.5 text-xs font-medium ${up ? "text-green-400" : "text-red-400"}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    </div>
  );
}
