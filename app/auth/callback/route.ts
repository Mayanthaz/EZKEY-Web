import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

function safeRedirectPath(value: string | null) {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeRedirectPath(requestUrl.searchParams.get("next"));
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Determine base origin (support reverse proxy headers)
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : requestUrl.origin;

  if (error || errorDescription) {
    return NextResponse.redirect(
      new URL(
        `/auth/error?error=${encodeURIComponent(errorDescription || error || "OAuth authentication failed")}`,
        origin,
      ),
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(new URL(next, origin));
    }

    return NextResponse.redirect(
      new URL(`/auth/error?error=${encodeURIComponent(exchangeError.message)}`, origin),
    );
  }

  return NextResponse.redirect(
    new URL("/auth/error?error=Missing auth callback code", origin),
  );
}
