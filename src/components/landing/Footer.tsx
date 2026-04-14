import Link from "next/link";
import { Shield } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

const columns = [
  {
    title: "Platform",
    links: [
      { href: "#how-it-works", label: "How It Works" },
      { href: "#pricing", label: "Fees & Limits" },
      { href: "#faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log In" },
      { href: "/register", label: "Create Account" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "mailto:support@coinvault.com.au", label: "support@coinvault.com.au" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-14 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              <span className="font-bold">{SITE_NAME}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Australia&apos;s straightforward crypto exchange.
              AUSTRAC registered. Human support. No nonsense.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</h4>
              <div className="mt-3 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <Link key={l.href} href={l.href}
                    className="text-sm text-muted-foreground transition hover:text-foreground">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-white/[0.06] pt-6 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved. AUSTRAC registered Digital Currency Exchange.</p>
          <p className="mt-1">Cryptocurrency is volatile and carries risk. This is not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}
