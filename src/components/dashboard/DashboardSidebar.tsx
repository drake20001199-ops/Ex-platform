"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ShoppingCart, History, User, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import { toast } from "sonner";

const links = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/dashboard/buy",          icon: ShoppingCart,    label: "Buy Crypto"   },
  { href: "/dashboard/transactions", icon: History,         label: "Transactions" },
  { href: "/dashboard/profile",      icon: User,            label: "Profile"      },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-white/10 bg-card md:flex">

      {/* Logo — goes to home page */}
      <Link href="/" className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
        <Shield className="h-6 w-6 text-blue-500" />
        <span className="font-bold">{SITE_NAME}</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((l) => {
          const active = pathname === l.href ||
            (l.href !== "/dashboard" && pathname.startsWith(l.href));
          return (
            <Link key={l.href} href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
