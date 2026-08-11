import { createHmac, timingSafeEqual } from "node:crypto";

export type DiditWebhookStatus =
  | "Approved"
  | "Declined"
  | "In Review"
  | "In Progress"
  | "Not Started"
  | "Awaiting User"
  | "Abandoned"
  | "Expired"
  | "Kyc Expired"
  | "KYC Expired"
  | "Resubmitted";

export type DiditWebhookType =
  | "status.updated"
  | "data.updated"
  | "user.status.updated"
  | "user.data.updated"
  | "business.status.updated"
  | "business.data.updated"
  | "activity.created"
  | "transaction.created"
  | "transaction.status.updated";

export type DiditWebhookPayload = {
  event_id?: string;
  session_id?: string;
  business_session_id?: string;
  session_kind?: "user" | "business";
  vendor_user_id?: string;
  vendor_business_id?: string;
  transaction_id?: string;
  txn_id?: string;
  webhook_type?: DiditWebhookType | string;
  status?: DiditWebhookStatus | string;
  timestamp?: number;
  created_at?: number;
  application_id?: string;
  workflow_id?: string;
  workflow_version?: number;
  vendor_data?: string;
  metadata?: unknown;
  decision?: unknown;
  resubmit_info?: unknown;
  [key: string]: unknown;
};

export type DiditWebhookVerificationResult = {
  payload: DiditWebhookPayload;
  method: "v2" | "raw" | "simple";
};

function hmacHex(secret: string, value: string) {
  return createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

function hmacRawHex(secret: string, value: Buffer) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function safeCompareHex(received: string | null, expected: string) {
  if (!received) {
    return false;
  }

  const normalizedReceived = received.trim().replace(/^sha256=/i, "").toLowerCase();
  const normalizedExpected = expected.trim().toLowerCase();

  if (normalizedReceived.length !== normalizedExpected.length) {
    return false;
  }

  const receivedBuffer = Buffer.from(normalizedReceived, "utf8");
  const expectedBuffer = Buffer.from(normalizedExpected, "utf8");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function timestampIsFresh(timestamp: string | null) {
  if (!timestamp) {
    return false;
  }

  const parsed = Number.parseInt(timestamp, 10);

  if (!Number.isFinite(parsed)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  return Math.abs(now - parsed) <= 300;
}

function parsePayload(rawBody: string) {
  return JSON.parse(rawBody) as DiditWebhookPayload;
}

function shortenFloats(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(shortenFloats);
  }

  if (value !== null && typeof value === "object") {
    return Object.keys(value).reduce<Record<string, unknown>>((shortened, key) => {
      shortened[key] = shortenFloats((value as Record<string, unknown>)[key]);
      return shortened;
    }, {});
  }

  if (typeof value === "number" && Number.isFinite(value) && value % 1 === 0) {
    return Math.trunc(value);
  }

  return value;
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }

  if (value !== null && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = sortKeys((value as Record<string, unknown>)[key]);
        return sorted;
      }, {});
  }

  return value;
}

function canonicalJson(payload: DiditWebhookPayload) {
  return JSON.stringify(sortKeys(shortenFloats(payload)));
}

function simpleSignatureValue(payload: DiditWebhookPayload, timestampHeader: string | null) {
  return [
    payload.timestamp ?? timestampHeader ?? "",
    payload.session_id ?? payload.business_session_id ?? "",
    payload.status ?? "",
    payload.webhook_type ?? "",
  ].join(":");
}

export function verifyDiditWebhook(
  rawBody: Buffer | string,
  headers: Headers,
  secret: string,
): DiditWebhookVerificationResult {
  const timestamp = headers.get("x-timestamp");

  if (!timestampIsFresh(timestamp)) {
    throw new Error("Missing or stale Didit webhook timestamp");
  }

  const signatureV2 = headers.get("x-signature-v2");
  const signatureRaw = headers.get("x-signature");
  const rawBodyBuffer = Buffer.isBuffer(rawBody)
    ? rawBody
    : Buffer.from(rawBody, "utf8");
  const rawBodyText = rawBodyBuffer.toString("utf8");
  let payload: DiditWebhookPayload | null = null;

  const getPayload = () => {
    payload ??= parsePayload(rawBodyText);
    return payload;
  };

  if (signatureV2) {
    const expectedV2 = hmacHex(secret, canonicalJson(getPayload()));

    if (safeCompareHex(signatureV2, expectedV2)) {
      return { payload: getPayload(), method: "v2" };
    }
  }

  if (signatureRaw) {
    const expectedRaw = hmacRawHex(secret, rawBodyBuffer);

    if (safeCompareHex(signatureRaw, expectedRaw)) {
      return { payload: getPayload(), method: "raw" };
    }
  }

  const signatureSimple = headers.get("x-signature-simple");
  const expectedSimple = hmacHex(secret, simpleSignatureValue(getPayload(), timestamp));

  if (safeCompareHex(signatureSimple, expectedSimple)) {
    return { payload: getPayload(), method: "simple" };
  }

  throw new Error("Invalid Didit webhook signature");
}
