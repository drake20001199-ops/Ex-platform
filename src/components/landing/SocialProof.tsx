"use client";

import { motion } from "framer-motion";
import { Shield, Users, ArrowLeftRight, Clock } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

const stats = [
  { icon: Users, value: "10,000+", label: "Australians served" },
  { icon: ArrowLeftRight, value: "A$45M+", label: "Total volume traded" },
  { icon: Clock, value: "<10 min", label: "Average verification" },
  { icon: Shield, value: "100%", label: "Funds accounted for" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

export function SocialProof() {
  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] py-14 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="group relative text-center"
            >
              {/* One-time glow ring */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: [0, 0.5, 0] }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 1.2 }}
                className="absolute -inset-2 rounded-2xl border border-blue-500/30 blur-sm"
              />
              <s.icon className="mx-auto mb-3 h-5 w-5 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
              <AnimatedCounter
                value={s.value}
                className="block text-2xl font-bold tracking-tight sm:text-3xl"
              />
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          <AustracBadge />
          <span className="text-xs text-muted-foreground">
            Trusted by customers in Sydney, Melbourne, Brisbane, Perth & across Australia
          </span>
        </motion.div>
      </div>
    </section>
  );
}

function AustracBadge() {
  return (
    <motion.div
      whileHover={{ scale: 1.05, borderColor: "rgba(59,130,246,0.3)" }}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 transition-colors"
    >
      <Shield className="h-4 w-4 text-blue-400" />
      <span className="text-xs font-medium">AUSTRAC Registered DCE</span>
    </motion.div>
  );
}
