"use client";

import { hasEnvVars } from "@/lib/utils";
import { useEffect, useState } from "react";

export type OAuthProvider = "google" | "discord" | "facebook";

type AuthSettingsResponse = {
  external?: Partial<Record<OAuthProvider, boolean>>;
};

const INITIAL_PROVIDER_STATUS: Partial<Record<OAuthProvider, boolean>> = {};

export function useOAuthProviderStatus() {
  const [providers, setProviders] = useState(INITIAL_PROVIDER_STATUS);
  const [isLoading, setIsLoading] = useState(hasEnvVars);

  useEffect(() => {
    if (!hasEnvVars) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadProviderStatus() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
            },
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          return;
        }

        const settings = (await response.json()) as AuthSettingsResponse;
        setProviders(settings.external ?? {});
      } catch {
        setProviders(INITIAL_PROVIDER_STATUS);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadProviderStatus();

    return () => controller.abort();
  }, []);

  return {
    isLoading,
    isProviderEnabled(provider: OAuthProvider) {
      return providers[provider];
    },
  };
}
