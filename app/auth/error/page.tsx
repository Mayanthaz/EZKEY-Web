import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  const params = await searchParams;
  const isExpiredOtp = params?.code === "otp_expired";

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {params?.error ?? "An unspecified authentication error occurred."}
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
  searchParams: Promise<{ code?: string; error?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
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
