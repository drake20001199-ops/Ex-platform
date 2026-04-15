"use client";

import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Shield, LayoutDashboard, ShoppingCart, History, User, LogOut } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import { toast } from "sonner";

const links = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Dashboard"    },
  { href: "/dashboard/buy",          icon: ShoppingCart,    label: "Buy Crypto"   },
  { href: "/dashboard/transactions", icon: History,         label: "Transactions" },
  { href: "/dashboard/profile",      icon: User,            label: "Profile"      },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/10 bg-card/80 px-4 backdrop-blur md:hidden">
      <Sheet>
        <SheetTrigger>
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          {/* Logo — goes to home */}
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
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                    active ? "bg-blue-600/20 text-blue-400" : "text-muted-foreground"
                  )}>
                  <l.icon className="h-4 w-4" />{l.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-3">
            <button onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground">
              <LogOut className="h-4 w-4" />Logout
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo in header bar — goes to home */}
      <Link href="/" className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-blue-500" />
        <span className="font-semibold">{SITE_NAME}</span>
      </Link>
    </header>
  );
}
