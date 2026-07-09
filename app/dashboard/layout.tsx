"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  MessageSquare,
  Key,
  ChevronLeft,
  ChevronRight,
  Store,
  ShoppingCart,
} from "lucide-react";
import { Suspense, useState } from "react";

const buyerLinks = [
  { href: "/dashboard/buyer", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/buyer/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/dashboard/buyer/keys", label: "My Keys", icon: Key },
  { href: "/dashboard/buyer/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/buyer/settings", label: "Settings", icon: Settings },
];

const mobileLinks = [
  { href: "/become-a-seller", label: "Become a Seller", icon: Store },
  ...buyerLinks,
];

function DashboardContentFallback() {
  return (
    <div className="min-h-[50vh] animate-pulse space-y-4">
      <div className="h-8 w-48 rounded-lg bg-cyber-card" />
      <div className="h-32 rounded-xl bg-cyber-card" />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-cyber-dark pt-16 lg:pt-20">
      {/* Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-cyber-border bg-cyber-darker/50
                   transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Role Switcher */}
        <div className={`p-4 border-b border-cyber-border ${collapsed ? "px-3" : ""}`}>
          <div className="flex gap-1">
            <Link
              href="/become-a-seller"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              <Store className="w-4 h-4" />
              {!collapsed && "Become a Seller"}
            </Link>
            <Link
              href="/dashboard/buyer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium bg-neon-blue/10 text-neon-blue border border-neon-blue/20 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              {!collapsed && "Buyer"}
            </Link>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1">
          {buyerLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="w-4.5 h-4.5 shrink-0" />
                {!collapsed && link.label}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-cyber-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs text-muted-foreground
                     hover:text-foreground hover:bg-white/5 transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                Collapse
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex items-center gap-1 px-4 py-3 border-b border-cyber-border overflow-x-auto custom-scrollbar">
          {mobileLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="p-6 lg:p-8">
          <Suspense fallback={<DashboardContentFallback />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
