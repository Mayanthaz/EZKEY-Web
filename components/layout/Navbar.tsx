"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Bell,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Zap,
  Package,
  Settings,
  KeyRound,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { hasEnvVars } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import BrandMark from "@/components/layout/BrandMark";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(() => (hasEnvVars ? createClient() : null), []);

  useEffect(() => {
    if (!supabase) return;

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // ⌘K / Ctrl+K focuses the global search.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setIsProfileOpen(false);
    window.location.href = "/";
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/marketplace?q=${encodeURIComponent(q)}` : "/marketplace");
    setSearchQuery("");
    setIsMenuOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-cyber-darker/85 backdrop-blur-2xl border-b border-white/[0.07]"
          : "bg-gradient-to-b from-cyber-darker/70 via-cyber-darker/15 to-transparent border-b border-transparent"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-[68px] gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0 rounded-lg"
            aria-label="EZKEY home"
          >
            <BrandMark className="w-8 h-8" />
            <span className="font-display text-lg font-extrabold text-gradient tracking-tight">
              EZKEY
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`px-3 py-1.5 text-sm font-medium relative rounded-lg transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-px left-2 right-2 h-px rounded-full transition-all duration-300 ${
                    isActive(link.href)
                      ? "bg-gradient-to-r from-neon-purple to-neon-blue opacity-100"
                      : "bg-white/20 opacity-0 group-hover:opacity-100"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form
            onSubmit={submitSearch}
            className="hidden md:block flex-1 max-w-sm mx-2"
            role="search"
          >
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground
                           group-focus-within:text-neon-purple transition-colors pointer-events-none"
              />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search apps, vouchers, keys..."
                aria-label="Search marketplace"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-14 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg
                         text-sm text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-neon-purple/50 focus:ring-4 focus:ring-neon-purple/10
                         focus:bg-white/[0.06] transition-all [&::-webkit-search-cancel-button]:hidden"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5
                              px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04]
                              font-mono text-[10px] text-muted-foreground/70 pointer-events-none">
                ⌘K
              </kbd>
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/dashboard/buyer/cart"
              className="relative btn-icon-ghost w-9 h-9"
              aria-label="Cart"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-neon-purple" />
            </Link>

            {user ? (
              <>
                <button
                  className="btn-icon-ghost relative w-9 h-9"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px]" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen((v) => !v)}
                    aria-expanded={isProfileOpen}
                    aria-haspopup="menu"
                    className={`flex items-center gap-2 p-1 pr-2 rounded-lg transition-all duration-200 border ${
                      isProfileOpen
                        ? "bg-white/[0.06] border-white/10"
                        : "border-transparent hover:bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue
                                 flex items-center justify-center text-white text-xs font-bold shrink-0"
                    >
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                        aria-hidden="true"
                      />
                      <div
                        role="menu"
                        className="absolute right-0 mt-2 w-60 z-50 glass-card p-1.5 animate-slide-down"
                      >
                        <div className="px-3 py-2.5 mb-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                          <p className="text-sm font-medium truncate">
                            {user.email}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Free Account
                          </p>
                        </div>
                        {[
                          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                          { href: "/dashboard/buyer/orders", label: "My Orders", icon: Package },
                          { href: "/dashboard/buyer/keys", label: "My Keys", icon: KeyRound },
                          { href: "/dashboard/buyer/settings", label: "Settings", icon: Settings },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            role="menuitem"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground
                                       hover:text-foreground hover:bg-white/[0.05] rounded-lg transition-colors"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        ))}
                        <div className="divider-glow my-1.5" />
                        <button
                          onClick={handleSignOut}
                          role="menuitem"
                          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400
                                   hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <Link
                  href="/auth/login"
                  className="px-3 py-2 text-sm font-medium text-muted-foreground
                           hover:text-foreground transition-colors"
                >
                  Log In
                </Link>
                <Link href="/auth/sign-up" className="btn-neon text-sm !px-4 !py-2">
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Sign Up
                  </span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="lg:hidden btn-icon-ghost w-9 h-9"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-cyber-darker/95 backdrop-blur-2xl border-t border-white/[0.07] animate-slide-down">
          <div className="section-container py-4 space-y-1.5">
            {/* Mobile Search */}
            <form onSubmit={submitSearch} className="relative mb-3 md:hidden" role="search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search apps, vouchers, keys..."
                aria-label="Search marketplace"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg
                         text-sm text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-neon-purple/50 [&::-webkit-search-cancel-button]:hidden"
              />
            </form>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? "text-foreground bg-white/[0.05]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="w-1 h-1 rounded-full bg-neon-purple" />
                )}
              </Link>
            ))}

            {user ? (
              <div className="pt-2 mt-2 space-y-1 border-t border-white/[0.07]">
                {[
                  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { href: "/dashboard/buyer/orders", label: "My Orders", icon: Package },
                  { href: "/dashboard/buyer/settings", label: "Settings", icon: Settings },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground
                             hover:text-foreground hover:bg-white/[0.04] rounded-lg transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400
                           hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-3 mt-2 border-t border-white/[0.07]">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 py-2.5 text-center text-sm font-medium text-muted-foreground
                           hover:text-foreground border border-white/10 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 btn-neon text-center text-sm !py-2.5"
                >
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
