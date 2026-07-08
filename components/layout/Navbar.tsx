"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  Menu,
  X,
  Gamepad2,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Zap,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<SupabaseUser | null>(null);

  const supabase = createClient();

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsProfileOpen(false);
    window.location.href = "/";
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-cyber-darker/90 backdrop-blur-xl border-b border-cyber-border shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Gamepad2 className="w-8 h-8 text-neon-purple transition-all duration-300 group-hover:text-neon-blue" />
              <div className="absolute inset-0 blur-lg bg-neon-purple/30 group-hover:bg-neon-blue/30 transition-all duration-300" />
            </div>
            <span className="font-display text-xl font-bold text-gradient tracking-wider">
              EZKEY
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground
                           transition-all duration-300 rounded-lg hover:bg-white/5 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-neon-purple
                               transition-all duration-300 group-hover:w-3/4 rounded-full" />
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground
                               group-focus-within:text-neon-purple transition-colors duration-300" />
              <input
                type="text"
                placeholder="Search games, items, keys..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cyber-card/60 border border-cyber-border rounded-xl
                         text-sm text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-neon-purple/50 focus:ring-1 focus:ring-neon-purple/20
                         focus:bg-cyber-card transition-all duration-300"
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
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground
                             hover:bg-white/5 transition-all duration-300">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-neon-purple text-[10px] font-bold
                             text-white rounded-full flex items-center justify-center animate-bounce-soft">
                0
              </span>
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2.5 rounded-xl text-muted-foreground hover:text-foreground
                                 hover:bg-white/5 transition-all duration-300">
                  <Bell className="w-5 h-5" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-white/5
                             transition-all duration-300 border border-transparent hover:border-cyber-border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue
                                  flex items-center justify-center text-white text-sm font-bold">
                      {user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 hidden sm:block ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 z-50 glass-card p-2 animate-slide-down">
                        <div className="px-3 py-2 border-b border-cyber-border mb-1">
                          <p className="text-sm font-medium truncate">{user.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Free Account</p>
                        </div>
                        <Link
                          href="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground
                                   hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          href="/dashboard/buyer/orders"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground
                                   hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          My Orders
                        </Link>
                        <div className="divider-glow my-1" />
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400
                                   hover:bg-red-500/10 rounded-lg transition-all"
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
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-muted-foreground
                           hover:text-foreground transition-all duration-300"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/sign-up"
                  className="btn-neon text-sm !px-5 !py-2"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Sign Up
                  </span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 rounded-xl text-muted-foreground hover:text-foreground
                       hover:bg-white/5 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-cyber-darker/95 backdrop-blur-xl border-t border-cyber-border animate-slide-down">
          <div className="section-container py-4 space-y-2">
            {/* Mobile Search */}
            <div className="relative mb-4 md:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search games, items, keys..."
                className="w-full pl-10 pr-4 py-3 bg-cyber-card/60 border border-cyber-border rounded-xl
                         text-sm text-foreground placeholder:text-muted-foreground/50
                         focus:outline-none focus:border-neon-purple/50"
              />
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground
                         hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
              >
                {link.label}
              </Link>
            ))}

            {!user && (
              <div className="flex gap-2 pt-2 border-t border-cyber-border">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 py-3 text-center text-sm font-medium text-muted-foreground
                           hover:text-foreground border border-cyber-border rounded-lg transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/sign-up"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 btn-neon text-center text-sm !py-3"
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
