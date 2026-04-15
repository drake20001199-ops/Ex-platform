"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const rows = [
  { label: "Account creation",    value: "Free",                           highlight: true  },
  { label: "AUD deposit",         value: "Free (bank transfer)",           highlight: true  },
  { label: "Trading markup",      value: "~3% on market rate",             highlight: false },
  { label: "Minimum order",       value: "$2,000",                         highlight: false },
  { label: "Maximum order",       value: "$50,000",                        highlight: false },
  { label: "Crypto withdrawal",   value: "Sent to your wallet — no extra fee", highlight: true },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="text-sm font-medium text-blue-400">No Hidden Costs</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Simple, transparent fees
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            You see the rate before you commit. No fine print, no surprise charges.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]"
        >
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-6 py-4 text-sm ${
                i < rows.length - 1 ? "border-b border-white/[0.06]" : ""
              }`}
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="flex items-center gap-2 font-medium">
                {row.highlight && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                {row.value}
              </span>
            </div>
          ))}
        </motion.div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          The markup covers our operational costs and exchange fees.
          Final rate shown before you confirm — never a surprise.
        </p>
      </div>
    </section>
  );
}
