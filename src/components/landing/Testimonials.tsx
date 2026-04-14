"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "James W.",
    city: "Sydney",
    text: "I tried three other exchanges before CoinVault. This was the first time I actually understood what I was paying and the crypto landed in my wallet the same day.",
  },
  {
    name: "Sarah K.",
    city: "Melbourne",
    text: "The verification was done in about 8 minutes — I was shocked. Bank transfer in, Bitcoin out, no drama. Exactly what I needed as a first‑time buyer.",
  },
  {
    name: "David L.",
    city: "Brisbane",
    text: "What I appreciate is the transparency. The fee is right there, no hidden spread nonsense. And when I had a question, a real person replied within an hour.",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="text-sm font-medium text-blue-400">Real Customers</span>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Trusted across Australia
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/15 text-sm font-bold text-blue-400">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.city}, Australia</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
