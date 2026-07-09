"use client";

import { cn, hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  type OAuthProvider,
  useOAuthProviderStatus,
} from "@/components/auth/use-oauth-provider-status";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gamepad2, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const oauthProviderStatus = useOAuthProviderStatus();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasEnvVars) {
      setError(
        "Supabase authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
      );
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: username,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getOAuthProviderLabel = (provider: OAuthProvider) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    if (!hasEnvVars) {
      setError(
        "Supabase authentication is not configured. Add your Supabase environment variables first.",
      );
      return;
    }

    if (oauthProviderStatus.isProviderEnabled(provider) === false) {
      setError(
        `${getOAuthProviderLabel(provider)} sign-in is not enabled in Supabase yet. Enable the provider in Supabase Authentication > Providers first.`,
      );
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="glass-card p-8 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <Gamepad2 className="w-8 h-8 text-neon-purple" />
            <span className="font-display text-xl font-bold text-gradient tracking-wider">
              EZKEY
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-sm text-muted-foreground">
            Join the digital marketplace community
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-6">
          {!hasEnvVars && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Authentication is unavailable until Supabase environment variables are added.
            </div>
          )}

          <button
            onClick={() => handleOAuthLogin("google")}
            disabled={
              !hasEnvVars ||
              oauthProviderStatus.isLoading ||
              oauthProviderStatus.isProviderEnabled("google") === false
            }
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-cyber-surface border border-cyber-border
                     rounded-xl text-sm font-medium hover:bg-white/5 hover:border-cyber-border transition-all duration-300
                     disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuthLogin("discord")}
            disabled={
              !hasEnvVars ||
              oauthProviderStatus.isLoading ||
              oauthProviderStatus.isProviderEnabled("discord") === false
            }
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#5865F2]/10 border border-[#5865F2]/20
                     rounded-xl text-sm font-medium hover:bg-[#5865F2]/20 hover:border-[#5865F2]/40 transition-all duration-300
                     disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#5865F2">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Continue with Discord
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-cyber-border" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-cyber-border" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="username"
                type="text"
                placeholder="GamerTag123"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-neon !pl-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-neon !pl-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="signup-password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-neon !pl-11 !pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-neon w-full !py-3.5"
            disabled={isLoading || !hasEnvVars}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </span>
          </button>
        </form>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-neon-purple hover:text-neon-blue transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-neon-purple hover:text-neon-blue transition-colors">
            Privacy Policy
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-neon-purple hover:text-neon-blue transition-colors font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
