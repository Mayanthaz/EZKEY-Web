"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function getSupabaseAuthErrorParams(searchParams: URLSearchParams) {
  const params = new URLSearchParams(searchParams);

  if (typeof window !== "undefined" && window.location.hash.startsWith("#")) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    hashParams.forEach((value, key) => {
      if (!params.has(key)) {
        params.set(key, value);
      }
    });
  }

  const error = params.get("error");
  const errorCode = params.get("error_code");
  const description = params.get("error_description");

  if (!errorCode && !description && error !== "access_denied") {
    return null;
  }

  return {
    code: errorCode,
    message: description ?? error ?? "Authentication link failed",
  };
}

export default function SupabaseAuthErrorRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname.startsWith("/auth/error")) {
      return;
    }

    const authError = getSupabaseAuthErrorParams(
      new URLSearchParams(searchParams.toString()),
    );

    if (!authError) {
      return;
    }

    const target = new URL("/auth/error", window.location.origin);
    target.searchParams.set("error", authError.message);

    if (authError.code) {
      target.searchParams.set("code", authError.code);
    }

    router.replace(`${target.pathname}${target.search}`);
  }, [pathname, router, searchParams]);

  return null;
}
