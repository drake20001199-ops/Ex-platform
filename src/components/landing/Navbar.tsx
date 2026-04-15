"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Shield, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_NAME } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Fees" },
  { href: "#faq", label: "FAQ" },
];

interface Props {
  user: { firstName: string; role: string } | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  if (hour >= 18 && hour < 22) return "Good evening";
  return "Good night";
}

export function Navbar({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [greeting, setGreeting] = useState("");
  const router = useRouter();

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  }

  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">

        {/* Logo — always goes to home */}
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-500" />
          <span className="text-lg font-bold tracking-tight">{SITE_NAME}</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-sm text-muted-foreground transition hover:text-foreground">
              {l.label}
            </Link>
          ))}

          {user ? (
            /* ── Logged in ── */
            <>
              <span className="text-sm text-muted-foreground">
                {greeting}, <span className="font-medium text-foreground">{user.firstName}</span>
              </span>
              <Link href={dashboardHref}>
                <Button size="sm" variant="outline"
                  className="gap-2 border-white/15 bg-white/5 hover:bg-white/10">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  {user.role === "ADMIN" ? "Admin Panel" : "My Dashboard"}
                </Button>
              </Link>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
                <LogOut className="h-3.5 w-3.5" />
                Log Out
              </button>
            </>
          ) : (
            /* ── Not logged in ── */
            <>
              <Link href="/login"
                className="text-sm text-muted-foreground transition hover:text-foreground">
                Log In
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/[0.06] bg-background px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-3">
            {user && (
              <p className="text-sm font-medium">
                {greeting}, {user.firstName}
              </p>
            )}
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href={dashboardHref} onClick={() => setOpen(false)}
                  className="text-sm text-blue-400">
                  {user.role === "ADMIN" ? "Admin Panel" : "My Dashboard"}
                </Link>
                <button onClick={handleLogout}
                  className="text-left text-sm text-muted-foreground">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm"
                  onClick={() => setOpen(false)}>Log In</Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-blue-600">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
