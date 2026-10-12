"use client";

import { hasEnvVars } from "@/lib/utils";
import { useEffect, useState } from "react";

export type OAuthProvider = "google" | "discord" | "facebook";

type ProviderStatus = Partial<Record<OAuthProvider, boolean>>;

type AuthSettingsResponse = {
  external?: ProviderStatus;
  // Supabase also returns flat keys like external_google, external_discord
  [key: string]: unknown;
};

const INITIAL_PROVIDER_STATUS: ProviderStatus = {};

/**
 * Fetches the Supabase auth settings to determine which OAuth
 * providers are enabled.  Falls back gracefully so buttons remain
 * clickable when the settings endpoint is unreachable.
 */
export function useOAuthProviderStatus() {
  const [providers, setProviders] = useState(INITIAL_PROVIDER_STATUS);
  const [isLoading, setIsLoading] = useState(hasEnvVars);
  const [fetchFailed, setFetchFailed] = useState(false);

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
          // Endpoint inaccessible — don't block the buttons
          setFetchFailed(true);
          return;
        }

        const settings = (await response.json()) as AuthSettingsResponse;

        // Supabase may return the external provider status in two formats:
        // 1. Nested: settings.external = { google: true, discord: true }
        // 2. Flat keys: settings.external_google = true
        // Handle both gracefully.
        const result: ProviderStatus = {};

        if (settings.external && typeof settings.external === "object") {
          Object.assign(result, settings.external);
        }

        // Also check flat keys (external_google, external_discord, etc.)
        const providerNames: OAuthProvider[] = ["google", "discord", "facebook"];
        for (const name of providerNames) {
          const flatKey = `external_${name}`;
          if (typeof settings[flatKey] === "boolean") {
            result[name] = settings[flatKey] as boolean;
          }
        }

        setProviders(result);
      } catch {
        setFetchFailed(true);
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
    /**
     * Returns true if the provider is confirmed enabled,
     * false if confirmed disabled, or undefined if unknown.
     * When fetchFailed is true, always returns undefined so
     * the UI doesn't block the buttons.
     */
    isProviderEnabled(provider: OAuthProvider): boolean | undefined {
      if (fetchFailed) return undefined;
      return providers[provider];
    },
  };
}
