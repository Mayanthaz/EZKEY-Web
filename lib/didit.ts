const DIDIT_API_BASE_URL =
  process.env.DIDIT_API_BASE_URL || "https://verification.didit.me";

// Per-session Didit workflow config for "Free KYC". This is not a secret.
const FREE_KYC_WORKFLOW_ID = "54a83627-35c6-468c-b579-7be7d47dd4db";

export type DiditSessionStatus =
  | "Not Started"
  | "In Progress"
  | "Approved"
  | "Declined"
  | "In Review"
  | "Expired"
  | "Abandoned"
  | "Kyc Expired"
  | "KYC Expired"
  | "Resubmitted"
  | "Awaiting User";

export type SellerVerificationStatus =
  | "pending"
  | "submitted"
  | "verified"
  | "rejected";

export type DiditCreateSessionResponse = {
  session_id: string;
  session_kind?: "user" | "business";
  session_number?: number;
  session_token: string;
  url: string;
  vendor_data: string | null;
  metadata: unknown;
  status: DiditSessionStatus;
  workflow_id: string;
  workflow_version?: number;
  callback?: string | null;
};

export type DiditDecisionResponse = {
  session_id: string;
  session_kind?: "user" | "business";
  session_number?: number;
  session_url?: string;
  status: DiditSessionStatus;
  environment?: string;
  workflow_id?: string;
  workflow_version?: number;
  vendor_data?: string | null;
  metadata?: unknown;
  features?: string[];
  id_verifications?: unknown[];
  liveness_checks?: unknown[];
  face_matches?: unknown[];
  aml_screenings?: unknown[];
  reviews?: unknown[];
  [key: string]: unknown;
};

export type DiditSessionInput = {
  userId: string;
  email?: string;
  phone?: string;
  legalName?: string;
  dateOfBirth?: string;
  idCountry?: string;
  documentType?: string;
  storeName?: string;
  sellerType?: string;
  payoutCountry?: string;
  origin: string;
};

function getDiditApiKey() {
  const apiKey = process.env.DIDIT_API_KEY;

  if (!apiKey) {
    throw new Error("Missing DIDIT_API_KEY");
  }

  return apiKey;
}

export function getDiditWorkflowId() {
  return FREE_KYC_WORKFLOW_ID;
}

function splitName(fullName?: string) {
  const parts = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (parts.length === 0) {
    return {};
  }

  if (parts.length === 1) {
    return { first_name: parts[0] };
  }

  return {
    first_name: parts[0],
    last_name: parts.slice(1).join(" "),
  };
}

export function normalizeCountryToIso3(country?: string) {
  if (!country) {
    return undefined;
  }

  const value = country.trim();
  const normalized = value.toLowerCase();

  const aliases: Record<string, string> = {
    malaysia: "MYS",
    mys: "MYS",
    sri_lanka: "LKA",
    "sri lanka": "LKA",
    lka: "LKA",
    "united states": "USA",
    usa: "USA",
    us: "USA",
    india: "IND",
    ind: "IND",
    singapore: "SGP",
    sgp: "SGP",
  };

  if (aliases[normalized]) {
    return aliases[normalized];
  }

  if (/^[a-z]{3}$/i.test(value)) {
    return value.toUpperCase();
  }

  return undefined;
}

function getExpectedDocumentTypes(documentType?: string) {
  switch (documentType) {
    case "passport":
      return ["P"];
    case "driving_license":
      return ["DL"];
    case "national_id":
      return ["ID"];
    default:
      return ["ID", "DL"];
  }
}

export function mapDiditStatusToVerificationStatus(
  status?: string | null,
): SellerVerificationStatus {
  switch (status) {
    case "Approved":
      return "verified";
    case "Declined":
    case "Expired":
    case "Abandoned":
    case "Kyc Expired":
    case "KYC Expired":
      return "rejected";
    case "In Progress":
    case "In Review":
    case "Resubmitted":
    case "Awaiting User":
      return "submitted";
    case "Not Started":
    default:
      return "pending";
  }
}

async function diditFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${DIDIT_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": getDiditApiKey(),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Didit request failed with ${response.status}`;

    try {
      const body = await response.json();
      message =
        typeof body?.detail === "string"
          ? body.detail
          : body?.message || JSON.stringify(body);
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function createDiditSession(input: DiditSessionInput) {
  const idCountry = normalizeCountryToIso3(input.idCountry);
  const expectedDetails = {
    ...splitName(input.legalName),
    ...(input.dateOfBirth ? { date_of_birth: input.dateOfBirth } : {}),
    ...(idCountry ? { id_country: idCountry } : {}),
    expected_document_types: getExpectedDocumentTypes(input.documentType),
  };

  return diditFetch<DiditCreateSessionResponse>("/v3/session/", {
    method: "POST",
    body: JSON.stringify({
      workflow_id: getDiditWorkflowId(),
      vendor_data: input.userId,
      callback: `${input.origin}/become-a-seller/kyc-result`,
      callback_method: "both",
      language: "en",
      contact_details: {
        ...(input.email ? { email: input.email } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
        send_notification_emails: true,
        email_lang: "en",
      },
      expected_details: expectedDetails,
      metadata: {
        context: "seller_onboarding",
        user_id: input.userId,
        store_name: input.storeName || null,
        seller_type: input.sellerType || null,
        payout_country: input.payoutCountry || null,
        requested_document_type: input.documentType || "national_id_or_driving_license",
      },
    }),
  });
}

export async function retrieveDiditDecision(sessionId: string) {
  return diditFetch<DiditDecisionResponse>(
    `/v3/session/${encodeURIComponent(sessionId)}/decision/`,
    { method: "GET" },
  );
}
