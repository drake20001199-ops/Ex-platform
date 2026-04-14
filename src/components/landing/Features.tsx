"use client";

import { motion } from "framer-motion";
import { Percent, Headphones, Lock, Zap, Landmark, FileCheck } from "lucide-react";

const features = [
  {
    icon: Percent,
    title: "Transparent Fees",
    description: "One clear markup on the market rate. No hidden charges, no deposit fees, no surprises.",
  },
  {
    icon: Zap,
    title: "Fast Settlement",
    description: "AUD bank transfers processed same business day. Crypto sent directly to your wallet.",
  },
  {
    icon: Headphones,
    title: "Human Support",
    description: "Real people in Australia. Get help via email within hours, not chatbot runarounds.",
  },
  {
    icon: Lock,
    title: "Secure by Design",
    description: "Encrypted storage, private KYC document handling, bcrypt passwords, and HTTPS everywhere.",
  },
  {
    icon: Landmark,
    title: "Local Bank Transfer",
    description: "Pay with a simple AUD bank transfer using BSB & account number. No credit cards needed.",
  },
  {
    icon: FileCheck,
    title: "AUSTRAC Compliant",
    description: "Registered Digital Currency Exchange. Full KYC/AML program. Your data is protected by law.",
  },
];

const heading = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};
const card = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0, 0, 0.2, 1] as const },
  }),
};

export function Features() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={heading}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-medium text-blue-400">Why CoinVault</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Built for Australians who want it simple
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            No leverage, no margin, no complicated order books. Just a clean way to buy BTC and ETH with AUD.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={card}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{
                y: -4,
                borderColor: "rgba(59,130,246,0.2)",
                backgroundColor: "rgba(255,255,255,0.05)",
                transition: { duration: 0.25 },
              }}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 transition-transform duration-300 group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
