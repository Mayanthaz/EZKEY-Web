"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";
import { Gamepad2, Mail, Loader2, CheckCircle2, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailFromParams = searchParams.get("email") || "";
  const router = useRouter();

  const [email, setEmail] = useState(emailFromParams);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const didInitialFocus = useRef(false);

  useEffect(() => {
    if (emailFromParams) {
      window.sessionStorage.setItem("ezkey:pending-signup-email", emailFromParams);
      return;
    }

    const pendingEmail = window.sessionStorage.getItem("ezkey:pending-signup-email");
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, [emailFromParams]);

  useEffect(() => {
    if (didInitialFocus.current) {
      return;
    }

    if (email) {
      inputRefs.current[0]?.focus();
    } else {
      emailInputRef.current?.focus();
    }

    didInitialFocus.current = true;
  }, [email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    setError(null);

    // Focus the next empty input or the last one
    const nextEmpty = newOtp.findIndex((d) => d === "");
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();

    // Auto-submit if all 6 digits filled
    if (newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = async (code: string) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Enter the email address you used to sign up.");
      emailInputRef.current?.focus();
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: trimmedEmail,
        token: code,
        type: "signup",
      });

      if (error) throw error;

      window.sessionStorage.removeItem("ezkey:pending-signup-email");
      setSuccess(true);
      // Redirect to dashboard after a brief success animation
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid verification code");
      // Clear the OTP inputs on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Enter the email address you used to sign up before resending.");
      emailInputRef.current?.focus();
      return;
    }

    setIsResending(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: trimmedEmail,
      });

      if (error) throw error;
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    handleVerify(code);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="glass-card p-8 animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <Gamepad2 className="w-8 h-8 text-neon-purple" />
              <span className="font-display text-xl font-bold text-gradient tracking-wider">
                EZKEY
              </span>
            </Link>

            {success ? (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="w-8 h-8 text-neon-green" />
                </div>
                <h1 className="font-display text-2xl font-bold mb-2 text-neon-green">
                  Verified!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your email has been verified. Redirecting to dashboard...
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-neon-purple" />
                </div>
                <h1 className="font-display text-2xl font-bold mb-2">Verify Your Email</h1>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit verification code from your email.
                </p>
              </>
            )}
          </div>

          {!success && (
            <>
              {/* OTP Input */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="verify-email" className="text-sm font-medium">
                    Email address
                  </label>
                  <input
                    id="verify-email"
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError(null);
                    }}
                    placeholder="you@example.com"
                    disabled={isVerifying}
                    className="input-neon"
                  />
                </div>

                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={isVerifying}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-cyber-surface
                                  transition-all duration-300 outline-none
                                  ${digit ? "border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "border-cyber-border text-foreground"}
                                  focus:border-neon-purple focus:shadow-[0_0_15px_rgba(139,92,246,0.3)]
                                  disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  ))}
                </div>

                {error && (
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 text-center">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-neon w-full !py-3.5"
                  disabled={isVerifying || !email.trim() || otp.some((d) => d === "")}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Email"
                    )}
                  </span>
                </button>
              </form>

              {/* Resend */}
              <div className="text-center mt-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Didn&apos;t receive the code?
                </p>
                <button
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || isResending}
                  className="inline-flex items-center gap-2 text-sm text-neon-purple hover:text-neon-blue transition-colors font-medium
                             disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend in {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Resend Code
                    </>
                  )}
                </button>
              </div>

              {/* Back to sign up */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Wrong email?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-neon-purple hover:text-neon-blue transition-colors font-medium"
                >
                  Sign up again
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
