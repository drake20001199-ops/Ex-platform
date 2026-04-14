"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "Is my money safe?",
    a: "Yes. We are registered with AUSTRAC as a Digital Currency Exchange. All customer data is encrypted, KYC documents are stored privately, and we never hold your crypto — it goes straight to the wallet address you provide.",
  },
  {
    q: "What are the fees, really?",
    a: "We apply a transparent markup (~3%) on top of the market rate. No deposit fees, no withdrawal fees, no hidden spreads. You see the final rate before confirming your order.",
  },
  {
    q: "How long until I get my crypto?",
    a: "Once your AUD bank transfer is confirmed (usually same business day), we process and send your crypto typically within hours. You'll receive a blockchain transaction link to track it in real time.",
  },
  {
    q: "What if I lose access to my account?",
    a: "Use the 'Forgot Password' flow to reset via email. If you're locked out entirely, contact our support team and we'll verify your identity and restore access — usually within 24 hours.",
  },
  {
    q: "Can I sell crypto back to AUD?",
    a: "Not yet. We're currently buy-only (AUD → BTC/ETH). Selling crypto for AUD is on our roadmap for a future update.",
  },
  {
    q: "What documents do I need for verification?",
    a: "A valid passport or government-issued ID, a selfie holding the ID, and a proof of address (utility bill or bank statement from the last 3 months). Most verifications complete in under 10 minutes.",
  },
];

function FAQItem({ q, a, defaultOpen }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border-b border-white/[0.06]">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition hover:text-blue-400">
        <span className="pr-4 font-medium">{q}</span>
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          open && "rotate-180",
        )} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="text-sm font-medium text-blue-400">Got Questions?</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="mt-12">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} defaultOpen={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
