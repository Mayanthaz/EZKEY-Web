"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  ExternalLink,
  Gamepad2,
  LayoutDashboard,
  Loader2,
  LogOut,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminAuth, redirectToLogin, type AdminIdentity } from "@/lib/admin/api";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/verifications", label: "Seller KYC", icon: BadgeCheck },
  { href: "/admin/listings", label: "Listings", icon: ShoppingBag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
];

const AdminContext = createContext<AdminIdentity | null>(null);

/** The signed-in admin. Only usable inside AdminShell. */
export function useAdmin() {
  const admin = useContext(AdminContext);
  if (!admin) throw new Error("useAdmin must be used inside AdminShell");
  return admin;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminIdentity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminAuth
      .me()
      .then((me) => {
        if (cancelled) return;
        if (!me) redirectToLogin();
        else setAdmin(me);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not verify admin session");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = async () => {
    setLoggingOut(true);
    await adminAuth.logout();
    window.location.replace("/admin/login");
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-dark p-6">
        <div className="glass-card max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-neon-orange" />
          <h1 className="font-display text-lg font-bold">Can&apos;t reach the admin backend</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-5" variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-dark">
        <Loader2 className="h-6 w-6 animate-spin text-neon-purple" />
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <AdminContext.Provider value={admin}>
      <div className="min-h-screen bg-cyber-dark text-foreground">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-cyber-border bg-cyber-darker/90 px-4 backdrop-blur">
          <Link href="/admin" className="flex items-center gap-2">
            <Gamepad2 className="h-6 w-6 text-neon-purple" />
            <span className="font-display text-lg font-bold tracking-wider text-gradient">EZKEY</span>
            <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-neon-pink/30 bg-neon-pink/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neon-pink">
              <ShieldCheck className="h-3 w-3" /> Admin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {admin.displayName || admin.username}
            </span>
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/" target="_blank">
                <ExternalLink className="h-3.5 w-3.5" /> View site
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={logout} disabled={loggingOut}>
              {loggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
              Log out
            </Button>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar (desktop) */}
          <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col border-r border-cyber-border bg-cyber-darker/50 p-3 lg:flex">
            <nav className="space-y-1">
              {NAV.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "w-full justify-start gap-3 text-sm font-medium",
                    isActive(item.href)
                      ? "border border-neon-purple/20 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/15 hover:text-neon-purple"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            {/* Tab bar (mobile) */}
            <div className="custom-scrollbar flex gap-1 overflow-x-auto border-b border-cyber-border px-4 py-3 lg:hidden">
              {NAV.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "shrink-0 gap-2 text-xs",
                    isActive(item.href)
                      ? "border border-neon-purple/20 bg-neon-purple/10 text-neon-purple"
                      : "text-muted-foreground",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
