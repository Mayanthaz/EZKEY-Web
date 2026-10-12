"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, KeyRound, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type OAuthProviderType = "google" | "discord" | "facebook";

interface OAuthSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: OAuthProviderType | null;
  redirectPath?: string;
  onAutofillDemo?: (email: string, pass: string) => void;
}

export function OAuthSetupModal({
  isOpen,
  onClose,
  provider,
  redirectPath = "/marketplace",
  onAutofillDemo,
}: OAuthSetupModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isLoggingInDemo, setIsLoggingInDemo] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  if (!provider) return null;

  const providerLabel = provider.charAt(0).toUpperCase() + provider.slice(1);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pztqguvamwasenwrsoqu.supabase.co";
  const callbackUrl = `${supabaseUrl}/auth/v1/callback`;
  const projectRef = supabaseUrl.replace("https://", "").split(".")[0];
  const dashboardLink = `https://supabase.com/dashboard/project/${projectRef}/auth/providers`;

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleQuickDemoLogin = async () => {
    setIsLoggingInDemo(true);
    setDemoError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: "demo@ezkey.test",
        password: "Password123!",
      });
      if (error) throw error;
      window.location.href = redirectPath;
    } catch (err) {
      setDemoError(err instanceof Error ? err.message : "Failed to sign in demo user");
      setIsLoggingInDemo(false);
    }
  };

  const handleAutofill = () => {
    if (onAutofillDemo) {
      onAutofillDemo("demo@ezkey.test", "Password123!");
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-cyber-card/95 border-neon-purple/30 backdrop-blur-xl text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-neon-purple/10 border border-neon-purple/30 flex items-center justify-center text-neon-purple">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg text-white">
                {providerLabel} OAuth Setup Required
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Supabase provider is currently disabled in your dashboard
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-200 [&>svg]:text-amber-400">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs leading-relaxed">
              Supabase returned <code className="bg-black/40 px-1 py-0.5 rounded text-[11px]">Unsupported provider: provider is not enabled</code>. To enable real {providerLabel} sign-in, activate it in your Supabase project.
            </AlertDescription>
          </Alert>

          {demoError && (
            <Alert variant="destructive" className="border-red-500/30 bg-red-500/10 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{demoError}</AlertDescription>
            </Alert>
          )}

          {/* Quick Demo Login Option */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-neon-purple/10 via-neon-blue/10 to-transparent border border-neon-purple/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                Quick Test Option
              </span>
              <span className="text-[10px] bg-neon-green/20 text-neon-green px-2 py-0.5 rounded-full font-bold">
                Instant Access
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Sign in with our pre-verified demo gamer account to test guest browsing vs buyer/seller actions right away without configuring credentials.
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoggingInDemo}
                className="flex-1 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold text-xs h-9 hover:opacity-90"
              >
                {isLoggingInDemo ? "Signing in..." : "Instant Demo Login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleAutofill}
                className="border-white/10 text-xs h-9 hover:bg-white/5"
              >
                Autofill Credentials
              </Button>
            </div>
          </div>

          {/* How to enable instructions */}
          <div className="space-y-2.5 pt-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              To Enable Real {providerLabel} Login:
            </span>
            <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside bg-black/30 p-3 rounded-lg border border-white/5">
              <li>Open your Supabase project: <strong>Authentication &gt; Providers</strong>.</li>
              <li>Find <strong>{providerLabel}</strong> and toggle <strong>Enable {providerLabel}</strong>.</li>
              <li>Enter your Client ID and Client Secret.</li>
              <li className="flex items-center justify-between gap-2 pt-1">
                <span className="truncate">Redirect URL: <code className="text-white text-[11px]">{callbackUrl}</code></span>
                <button
                  type="button"
                  onClick={handleCopyCallback}
                  className="text-neon-blue hover:text-white shrink-0 p-1 rounded"
                  title="Copy Redirect URL"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </li>
            </ol>

            <Button
              type="button"
              variant="outline"
              asChild
              className="w-full border-neon-purple/30 text-neon-purple hover:text-white hover:bg-neon-purple/20 text-xs h-9 gap-2"
            >
              <a href={dashboardLink} target="_blank" rel="noopener noreferrer">
                Open Supabase Providers Dashboard
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
