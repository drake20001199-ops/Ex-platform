"use client";

import { motion } from "framer-motion";
import { UserPlus, ShieldCheck, Wallet, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    time: "2 minutes",
    description: "Sign up with your email. No fees, no commitment — just a quick form.",
  },
  {
    icon: ShieldCheck,
    title: "Verify Your Identity",
    time: "Under 10 minutes",
    description: "Upload your ID and selfie. Our AUSTRAC‑compliant verification is fast and secure.",
  },
  {
    icon: Wallet,
    title: "Buy Crypto",
    time: "Same business day",
    description: "Transfer AUD from your bank account and receive BTC or ETH directly to your wallet.",
  },
];

const heading = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};
const card = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.15 + i * 0.15, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  }),
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <motion.div
          variants={heading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-medium text-blue-400">Simple & Fast</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            From zero to crypto in three steps
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            No trading jargon, no complicated charts. Just a straightforward way to buy Bitcoin and Ethereum.
          </p>
        </motion.div>

        <div className="relative mt-16 grid gap-6 sm:grid-cols-3">
          <div className="absolute top-10 left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-blue-600/30 via-blue-600/50 to-blue-600/30 sm:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -4, borderColor: "rgba(59,130,246,0.25)", backgroundColor: "rgba(255,255,255,0.05)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 backdrop-blur"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-blue-600/15 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                  {step.time}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-3 top-10 hidden h-5 w-5 text-blue-500/40 sm:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
