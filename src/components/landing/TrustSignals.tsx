import { ShieldCheck, Lock, Landmark, Flag } from "lucide-react";

const signals = [
  {
    icon: ShieldCheck,
    title: "AUSTRAC Registered",
    description: "Fully compliant Digital Currency Exchange provider.",
  },
  {
    icon: Lock,
    title: "Bank-Grade Security",
    description: "Encrypted data, secure storage, and strict access controls.",
  },
  {
    icon: Landmark,
    title: "AUD Bank Transfer",
    description: "Pay via Australian bank transfer. No credit cards, no hidden fees.",
  },
  {
    icon: Flag,
    title: "Australian Owned",
    description: "Local team, local support, built for the Australian market.",
  },
];

export function TrustSignals() {
  return (
    <section className="border-t border-white/10 py-24 px-4">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">
          Why Trust CoinVault?
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {signals.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur"
            >
              <s.icon className="mx-auto h-8 w-8 text-blue-400" />
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
