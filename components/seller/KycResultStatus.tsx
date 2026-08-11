"use client";

import { CheckCircle, Clock, Loader2, ShieldAlert, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type KycStatusResponse = {
  sessionId?: string;
  status?: string;
  applicationStatus?: "pending" | "submitted" | "verified" | "rejected";
  approved?: boolean;
  verificationUrl?: string | null;
  refreshError?: string;
  error?: string;
};

function getStatusCopy(status?: string, applicationStatus?: string) {
  if (applicationStatus === "verified" || status === "Approved") {
    return {
      title: "Seller verification approved",
      description:
        "Your Didit KYC is approved. Seller tools are now available in your dashboard.",
      icon: CheckCircle,
      badge: "badge-success",
    };
  }

  if (applicationStatus === "rejected" || status === "Declined") {
    return {
      title: "Seller verification needs attention",
      description:
        "Didit could not approve this verification. Review the result and start a new application if needed.",
      icon: XCircle,
      badge: "badge-danger",
    };
  }

  if (applicationStatus === "submitted" || status === "In Review") {
    return {
      title: "Seller verification is in review",
      description:
        "Didit has received your live check. EZKEY will unlock seller tools after the approved result is recorded.",
      icon: Clock,
      badge: "badge-warning",
    };
  }

  return {
    title: "Seller verification started",
    description:
      "Complete the Didit live check, then return here to refresh your seller status.",
    icon: ShieldAlert,
    badge: "badge-info",
  };
}

export function KycResultStatus() {
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("verificationSessionId") ||
    searchParams.get("session_id") ||
    searchParams.get("sessionId");
  const callbackStatus = searchParams.get("status") || undefined;
  const [result, setResult] = useState<KycStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStatus() {
      setIsLoading(true);

      try {
        const url = sessionId
          ? `/api/kyc/didit/status?sessionId=${encodeURIComponent(sessionId)}`
          : "/api/kyc/didit/status";
        const response = await fetch(url, { signal: controller.signal });
        const data = (await response.json()) as KycStatusResponse;

        setResult(response.ok ? data : { error: data.error || "Unable to load status." });
      } catch {
        if (!controller.signal.aborted) {
          setResult({ error: "Unable to refresh verification status yet." });
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadStatus();

    return () => controller.abort();
  }, [callbackStatus, sessionId]);

  const copy = useMemo(
    () => getStatusCopy(result?.status || callbackStatus, result?.applicationStatus),
    [callbackStatus, result?.applicationStatus, result?.status],
  );
  const Icon = isLoading ? Loader2 : copy.icon;

  return (
    <div className="mx-auto max-w-2xl rounded-xl border border-cyber-border bg-cyber-card/70 p-6 text-center shadow-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-purple/10">
        <Icon
          className={`h-7 w-7 text-neon-purple ${isLoading ? "animate-spin" : ""}`}
        />
      </div>

      <div className="mt-5">
        <span className={copy.badge}>
          {result?.applicationStatus || callbackStatus || "Checking"}
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">{copy.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {isLoading ? "Refreshing your Didit verification result..." : copy.description}
        </p>
      </div>

      {result?.error && (
        <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {result.error}
        </p>
      )}

      {result?.refreshError && !result.error && (
        <p className="mt-4 rounded-lg border border-neon-orange/20 bg-neon-orange/10 px-4 py-3 text-sm text-neon-orange">
          Status saved, but live refresh returned: {result.refreshError}
        </p>
      )}

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/dashboard/seller" className="btn-neon text-sm !px-6 !py-3">
          <span className="relative z-10">Open Seller Dashboard</span>
        </Link>
        <Link href="/become-a-seller" className="btn-ghost-neon text-sm !px-6 !py-3">
          Back to Seller Application
        </Link>
      </div>
    </div>
  );
}
