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
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const buyerLinks = [
  { href: "/dashboard/buyer", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/buyer/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/dashboard/buyer/keys", label: "My Keys", icon: Key },
  { href: "/dashboard/buyer/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/buyer/settings", label: "Settings", icon: Settings },
];

const sellerLinks = [
  { href: "/dashboard/seller", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/seller/listings", label: "My Listings", icon: ShoppingBag },
  { href: "/dashboard/seller/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/seller/payouts", label: "Payouts", icon: Wallet },
  { href: "/dashboard/seller/settings", label: "Store Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isSellerRoute = pathname ? pathname.startsWith("/dashboard/seller") : false;
  const navLinks = isSellerRoute ? sellerLinks : buyerLinks;

  return (
    <div className="flex min-h-screen bg-cyber-dark pt-16 lg:pt-[4.5rem]">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-cyber-border bg-cyber-darker/50 transition-all duration-300",
          collapsed ? "w-[4.5rem]" : "w-64"
        )}
      >
        {/* Role Switcher */}
        <div className={cn("p-4 border-b border-cyber-border", collapsed && "px-3")}>
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isSellerRoute ? "default" : "ghost"}
                  asChild
                  className={cn(
                    "flex-1 gap-2 py-2.5 text-xs font-medium",
                    isSellerRoute
                      ? "bg-neon-purple text-white hover:bg-neon-purple/90"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Link href="/dashboard/seller">
                    <Store className="w-4 h-4 shrink-0" />
                    {!collapsed && "Seller"}
                  </Link>
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Seller Dashboard</TooltipContent>}
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={!isSellerRoute ? "outline" : "ghost"}
                  asChild
                  className={cn(
                    "flex-1 gap-2 py-2.5 text-xs font-medium",
                    !isSellerRoute
                      ? "bg-neon-blue/10 text-neon-blue border-neon-blue/20 hover:bg-neon-blue/20 hover:text-neon-blue"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Link href="/dashboard/buyer">
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    {!collapsed && "Buyer"}
                  </Link>
                </Button>
              </TooltipTrigger>
              {collapsed && <TooltipContent side="right">Buyer Dashboard</TooltipContent>}
            </Tooltip>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    asChild
                    className={cn(
                      "w-full gap-3 text-sm font-medium transition-all duration-200",
                      collapsed ? "justify-center px-0" : "justify-start",
                      isActive
                        ? "bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/15 hover:text-neon-purple border border-neon-purple/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <Link href={link.href}>
                      <link.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && link.label}
                    </Link>
                  </Button>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{link.label}</TooltipContent>}
              </Tooltip>
            );
          })}
        </nav>

        <Separator className="bg-white/[0.06] mx-3 w-auto" />

        {/* Collapse Toggle */}
        <div className="p-3">
          <Button
            variant="ghost"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 gap-2",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                Collapse
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile Tab Bar */}
        <div className="lg:hidden flex items-center gap-1 px-4 py-3 border-b border-cyber-border overflow-x-auto custom-scrollbar">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Button
                key={link.href}
                variant="ghost"
                asChild
                size="sm"
                className={cn(
                  "flex items-center gap-2 px-3 text-xs font-medium whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20 hover:bg-neon-purple/15 hover:text-neon-purple"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Link href={link.href}>
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              </Button>
            );
          })}
        </div>

        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
