"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  ShoppingCart,
  Bell,
  Menu,
  X,
  Gamepad2,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Zap,
  Settings,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { hasEnvVars } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const supabase = useMemo(() => (hasEnvVars ? createClient() : null), []);

  useEffect(() => {
    if (!supabase) return;

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-cyber-darker/80 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
          : "bg-gradient-to-b from-cyber-darker/60 via-cyber-darker/10 to-transparent"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <Gamepad2 className="w-7 h-7 text-neon-purple transition-all duration-300 group-hover:text-neon-blue" />
              <div className="absolute inset-0 blur-lg bg-neon-purple/30 group-hover:bg-neon-blue/30 transition-all duration-300" />
            </div>
            <span className="font-display text-lg font-bold text-gradient tracking-tight">
              EZKEY
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground
                           transition-all duration-300 rounded-lg hover:bg-white/[0.05] relative group"
              >
                {link.label}
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-neon-purple
                               transition-all duration-300 group-hover:w-3/4 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground
                               group-focus-within:text-neon-purple transition-colors duration-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search apps, vouchers, keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl
                         text-sm text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/20
                         focus:bg-white/[0.06] transition-all duration-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Cart */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-muted-foreground hover:text-foreground hover:bg-white/[0.05] rounded-xl"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-neon-purple text-white border-0">
                    0
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Cart</TooltipContent>
            </Tooltip>

            {user ? (
              <>
                {/* Notifications */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl"
                    >
                      <Bell className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Notifications</TooltipContent>
                </Tooltip>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-2 py-1.5 h-auto hover:bg-white/5 rounded-xl
                               border border-transparent hover:border-white/[0.08] transition-all"
                    >
                      <Avatar className="h-8 w-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue shrink-0">
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue text-white text-sm font-bold">
                          {user.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-cyber-card/90 backdrop-blur-2xl border-white/[0.08] mt-1"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Free Account</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-3 cursor-pointer">
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/buyer/orders" className="flex items-center gap-3 cursor-pointer">
                        <ShoppingCart className="w-4 h-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/buyer/settings" className="flex items-center gap-3 cursor-pointer">
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer flex items-center gap-3"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link href="/auth/login">Log In</Link>
                </Button>
                <Button asChild className="btn-neon border-0 text-sm !px-5 !py-2">
                  <Link href="/auth/sign-up">
                    <span className="relative z-10 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Sign Up
                    </span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu via Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl"
                >
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] bg-cyber-darker/95 backdrop-blur-2xl border-l border-white/[0.06] p-0"
              >
                <SheetHeader className="px-6 py-5 border-b border-white/[0.06]">
                  <SheetTitle asChild>
                    <Link href="/" className="flex items-center gap-2">
                      <Gamepad2 className="w-6 h-6 text-neon-purple" />
                      <span className="font-display text-lg font-bold text-gradient">EZKEY</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>

                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2.5 bg-cyber-card/60 border border-white/[0.08] rounded-xl
                               text-sm text-foreground placeholder:text-muted-foreground/50
                               focus:outline-none focus:border-neon-purple/50"
                    />
                  </div>
                </div>

                <nav className="px-4 py-4 space-y-1">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center px-4 py-3 text-sm font-medium text-muted-foreground
                               hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <Separator className="bg-white/[0.06] mx-4 w-auto" />

                {!user && (
                  <div className="flex gap-2 p-4">
                    <Button variant="outline" asChild className="flex-1 border-white/10 hover:bg-white/5">
                      <Link href="/auth/login">Log In</Link>
                    </Button>
                    <Button asChild className="flex-1 btn-neon border-0">
                      <Link href="/auth/sign-up">
                        <span className="relative z-10">Sign Up</span>
                      </Link>
                    </Button>
                  </div>
                )}

                {user && (
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <Avatar className="h-9 w-9 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue shrink-0">
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue text-white font-bold">
                          {user.email?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                        <p className="text-xs text-muted-foreground">Free Account</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-red-400 hover:text-red-400 hover:bg-red-500/10"
                      onClick={handleSignOut}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
