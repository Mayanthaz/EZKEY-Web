import { NextRequest, NextResponse } from "next/server";

import { createDiditSession, getDiditWorkflowId } from "@/lib/didit";
import {
  applySellerVerificationUpdate,
  getVerificationUrl,
} from "@/lib/seller-verification";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

type SellerApplicationPayload = {
  legalName?: string;
  email?: string;
  phone?: string;
  country?: string;
  dateOfBirth?: string;
  documentType?: string;
  storeName?: string;
  sellerType?: string;
  productCategories: string[];
  deliveryPlan?: string;
  residentialAddress?: string;
  businessName?: string;
  registrationNumber?: string;
  payoutMethod?: string;
  payoutCountry?: string;
  accountHolderName?: string;
  sellerRulesAccepted: boolean;
  kycConsent: boolean;
};

function readString(body: Record<string, unknown>, key: string) {
  const value = body[key];

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readStringArray(body: Record<string, unknown>, key: string) {
  const value = body[key];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parsePayload(body: unknown): SellerApplicationPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;

  return {
    legalName: readString(record, "legalName"),
    email: readString(record, "email"),
    phone: readString(record, "phone"),
    country: readString(record, "country"),
    dateOfBirth: readString(record, "dateOfBirth"),
    documentType: readString(record, "documentType"),
    storeName: readString(record, "storeName"),
    sellerType: readString(record, "sellerType"),
    productCategories: readStringArray(record, "productCategories"),
    deliveryPlan: readString(record, "deliveryPlan"),
    residentialAddress: readString(record, "residentialAddress"),
    businessName: readString(record, "businessName"),
    registrationNumber: readString(record, "registrationNumber"),
    payoutMethod: readString(record, "payoutMethod"),
    payoutCountry: readString(record, "payoutCountry"),
    accountHolderName: readString(record, "accountHolderName"),
    sellerRulesAccepted: record.sellerRulesAccepted === true,
    kycConsent: record.kycConsent === true,
  };
}

function payoutMethodForDatabase(payoutMethod?: string) {
  if (payoutMethod === "paypal" || payoutMethod === "stripe") {
    return payoutMethod;
  }

  return "bank_transfer";
}

function normalizePhone(phone?: string) {
  if (!phone) {
    return undefined;
  }

  const compact = phone.replace(/[\s().-]/g, "");

  return /^\+\d{7,15}$/.test(compact) ? compact : undefined;
}

function getOrigin(request: NextRequest) {
  const requestOrigin = request.headers.get("origin") || request.nextUrl.origin;

  if (
    requestOrigin.startsWith("http://localhost") ||
    requestOrigin.startsWith("http://127.0.0.1")
  ) {
    return requestOrigin;
  }

  return process.env.NEXT_PUBLIC_SITE_URL || requestOrigin;
}

export async function POST(request: NextRequest) {
  if (!hasEnvVars) {
    return NextResponse.json(
      {
        error:
          "Authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.",
      },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Please log in or create an EZKEY account before starting KYC." },
      { status: 401 },
    );
  }

  let payload: SellerApplicationPayload | null = null;

  try {
    payload = parsePayload(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Invalid seller application payload." },
      { status: 400 },
    );
  }

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid seller application payload." },
      { status: 400 },
    );
  }

  const email = payload.email || user.email || undefined;
  const missingFields = [
    ["legal name", payload.legalName],
    ["email", email],
    ["country", payload.country],
    ["date of birth", payload.dateOfBirth],
    ["ID document type", payload.documentType],
    ["store name", payload.storeName],
    ["seller type", payload.sellerType],
    ["delivery plan", payload.deliveryPlan],
    ["at least one product category", payload.productCategories.length > 0],
    ["payout country", payload.payoutCountry],
    ["account holder name", payload.accountHolderName],
  ]
    .filter(([, value]) => !value)
    .map(([label]) => label);

  if (missingFields.length > 0) {
    return NextResponse.json(
      { error: `Please complete: ${missingFields.join(", ")}.` },
      { status: 400 },
    );
  }

  if (!payload.sellerRulesAccepted || !payload.kycConsent) {
    return NextResponse.json(
      {
        error:
          "Please accept the seller rules and consent to Didit identity verification before continuing.",
      },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json(
      {
        error:
          "Seller verification storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  try {
    const session = await createDiditSession({
      userId: user.id,
      email,
      phone: normalizePhone(payload.phone),
      legalName: payload.legalName,
      dateOfBirth: payload.dateOfBirth,
      idCountry: payload.country,
      documentType: payload.documentType,
      storeName: payload.storeName,
      sellerType: payload.sellerType,
      payoutCountry: payload.payoutCountry,
      origin: getOrigin(request),
    });

    const submittedDetails = {
      legal_name: payload.legalName,
      email,
      phone: payload.phone || null,
      country: payload.country,
      date_of_birth: payload.dateOfBirth,
      document_type: payload.documentType,
      store_name: payload.storeName,
      seller_type: payload.sellerType,
      product_categories: payload.productCategories,
      delivery_plan: payload.deliveryPlan,
      residential_address: payload.residentialAddress || null,
      business_name: payload.businessName || null,
      registration_number: payload.registrationNumber || null,
      payout_method: payload.payoutMethod || "bank_transfer",
      payout_country: payload.payoutCountry,
      account_holder_name: payload.accountHolderName,
      kyc_provider: "Didit",
      kyc_workflow_id: getDiditWorkflowId(),
      consent_text:
        "Seller consented to EZKEY sharing details with Didit for live document, liveness, face match, and KYC checks.",
      consent_at: new Date().toISOString(),
    };

    const { applicationStatus } = await applySellerVerificationUpdate(admin, {
      userId: user.id,
      sessionId: session.session_id,
      status: session.status,
      sessionNumber: session.session_number,
      workflowId: session.workflow_id,
      workflowVersion: session.workflow_version,
      vendorData: session.vendor_data,
      verificationUrl: getVerificationUrl(session),
      metadata: session.metadata,
      submittedDetails,
      providerPayload: session,
      businessName: payload.storeName,
      businessEmail: email,
      payoutMethod: payoutMethodForDatabase(payload.payoutMethod),
    });

    return NextResponse.json({
      sessionId: session.session_id,
      status: session.status,
      applicationStatus,
      url: session.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create Didit session.";
    const status = message.includes("DIDIT_API_KEY") ? 500 : 502;

    return NextResponse.json(
      {
        error:
          status === 500
            ? "Didit is not configured. Add DIDIT_API_KEY."
            : message,
      },
      { status },
    );
  }
}
