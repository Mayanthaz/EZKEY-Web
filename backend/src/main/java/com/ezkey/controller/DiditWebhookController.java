package com.ezkey.controller;

import com.ezkey.config.AppProperties;
import com.ezkey.didit.DiditWebhookService;
import com.ezkey.seller.SellerVerificationService;
import com.ezkey.supabase.SupabaseClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.time.Instant;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Port of {@code app/api/webhooks/didit/route.ts}. All webhook types, idempotency,
 * signature checks, seller lookup and verification updates are kept 1:1.
 */
@RestController
@RequestMapping("/api/webhooks/didit")
public class DiditWebhookController {

  private static final Set<String> SESSION_WEBHOOK_TYPES = Set.of("status.updated", "data.updated");
  private static final Set<String> ACCEPTED_WEBHOOK_TYPES = Set.of(
      "status.updated", "data.updated",
      "user.status.updated", "user.data.updated",
      "business.status.updated", "business.data.updated",
      "activity.created", "transaction.created", "transaction.status.updated");

  private final AppProperties props;
  private final SupabaseClient supabase;
  private final DiditWebhookService webhookService;
  private final SellerVerificationService sellerVerificationService;
  private final ObjectMapper objectMapper;

  public DiditWebhookController(
      AppProperties props,
      SupabaseClient supabase,
      DiditWebhookService webhookService,
      SellerVerificationService sellerVerificationService,
      ObjectMapper objectMapper) {
    this.props = props;
    this.supabase = supabase;
    this.webhookService = webhookService;
    this.sellerVerificationService = sellerVerificationService;
    this.objectMapper = objectMapper;
  }

  @PostMapping
  public ResponseEntity<Map<String, Object>> handle(HttpServletRequest request) throws IOException {
    String webhookSecret = props.getDidit().getWebhookSecret();
    if (webhookSecret == null || webhookSecret.isBlank()) {
      return error(500, "DIDIT_WEBHOOK_SECRET is not configured.");
    }

    byte[] rawBody = request.getInputStream().readAllBytes();
    String rawBodyText = new String(rawBody, java.nio.charset.StandardCharsets.UTF_8);

    Map<String, String> headers = new LinkedHashMap<>();
    Enumeration<String> names = request.getHeaderNames();
    while (names != null && names.hasMoreElements()) {
      String name = names.nextElement();
      headers.put(name, request.getHeader(name));
    }

    DiditWebhookService.VerificationResult verification;
    try {
      verification = webhookService.verify(rawBody, headers, webhookSecret);
    } catch (IllegalArgumentException e) {
      System.err.println("Didit webhook signature validation failed: " + e.getMessage() + " rawBody=" + rawBodyText);
      return error(401, "Invalid Didit webhook signature.");
    }

    if (!props.hasAdminClient()) {
      return error(500, "SUPABASE_SERVICE_ROLE_KEY is not configured.");
    }

    DiditWebhookService.WebhookPayload payload = verification.payload();
    String webhookType = normalizeWebhookType(payload.get("webhook_type"));
    String idempotencyKey = buildIdempotencyKey(payload);

    if (idempotencyKey == null || idempotencyKey.isBlank()) {
      return error(400, "Didit webhook payload did not contain an idempotency key.");
    }

    Map<String, Object> logRecord = new LinkedHashMap<>();
    logRecord.put("idempotency_key", idempotencyKey);
    logRecord.put("event_id", textValue(payload.get("event_id")));
    logRecord.put("webhook_type", webhookType);
    logRecord.put("session_id", textValue(payload.get("session_id")));
    logRecord.put("business_session_id", textValue(payload.get("business_session_id")));
    logRecord.put("session_kind", textValue(payload.get("session_kind")));
    logRecord.put("status", textValue(payload.get("status")));
    logRecord.put("signature_method", verification.method());
    logRecord.put("timestamp", timestampToIso(payload.get("timestamp"), headers.get("x-timestamp")));
    logRecord.put("payload", payload);
    logRecord.put("raw_body", rawBodyText);
    logRecord.put("headers", headersToRecord(headers));
    logRecord.put("processing_status", "received");
    logRecord.put("processing_error", null);

    SupabaseClient.RestInsertResult insertResult = supabase.insertWebhookEvent(logRecord);
    if (!insertResult.isSuccess()) {
      if (insertResult.isConflict() || insertResult.body().contains("23505") || insertResult.body().contains("duplicate")) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("received", true);
        body.put("duplicate", true);
        body.put("eventId", textValue(payload.get("event_id")));
        body.put("webhookType", webhookType);
        body.put("processingStatus", "already_received");
        return ResponseEntity.ok(body);
      }
      return error(500, "Unable to persist Didit webhook event.");
    }

    String processingStatus = "ignored";
    String processingError = null;
    try {
      if (SESSION_WEBHOOK_TYPES.contains(webhookType)) {
        boolean trustDecision = !"simple".equals(verification.method());
        var result = markVerificationFromWebhook(payload, headers.get("x-timestamp"), trustDecision);
        processingStatus = result != null ? "processed" : "ignored";
      } else if (ACCEPTED_WEBHOOK_TYPES.contains(webhookType)) {
        processingStatus = "processed";
      }
    } catch (Exception e) {
      processingStatus = "failed";
      processingError = e.getMessage() != null ? e.getMessage() : "Unhandled Didit webhook error.";
    }

    Map<String, Object> patch = new LinkedHashMap<>();
    patch.put("processing_status", processingStatus);
    patch.put("processing_error", processingError);
    patch.put("processed_at", Instant.now().toString());
    SupabaseClient.RestInsertResult updateResult = supabase.updateWebhookEvent(idempotencyKey, patch);
    if (!updateResult.isSuccess()) {
      return error(500, "Didit webhook was stored, but processing state could not be updated.");
    }

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("received", true);
    response.put("signature", verification.method());
    response.put("eventId", textValue(payload.get("event_id")));
    response.put("webhookType", webhookType);
    response.put("processingStatus", processingStatus);
    return ResponseEntity.status(202).body(response);
  }

  private SellerVerificationService.UpdateResult markVerificationFromWebhook(
      DiditWebhookService.WebhookPayload payload, String headerTimestamp, boolean trustDecisionBody) {

    String sessionId = sessionIdFromPayload(payload);
    if (sessionId == null) return null;
    String userId = resolveSellerUserId(payload, sessionId);
    if (userId == null) return null;

    Object sessionNumberRaw = payload.get("session_number");
    Integer sessionNumber = null;
    if (sessionNumberRaw instanceof Number n) sessionNumber = n.intValue();
    else if (payload.get("workflow_version") instanceof Number n) sessionNumber = n.intValue();

    Object workflowVersionRaw = payload.get("workflow_version");
    Integer workflowVersion = workflowVersionRaw instanceof Number n ? n.intValue() : null;

    return sellerVerificationService.applyUpdate(new SellerVerificationService.UpdateInput(
        userId, sessionId, textValue(payload.get("status")) != null ? textValue(payload.get("status")) : "Not Started",
        sessionNumber, textValue(payload.get("workflow_id")), workflowVersion,
        textValue(payload.get("vendor_data")), textValue(payload.get("session_url")),
        payload.get("metadata"), null, null, payload,
        trustDecisionBody ? payload.get("decision") : null,
        textValue(payload.get("event_id")), timestampToIso(payload.get("timestamp"), headerTimestamp),
        null, null, null));
  }

  private String resolveSellerUserId(DiditWebhookService.WebhookPayload payload, String sessionId) {
    String direct = textValue(payload.get("vendor_data"));
    if (direct != null) return direct;
    Object metadata = payload.get("metadata");
    if (metadata instanceof Map<?, ?> map) {
      String fromMeta = textValue(map.get("user_id"));
      if (fromMeta != null) return fromMeta;
    }
    var row = supabase.selectSellerVerificationBySessionId(sessionId);
    if (row != null) {
      String userId = row.path("user_id").asText(null);
      if (userId != null && !userId.isBlank()) return userId;
    }
    return null;
  }

  private static String sessionIdFromPayload(DiditWebhookService.WebhookPayload payload) {
    String sid = textValue(payload.get("session_id"));
    return sid != null ? sid : textValue(payload.get("business_session_id"));
  }

  private static String buildIdempotencyKey(DiditWebhookService.WebhookPayload payload) {
    String eventId = textValue(payload.get("event_id"));
    if (eventId != null) return eventId;
    String resourceId = sessionIdFromPayload(payload);
    if (resourceId == null) resourceId = textValue(payload.get("vendor_user_id"));
    if (resourceId == null) resourceId = textValue(payload.get("vendor_business_id"));
    if (resourceId == null) resourceId = textValue(payload.get("transaction_id"));
    if (resourceId == null) resourceId = textValue(payload.get("txn_id"));
    if (resourceId == null) resourceId = textValue(payload.get("vendor_data"));
    List<String> parts = new ArrayList<>();
    if (resourceId != null) parts.add(resourceId);
    Object status = payload.get("status");
    if (status instanceof String s && !s.isBlank()) parts.add(s);
    Object wtype = payload.get("webhook_type");
    parts.add(wtype instanceof String s && !s.isBlank() ? s : "unknown");
    String key = String.join(":", parts);
    return key.isBlank() ? null : key;
  }

  private static String textValue(Object value) {
    return value instanceof String s && !s.isBlank() ? s.trim() : null;
  }

  private static String normalizeWebhookType(Object value) {
    return value instanceof String s && !s.isBlank() ? s.trim() : "unknown";
  }

  private static String timestampToIso(Object payloadTimestamp, String headerTimestamp) {
    Long seconds = timestampSeconds(payloadTimestamp);
    if (seconds == null) seconds = timestampSeconds(headerTimestamp);
    if (seconds != null) return Instant.ofEpochSecond(seconds).toString();
    return Instant.now().toString();
  }

  private static Long timestampSeconds(Object value) {
    if (value instanceof Number n) return n.longValue();
    if (value instanceof String s) {
      try { return Long.parseLong(s.trim()); } catch (NumberFormatException ignored) {}
    }
    return null;
  }

  private static Map<String, String> headersToRecord(Map<String, String> headers) {
    Map<String, String> out = new LinkedHashMap<>();
    for (Map.Entry<String, String> e : headers.entrySet()) {
      String lower = e.getKey().toLowerCase(java.util.Locale.ROOT);
      if (lower.startsWith("x-signature") || lower.equals("x-timestamp") || lower.equals("content-type") || lower.equals("user-agent")) {
        out.put(e.getKey(), e.getValue());
      }
    }
    return out;
  }

  private ResponseEntity<Map<String, Object>> error(int status, String message) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("error", message);
    return ResponseEntity.status(status).body(body);
  }
}
