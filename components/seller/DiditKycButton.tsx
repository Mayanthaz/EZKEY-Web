"use client";

import { DiditSdk } from "@didit-protocol/sdk-web";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type DiditKycButtonProps = {
  formId: string;
};

type SessionResponse = {
  url?: string;
  sessionId?: string;
  error?: string;
};

async function readSessionResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text) as SessionResponse;
    } catch {
      return { error: text || "Unable to start Didit KYC." };
    }
  }

  try {
    return JSON.parse(text) as SessionResponse;
  } catch {
    return { error: text || "Unable to start Didit KYC." };
  }
}

function value(formData: FormData, key: string) {
  const entry = formData.get(key);

  return typeof entry === "string" ? entry.trim() : "";
}

function values(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((entry): entry is string => typeof entry === "string");
}

function checkboxChecked(formData: FormData, key: string) {
  return formData.has(key);
}

export function DiditKycButton({ formId }: DiditKycButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startKyc() {
    setError(null);

    const form = document.getElementById(formId);

    if (!(form instanceof HTMLFormElement)) {
      setError("Seller application form was not found.");
      return;
    }

    if (!form.reportValidity()) {
      return;
    }

    const formData = new FormData(form);
    const productCategories = values(formData, "product_categories");

    if (productCategories.length === 0) {
      setError("Choose at least one product category you plan to sell.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/kyc/didit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName: value(formData, "legal_name"),
          email: value(formData, "email"),
          phone: value(formData, "phone"),
          country: value(formData, "country"),
          dateOfBirth: value(formData, "date_of_birth"),
          documentType: value(formData, "document_type"),
          storeName: value(formData, "store_name"),
          sellerType: value(formData, "seller_type"),
          productCategories,
          deliveryPlan: value(formData, "delivery_plan"),
          residentialAddress: value(formData, "residential_address"),
          businessName: value(formData, "business_name"),
          registrationNumber: value(formData, "registration_number"),
          payoutMethod: value(formData, "payout_method"),
          payoutCountry: value(formData, "payout_country"),
          accountHolderName: value(formData, "account_holder_name"),
          sellerRulesAccepted:
            values(formData, "seller_rules").length ===
            form.querySelectorAll<HTMLInputElement>('input[name="seller_rules"]').length,
          kycConsent: checkboxChecked(formData, "kyc_consent"),
        }),
      });

      const data = await readSessionResponse(response);

      if (!response.ok || !data.url) {
        setError(data.error || "Unable to start Didit KYC.");
        return;
      }

      DiditSdk.shared.onComplete = (result) => {
        if (result.type === "completed") {
          const params = data.sessionId
            ? `?sessionId=${encodeURIComponent(data.sessionId)}`
            : "";

          window.location.assign(`/become-a-seller/kyc-result${params}`);
          return;
        }

        if (result.type === "failed") {
          setError(
            result.error?.message ||
              "Didit verification could not be completed. Please try again.",
          );
        }
      };

      await DiditSdk.shared.startVerification({ url: data.url });
    } catch {
      setError("Unable to start Didit KYC. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={startKyc}
        disabled={isLoading}
        className="btn-neon shrink-0 text-sm !px-6 !py-3 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <span className="relative z-10 flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          {isLoading ? "Creating Didit Session..." : "Start Live KYC Test"}
        </span>
      </button>

      {error && (
        <p className="max-w-md text-sm text-red-300">
          {error}{" "}
          {error.toLowerCase().includes("log in") && (
            <Link href="/auth/login" className="font-medium text-neon-blue underline">
              Log in here.
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
