"use client";

import { Loader2, ShieldCheck, AlertCircle, Sparkles, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { InbuiltKycModal } from "@/components/seller/InbuiltKycModal";

type DiditKycButtonProps = {
  formId: string;
};

type SessionResponse = {
  url?: string;
  sessionId?: string;
  mode?: "didit" | "inbuilt";
  diditConfigured?: boolean;
  error?: string;
  message?: string;
};

async function readSessionResponse(response: Response): Promise<SessionResponse> {
  const text = await response.text();
  try {
    return JSON.parse(text) as SessionResponse;
  } catch {
    return { error: text || "Unable to start verification session." };
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

  // Inbuilt KYC Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDiditUrl, setModalDiditUrl] = useState<string | null>(null);
  const [modalSessionId, setModalSessionId] = useState<string | null>(null);
  const [applicantDetails, setApplicantDetails] = useState({
    name: "Alexander James Vance",
    dob: "1995-04-18",
    docType: "National Identity Card (NIC)",
  });

  async function startKyc() {
    setError(null);

    const form = document.getElementById(formId);

    if (!(form instanceof HTMLFormElement)) {
      setError("Seller application form was not found.");
      return;
    }

    const formData = new FormData(form);
    const legalName = value(formData, "legal_name");
    const email = value(formData, "email");
    const country = value(formData, "country");
    const storeName = value(formData, "store_name");
    const productCategories = values(formData, "product_categories");
    const dateOfBirth = value(formData, "date_of_birth");
    const deliveryPlan = value(formData, "delivery_plan");
    const payoutCountry = value(formData, "payout_country");
    const accountHolderName = value(formData, "account_holder_name");
    const sellerRules = values(formData, "seller_rules");
    const totalRulesCount = form.querySelectorAll<HTMLInputElement>(
      'input[name="seller_rules"]'
    ).length;
    const kycConsent = checkboxChecked(formData, "kyc_consent");

    if (!legalName) {
      setError("Please enter your legal name (Step 1).");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid seller email (Step 1).");
      return;
    }
    if (!country) {
      setError("Please enter your country / jurisdiction (Step 1).");
      return;
    }
    if (!storeName) {
      setError("Please enter your public store name (Step 1).");
      return;
    }
    if (productCategories.length === 0) {
      setError("Choose at least one product category (Step 1).");
      return;
    }
    if (!dateOfBirth) {
      setError("Please enter your date of birth (Step 2).");
      return;
    }
    if (!deliveryPlan) {
      setError("Please provide your delivery fulfillment plan (Step 2).");
      return;
    }
    if (!payoutCountry) {
      setError("Please enter your payout country (Step 3).");
      return;
    }
    if (!accountHolderName) {
      setError("Please enter your account holder name (Step 3).");
      return;
    }
    if (sellerRules.length < totalRulesCount) {
      setError("Please accept all 6 seller policies before continuing (Step 3).");
      return;
    }
    if (!kycConsent) {
      setError("Please agree to the KYC identity verification consent (Step 3).");
      return;
    }

    setApplicantDetails({
      name: legalName,
      dob: dateOfBirth,
      docType: value(formData, "document_type") || "National Identity Card (NIC)",
    });

    setIsLoading(true);

    try {
      const response = await fetch("/api/kyc/didit/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          legalName,
          email,
          phone: value(formData, "phone"),
          country,
          dateOfBirth,
          documentType: value(formData, "document_type") || "national_id",
          storeName,
          sellerType: value(formData, "seller_type") || "individual",
          productCategories,
          deliveryPlan,
          residentialAddress: value(formData, "residential_address"),
          businessName: value(formData, "business_name"),
          registrationNumber: value(formData, "registration_number"),
          payoutMethod: value(formData, "payout_method") || "bank_transfer",
          payoutCountry,
          accountHolderName,
          sellerRulesAccepted: sellerRules.length === totalRulesCount,
          kycConsent,
        }),
      });

      const data = await readSessionResponse(response);

      if (data.url) {
        setModalDiditUrl(data.url);
        setModalSessionId(data.sessionId || null);
        setIsModalOpen(true);
      } else if (data.sessionId) {
        setModalDiditUrl(null);
        setModalSessionId(data.sessionId);
        setIsModalOpen(true);
      } else if (response.status === 401) {
        setError(data.error || "Please log in to initiate seller KYC.");
      } else {
        // Launch Inbuilt Scanner fallback
        setModalDiditUrl(null);
        setModalSessionId("inbuilt_session");
        setIsModalOpen(true);
      }
    } catch {
      // Offline fallback: launch Inbuilt Camera Scanner directly
      setModalDiditUrl(null);
      setModalSessionId("inbuilt_offline");
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  }

  const openDirectInbuiltScanner = () => {
    setModalDiditUrl(null);
    setModalSessionId(`inbuilt_${Date.now()}`);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col items-start gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={startKyc}
            disabled={isLoading}
            className="btn-neon shrink-0 text-sm !px-7 !py-3.5 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-neon-purple/20"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-neon-green" />
              )}
              {isLoading ? "Starting Verification..." : "Launch Inbuilt KYC Verification"}
            </span>
          </button>

          <button
            type="button"
            onClick={openDirectInbuiltScanner}
            className="px-4 py-3 text-xs font-semibold rounded-xl border border-neon-blue/40 bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue transition-all flex items-center gap-1.5"
            title="Open camera document & face liveness scanner immediately"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Quick Camera Scanner
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2 max-w-md p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <div className="leading-relaxed">
              {error}{" "}
              {error.toLowerCase().includes("log in") && (
                <Link href="/auth/login" className="font-semibold text-neon-blue underline ml-1">
                  Log in here
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Embedded Inbuilt KYC Verification Modal */}
      <InbuiltKycModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        diditUrl={modalDiditUrl}
        sessionId={modalSessionId}
        applicantName={applicantDetails.name}
        applicantDob={applicantDetails.dob}
        applicantDocument={applicantDetails.docType}
      />
    </>
  );
}
