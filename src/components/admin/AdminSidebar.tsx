"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, ArrowLeftRight, Settings, FileBarChart, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import { toast } from "sonner";

const links = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/transactions", icon: ArrowLeftRight, label: "Transactions" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
  { href: "/admin/reports", icon: FileBarChart, label: "Reports" },
];

export function AdminSidebar() {
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
      <Link href="/admin" className="flex items-center gap-2 border-b border-white/10 px-6 py-4">
        <Shield className="h-6 w-6 text-blue-500" />
        <span className="font-bold">{SITE_NAME}</span>
        <span className="ml-auto rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">Admin</span>
      </Link>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                active ? "bg-blue-600/20 text-blue-400" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
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
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <LogOut className="h-4 w-4" />Logout
        </button>
      </div>
    </aside>
  );
}
