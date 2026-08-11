import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type DiditWebhookPayload,
  type DiditWebhookType,
  verifyDiditWebhook,
} from "@/lib/didit-webhook";
import { applySellerVerificationUpdate } from "@/lib/seller-verification";
import { createAdminClient } from "@/lib/supabase/admin";

type WebhookLogRow = {
  idempotency_key: string;
  event_id: string | null;
  webhook_type: string;
  session_id: string | null;
  business_session_id: string | null;
  session_kind: string | null;
  status: string | null;
  signature_method: string;
  timestamp: string | null;
  payload: DiditWebhookPayload;
  raw_body: string;
  headers: Record<string, string>;
  processing_status: string;
  processing_error: string | null;
};

const SESSION_WEBHOOK_TYPES = new Set(["status.updated", "data.updated"]);

const ACCEPTED_WEBHOOK_TYPES = new Set<DiditWebhookType>([
  "status.updated",
  "data.updated",
  "user.status.updated",
  "user.data.updated",
  "business.status.updated",
  "business.data.updated",
  "activity.created",
  "transaction.created",
  "transaction.status.updated",
]);

function textValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function timestampSeconds(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function timestampToIso(payloadTimestamp: unknown, headerTimestamp: string | null) {
  const seconds = timestampSeconds(payloadTimestamp) ?? timestampSeconds(headerTimestamp);

  return seconds ? new Date(seconds * 1000).toISOString() : new Date().toISOString();
}

function normalizeWebhookType(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "unknown";
}

function metadataUserId(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }

  return textValue((metadata as Record<string, unknown>).user_id);
}

function sessionIdFromPayload(payload: DiditWebhookPayload) {
  return textValue(payload.session_id) || textValue(payload.business_session_id);
}

function buildIdempotencyKey(payload: DiditWebhookPayload) {
  const eventId = textValue(payload.event_id);

  if (eventId) {
    return eventId;
  }

  const resourceId =
    sessionIdFromPayload(payload) ||
    textValue(payload.vendor_user_id) ||
    textValue(payload.vendor_business_id) ||
    textValue(payload.transaction_id) ||
    textValue(payload.txn_id) ||
    textValue(payload.vendor_data);

  return [resourceId, payload.status || "", payload.webhook_type || "unknown"]
    .filter(Boolean)
    .join(":");
}

function headersToRecord(headers: Headers) {
  const records: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    const lowerKey = key.toLowerCase();

    if (
      lowerKey.startsWith("x-signature") ||
      lowerKey === "x-timestamp" ||
      lowerKey === "content-type" ||
      lowerKey === "user-agent"
    ) {
      records[key] = value;
    }
  }

  return records;
}

async function resolveSellerUserId(
  admin: SupabaseClient,
  payload: DiditWebhookPayload,
  sessionId: string,
) {
  const directUserId = textValue(payload.vendor_data) || metadataUserId(payload.metadata);

  if (directUserId) {
    return directUserId;
  }

  const { data, error } = await admin
    .from("seller_verifications")
    .select("user_id")
    .eq("didit_session_id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return textValue(data?.user_id);
}

async function markVerificationFromWebhook(
  admin: SupabaseClient,
  payload: DiditWebhookPayload,
  headerTimestamp: string | null,
  trustDecisionBody: boolean,
) {
  const sessionId = sessionIdFromPayload(payload);

  if (!sessionId) {
    return null;
  }

  const userId = await resolveSellerUserId(admin, payload, sessionId);

  if (!userId) {
    return null;
  }

  return applySellerVerificationUpdate(admin, {
    userId,
    sessionId,
    status: textValue(payload.status) || "Not Started",
    sessionNumber:
      typeof payload.session_number === "number"
        ? payload.session_number
        : typeof payload.workflow_version === "number"
          ? payload.workflow_version
          : undefined,
    workflowId: textValue(payload.workflow_id),
    workflowVersion:
      typeof payload.workflow_version === "number"
        ? payload.workflow_version
        : undefined,
    vendorData: textValue(payload.vendor_data),
    verificationUrl: textValue(payload.session_url),
    metadata: payload.metadata,
    webhookPayload: payload,
    rawDecision: trustDecisionBody ? payload.decision : undefined,
    lastWebhookEventId: textValue(payload.event_id),
    lastWebhookAt: timestampToIso(payload.timestamp, headerTimestamp),
  });
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.DIDIT_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "DIDIT_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  const rawBodyBuffer = Buffer.from(await request.arrayBuffer());
  const rawBody = rawBodyBuffer.toString("utf8");
  let verification: ReturnType<typeof verifyDiditWebhook>;

  try {
    verification = verifyDiditWebhook(rawBodyBuffer, request.headers, webhookSecret);
  } catch (error) {
    console.warn("Didit webhook signature validation failed", {
      error: error instanceof Error ? error.message : String(error),
      rawBody,
    });

    return NextResponse.json(
      { error: "Invalid Didit webhook signature." },
      { status: 401 },
    );
  }

  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
      { status: 500 },
    );
  }

  const payload = verification.payload;
  const webhookType = normalizeWebhookType(payload.webhook_type);
  const idempotencyKey = buildIdempotencyKey(payload);

  if (!idempotencyKey) {
    return NextResponse.json(
      { error: "Didit webhook payload did not contain an idempotency key." },
      { status: 400 },
    );
  }

  const logRecord: WebhookLogRow = {
    idempotency_key: idempotencyKey,
    event_id: textValue(payload.event_id) || null,
    webhook_type: webhookType,
    session_id: textValue(payload.session_id) || null,
    business_session_id: textValue(payload.business_session_id) || null,
    session_kind: textValue(payload.session_kind) || null,
    status: textValue(payload.status) || null,
    signature_method: verification.method,
    timestamp: timestampToIso(payload.timestamp, request.headers.get("x-timestamp")),
    payload,
    raw_body: rawBody,
    headers: headersToRecord(request.headers),
    processing_status: "received",
    processing_error: null,
  };

  const { error: logError } = await admin
    .from("didit_webhook_events")
    .insert(logRecord);

  if (logError) {
    if (logError.code === "23505") {
      return NextResponse.json(
        {
          received: true,
          duplicate: true,
          eventId: textValue(payload.event_id),
          webhookType,
          processingStatus: "already_received",
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { error: "Unable to persist Didit webhook event." },
      { status: 500 },
    );
  }

  let processingStatus = "ignored";
  let processingError: string | null = null;

  try {
    if (SESSION_WEBHOOK_TYPES.has(webhookType)) {
      const result = await markVerificationFromWebhook(
        admin,
        payload,
        request.headers.get("x-timestamp"),
        verification.method !== "simple",
      );
      processingStatus = result ? "processed" : "ignored";
    } else if (ACCEPTED_WEBHOOK_TYPES.has(webhookType as DiditWebhookType)) {
      processingStatus = "processed";
    }
  } catch (error) {
    processingStatus = "failed";
    processingError =
      error instanceof Error ? error.message : "Unhandled Didit webhook error.";
  }

  const { error: finalizeError } = await admin
    .from("didit_webhook_events")
    .update({
      processing_status: processingStatus,
      processing_error: processingError,
      processed_at: new Date().toISOString(),
    })
    .eq("idempotency_key", idempotencyKey);

  if (finalizeError) {
    return NextResponse.json(
      { error: "Didit webhook was stored, but processing state could not be updated." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      received: true,
      signature: verification.method,
      eventId: textValue(payload.event_id),
      webhookType,
      processingStatus,
    },
    { status: 202 },
  );
}
