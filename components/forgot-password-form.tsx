"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useState } from "react";
import { Gamepad2, Mail, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
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
          <h1 className="font-display text-2xl font-bold mb-2">
            {success ? "Check Your Email" : "Reset Password"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {success
              ? "We sent you a password reset link"
              : "Enter your email to receive a reset link"}
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <Alert className="border-neon-green/20 bg-neon-green/10 text-neon-green [&>svg]:text-neon-green">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                If you registered using your email and password, you will receive a
                password reset email. Check your inbox.
              </AlertDescription>
            </Alert>
            <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5 gap-2">
              <Link href="/auth/login">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 bg-white/[0.03] border-white/10 focus:border-neon-purple/60 focus-visible:ring-neon-purple/20 text-foreground placeholder:text-muted-foreground/50"
                />
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
              disabled={isLoading}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Email"
                )}
              </span>
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Remember your password?{" "}
              <Link
                href="/auth/login"
                className="text-neon-purple hover:text-neon-blue transition-colors font-medium"
              >
                Log in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
