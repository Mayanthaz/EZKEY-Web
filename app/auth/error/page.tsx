import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

type ErrorSearchParams = { code?: string; error?: string };

// Supabase error codes raised when an OAuth (Google/Discord) sign-in attempt
// can't be completed because its one-time state was reused, expired, or lost.
// Retrying from the login page starts a fresh flow and normally succeeds.
const OAUTH_RETRY_CODES = new Set([
  "flow_state_already_used",
  "flow_state_expired",
  "flow_state_not_found",
  "bad_oauth_state",
  "bad_oauth_callback",
  "bad_code_verifier",
]);

function isOAuthRetryError(params: ErrorSearchParams) {
  if (params.code && OAUTH_RETRY_CODES.has(params.code)) {
    return true;
  }

  // The /auth/callback route only forwards the message, not the code.
  const message = params.error?.toLowerCase() ?? "";
  return (
    message.includes("state has already been used") ||
    message.includes("code verifier") ||
    message.includes("flow state")
  );
}

async function ErrorTitle({
  searchParams,
}: {
  searchParams: Promise<ErrorSearchParams>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <CardTitle className="text-2xl">
      {isOAuthRetryError(params)
        ? "Sign-in didn't complete"
        : "Sorry, something went wrong."}
    </CardTitle>
  );
}

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<ErrorSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const isExpiredOtp = params.code === "otp_expired";

  if (isOAuthRetryError(params)) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This sign-in link was already used or has expired. This can happen if
          the page was refreshed, the back button was pressed, or a browser
          extension opened the link twice during sign-in.
        </p>
        <p className="text-sm text-muted-foreground">
          Please try again. If it keeps happening, try a private window with
          extensions turned off.
        </p>

        <div className="flex flex-col gap-2 pt-2">
          <Link href="/auth/login" className="btn-neon w-full text-center !py-3">
            <span className="relative z-10">Try Signing In Again</span>
          </Link>
          <Link
            href="/"
            className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {params.error ?? "An unspecified authentication error occurred."}
      </p>

      {isExpiredOtp && (
        <p className="text-sm text-muted-foreground">
          This usually means the email link was already used, expired, or was
          opened by email security scanning. Use the latest 6-digit code from
          your email, or request a new sign-up email.
        </p>
      )}

      <div className="flex flex-col gap-2 pt-2">
        <Link href="/auth/sign-up" className="btn-neon w-full text-center !py-3">
          <span className="relative z-10">Request New Code</span>
        </Link>
        <Link
          href="/auth/login"
          className="text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<ErrorSearchParams>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <Suspense
                fallback={
                  <CardTitle className="text-2xl">Authentication error</CardTitle>
                }
              >
                <ErrorTitle searchParams={searchParams} />
              </Suspense>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
