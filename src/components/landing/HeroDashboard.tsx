"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle, TrendingUp, ArrowUpRight, Wallet } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";
import { formatAUD } from "@/lib/format";

interface Props {
  btcPrice: number;
  ethPrice: number;
  user?: { role: string } | null;
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } };
const fadeUp = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } } };

export function HeroDashboard({ btcPrice, ethPrice, user }: Props) {
  // If user is logged in as a customer → go to buy page
  // If user is admin → go to admin dashboard (admins don't buy)
  // If not logged in → go to register
  const buyHref = !user
    ? "/register"
    : user.role === "ADMIN"
    ? "/admin"
    : "/dashboard/buy";

  const buyLabel = user?.role === "ADMIN" ? "Go to Admin" : "Buy Bitcoin";

  return (
    <div className="relative">
      <div className="absolute -inset-4 animate-pulse rounded-3xl bg-blue-500/[0.06] blur-2xl [animation-duration:4s]" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 shadow-2xl backdrop-blur-sm"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-medium text-green-400">Live</span>
          </div>
          <span className="text-xs text-muted-foreground">CoinVault Dashboard</span>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-5">
          <p className="text-xs text-muted-foreground">Portfolio Balance</p>
          <AnimatedCounter
            value="$24,832.50"
            className="mt-1 block text-3xl font-bold tracking-tight"
            immediate
          />
          <p className="mt-1 flex items-center gap-1 text-xs text-green-400">
            <TrendingUp className="h-3 w-3" />
            <AnimatedCounter value="+$1,247.30" className="" immediate />
            <span>(5.28%) this month</span>
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-5 grid grid-cols-2 gap-3">
          <AssetCard symbol="₿" name="Bitcoin" amount="0.12 BTC" value={btcPrice * 0.12} />
          <AssetCard symbol="Ξ" name="Ethereum" amount="1.8 ETH" value={ethPrice * 1.8} />
        </motion.div>

        {/* FIX: Wrap button in Link — dynamic destination based on auth status */}
        <Link href={buyHref}>
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(37,99,235,0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Wallet className="h-4 w-4" /> {buyLabel}
          </motion.div>
        </Link>

        <motion.div variants={fadeUp} className="mt-4 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent Activity
          </p>
          <ActivityRow action="Bought" detail="0.05 BTC" amount="$7,750" time="2h ago" delay={0} />
          <ActivityRow action="KYC Verified" detail="" amount="" time="Today" verified delay={1} />
          <ActivityRow action="Bought" detail="1.2 ETH" amount="$6,240" time="Yesterday" delay={2} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function AssetCard({ symbol, name, amount, value }: {
  symbol: string; name: string; amount: string; value: number;
}) {
  return (
    <motion.div
      whileHover={{ borderColor: "rgba(59,130,246,0.25)", backgroundColor: "rgba(255,255,255,0.05)" }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-3 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/15 text-sm text-blue-400">
          {symbol}
        </span>
        <div>
          <p className="text-xs font-medium">{name}</p>
          <p className="text-[11px] text-muted-foreground">{amount}</p>
        </div>
      </div>
      <p className="mt-2 text-sm font-bold">{formatAUD(value)}</p>
    </motion.div>
  );
}

function ActivityRow({ action, detail, amount, time, verified, delay }: {
  action: string; detail: string; amount: string; time: string; verified?: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.9 + delay * 0.15, duration: 0.4, ease: [0, 0, 0.2, 1] }}
      whileHover={{ x: 3, backgroundColor: "rgba(255,255,255,0.04)" }}
      className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2 text-xs transition-colors"
    >
      <div className="flex items-center gap-2">
        {verified ? (
          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <ArrowUpRight className="h-3.5 w-3.5 text-blue-400" />
        )}
        <span className="font-medium">{action}</span>
        {detail && <span className="text-muted-foreground">{detail}</span>}
      </div>
      <div className="flex items-center gap-3">
        {amount && <span className="font-medium">{amount}</span>}
        <span className="text-muted-foreground">{time}</span>
      </div>
    </motion.div>
  );
}
