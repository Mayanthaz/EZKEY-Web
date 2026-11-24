"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { adminAuth } from "@/lib/admin/api";

function safeRedirect(value: string | null) {
  // Only allow redirects back into the admin panel.
  if (value && value.startsWith("/admin") && !value.startsWith("//") && !value.startsWith("/admin/login")) {
    return value;
  }
  return "/admin";
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [redirectPath, setRedirectPath] = useState("/admin");

  useEffect(() => {
    const target = safeRedirect(new URLSearchParams(window.location.search).get("redirectedFrom"));
    setRedirectPath(target);
    // Already signed in as admin? Skip the form.
    adminAuth
      .me()
      .then((me) => {
        if (me) window.location.replace(target);
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminAuth.login(email.trim(), password);
      window.location.replace(redirectPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setPassword("");
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cyber-dark">
        <Loader2 className="h-6 w-6 animate-spin text-neon-purple" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cyber-dark px-4 py-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-neon-purple/10 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="glass-card animate-scale-in p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-neon-purple/30 bg-neon-purple/10">
              <ShieldCheck className="h-7 w-7 text-neon-purple" />
            </div>
            <h1 className="font-display text-2xl font-bold">Admin Sign In</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Restricted area. Authorized EZKEY administrators only.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="border-white/10 bg-white/[0.03] pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-white/[0.03] pl-11 pr-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="btn-neon w-full border-0 !py-3.5">
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          All admin actions are logged.
        </p>
      </div>
    </div>
  );
}
