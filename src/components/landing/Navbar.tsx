"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Fees" },
  { href: "#faq", label: "FAQ" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted-foreground transition hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="text-sm text-muted-foreground transition hover:text-foreground">
            Log In
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-background px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm" onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
            <Link href="/login" className="text-sm" onClick={() => setOpen(false)}>Log In</Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button className="w-full bg-blue-600">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
