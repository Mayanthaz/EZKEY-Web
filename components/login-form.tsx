"use client";

import { cn, hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { OAuthSetupModal } from "@/components/auth/OAuthSetupModal";
import { useOAuthProviderStatus, type OAuthProvider } from "@/components/auth/use-oauth-provider-status";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Gamepad2, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState("/dashboard");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectedFrom = params.get("redirectedFrom");
    const reason = params.get("reason");

    if (
      redirectedFrom &&
      redirectedFrom.startsWith("/") &&
      !redirectedFrom.startsWith("//")
    ) {
      setRedirectPath(redirectedFrom);
      setNotice("Please log in to continue.");
    }

    if (reason === "auth-not-configured") {
      setNotice(
        "Supabase authentication is not configured yet. Add your Supabase environment variables before logging in.",
      );
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasEnvVars) {
      setError(
        "Supabase authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
      );
      return;
    }

    const trimmedEmail = email.trim();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) throw error;
      window.location.href = redirectPath;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
      setIsLoading(false);
    }
  };

  const getOAuthProviderLabel = (provider: OAuthProvider) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const [oauthLoading, setOauthLoading] = useState<OAuthProvider | null>(null);
  const [oauthSetupProvider, setOauthSetupProvider] = useState<OAuthProvider | null>(null);
  const { isProviderEnabled } = useOAuthProviderStatus();

  const handleOAuthLogin = async (provider: OAuthProvider) => {
    if (!hasEnvVars) {
      setError(
        "Supabase authentication is not configured. Add your Supabase environment variables first.",
      );
      return;
    }

    // If known beforehand to be disabled, directly open setup modal
    if (isProviderEnabled(provider) === false) {
      setOauthSetupProvider(provider);
      return;
    }

    setOauthLoading(provider);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        if (
          error.message?.toLowerCase().includes("not enabled") ||
          error.message?.toLowerCase().includes("validation_failed")
        ) {
          setOauthSetupProvider(provider);
          setOauthLoading(null);
          return;
        }
        setError(error.message);
        setOauthLoading(null);
        return;
      }

      if (data?.url) {
        // Probe endpoint to ensure Supabase doesn't return 400 Unsupported Provider
        try {
          const probe = await fetch(data.url);
          if (!probe.ok) {
            const errJson = await probe.json().catch(() => null);
            if (
              probe.status === 400 ||
              errJson?.error_code === "validation_failed" ||
              errJson?.msg?.includes("not enabled")
            ) {
              setOauthSetupProvider(provider);
              setOauthLoading(null);
              return;
            }
          }
        } catch {
          // Probe could fail due to CORS or network; proceed to navigate
        }

        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initiate OAuth login");
      setOauthLoading(null);
    }
  };

  return (
    <div className={cn("w-full", className)} {...props}>
      <div className="glass-card p-8 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <Gamepad2 className="w-8 h-8 text-neon-purple transition-all group-hover:text-neon-blue" />
            <span className="font-display text-xl font-bold text-gradient tracking-wider">
              EZKEY
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Log in to your digital marketplace account
          </p>
        </div>

        {/* Alerts */}
        <div className="space-y-3 mb-6">
          {notice && (
            <Alert className="border-neon-blue/20 bg-neon-blue/10 text-neon-blue [&>svg]:text-neon-blue">
              <Info className="h-4 w-4" />
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}

          {!hasEnvVars && (
            <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Authentication is unavailable until Supabase environment variables are added.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Buttons */}
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin("google")}
            disabled={!hasEnvVars || isLoading || oauthLoading !== null}
            className="w-full border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 text-foreground gap-3 transition-all"
          >
            {oauthLoading === "google" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            <span>{oauthLoading === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleOAuthLogin("discord")}
            disabled={!hasEnvVars || isLoading || oauthLoading !== null}
            className="w-full border-[#5865F2]/20 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 hover:border-[#5865F2]/40 text-foreground gap-3 transition-all"
          >
            {oauthLoading === "discord" ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#5865F2]/20 border-t-[#5865F2]" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="#5865F2">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            )}
            <span>{oauthLoading === "discord" ? "Connecting to Discord..." : "Continue with Discord"}</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <Separator className="flex-1 bg-white/[0.08]" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">or</span>
          <Separator className="flex-1 bg-white/[0.08]" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 bg-white/[0.03] border-white/10 focus:border-neon-purple/60 focus:ring-neon-purple/20 focus-visible:ring-neon-purple/20 text-foreground placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-neon-purple hover:text-neon-blue transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 bg-white/[0.03] border-white/10 focus:border-neon-purple/60 focus-visible:ring-neon-purple/20 text-foreground"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="btn-neon w-full !py-3.5 border-0"
            disabled={isLoading || !hasEnvVars}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </span>
          </Button>
        </form>

        {/* Quick Demo Test Option */}
        <div className="mt-4 pt-4 border-t border-white/[0.08] text-center">
          <button
            type="button"
            onClick={() => {
              setEmail("demo@ezkey.test");
              setPassword("Password123!");
            }}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-neon-purple transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-neon-green" />
            <span>Fill Demo Credentials (demo@ezkey.test)</span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-neon-purple hover:text-neon-blue transition-colors font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>

      <OAuthSetupModal
        isOpen={!!oauthSetupProvider}
        onClose={() => setOauthSetupProvider(null)}
        provider={oauthSetupProvider}
        redirectPath={redirectPath}
        onAutofillDemo={(em, pw) => {
          setEmail(em);
          setPassword(pw);
        }}
      />
    </div>
  );
}
