import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type DiditCreateSessionResponse,
  type DiditDecisionResponse,
  mapDiditStatusToVerificationStatus,
} from "@/lib/didit";

type JsonRecord = Record<string, unknown>;

type SellerVerificationUpdateInput = {
  userId: string;
  sessionId: string;
  status?: string | null;
  sessionNumber?: number | null;
  workflowId?: string | null;
  workflowVersion?: number | null;
  vendorData?: string | null;
  verificationUrl?: string | null;
  metadata?: unknown;
  submittedDetails?: JsonRecord;
  providerPayload?: unknown;
  webhookPayload?: unknown;
  rawDecision?: unknown;
  lastWebhookEventId?: string | null;
  lastWebhookAt?: string | null;
  businessName?: string;
  businessEmail?: string;
  payoutMethod?: string;
};

type SellerVerificationUpdateResult = {
  applicationStatus: ReturnType<typeof mapDiditStatusToVerificationStatus>;
  approved: boolean;
};

export function statusFromDiditDecision(
  decision: DiditDecisionResponse | unknown,
  fallback?: string | null,
) {
  if (decision && typeof decision === "object" && "status" in decision) {
    const status = (decision as { status?: unknown }).status;

    if (typeof status === "string") {
      return status;
    }
  }

  return fallback ?? "Not Started";
}

export function getVerificationUrl(
  payload: DiditCreateSessionResponse | DiditDecisionResponse | unknown,
) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as {
    url?: unknown;
    session_url?: unknown;
  };

  if (typeof record.url === "string") {
    return record.url;
  }

  if (typeof record.session_url === "string") {
    return record.session_url;
  }

  return null;
}

export async function applySellerVerificationUpdate(
  admin: SupabaseClient,
  input: SellerVerificationUpdateInput,
): Promise<SellerVerificationUpdateResult> {
  const status = input.status ?? "Not Started";
  const applicationStatus = mapDiditStatusToVerificationStatus(status);
  const approved = applicationStatus === "verified";
  const rejected = applicationStatus === "rejected";
  const now = new Date().toISOString();

  const verificationRecord: JsonRecord = {
    user_id: input.userId,
    didit_session_id: input.sessionId,
    status,
    application_status: applicationStatus,
    ...(input.sessionNumber ? { session_number: input.sessionNumber } : {}),
    ...(input.workflowId ? { workflow_id: input.workflowId } : {}),
    ...(input.workflowVersion ? { workflow_version: input.workflowVersion } : {}),
    ...(input.vendorData ? { vendor_data: input.vendorData } : {}),
    ...(input.verificationUrl ? { verification_url: input.verificationUrl } : {}),
    ...(input.metadata !== undefined ? { metadata: input.metadata } : {}),
    ...(input.submittedDetails ? { submitted_details: input.submittedDetails } : {}),
    ...(input.providerPayload ? { provider_payload: input.providerPayload } : {}),
    ...(input.webhookPayload ? { webhook_payload: input.webhookPayload } : {}),
    ...(input.rawDecision ? { raw_decision: input.rawDecision } : {}),
    ...(input.lastWebhookEventId ? { last_webhook_event_id: input.lastWebhookEventId } : {}),
    ...(input.lastWebhookAt ? { last_webhook_at: input.lastWebhookAt } : {}),
    ...(approved ? { approved_at: now, rejected_at: null } : {}),
    ...(rejected ? { rejected_at: now } : {}),
  };

  const { error: verificationError } = await admin
    .from("seller_verifications")
    .upsert(verificationRecord, { onConflict: "didit_session_id" });

  if (verificationError) {
    throw verificationError;
  }

  const vendorDetails: JsonRecord = {
    user_id: input.userId,
    id_verification_status: applicationStatus,
    ...(input.businessName ? { business_name: input.businessName } : {}),
    ...(input.businessEmail ? { business_email: input.businessEmail } : {}),
    ...(input.payoutMethod ? { payout_method: input.payoutMethod } : {}),
  };

  const { error: vendorError } = await admin
    .from("vendor_details")
    .upsert(vendorDetails, { onConflict: "user_id" });

  if (vendorError) {
    throw vendorError;
  }

  if (approved) {
    const { error: profileError } = await admin
      .from("profiles")
      .update({ role: "seller", is_verified: true })
      .eq("id", input.userId);

    if (profileError) {
      throw profileError;
    }
  }

  return { applicationStatus, approved };
}
