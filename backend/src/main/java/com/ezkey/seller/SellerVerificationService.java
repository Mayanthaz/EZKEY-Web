package com.ezkey.seller;

import com.ezkey.didit.DiditService;
import com.ezkey.supabase.SupabaseClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * Port of {@code lib/seller-verification.ts}. All column names, status mappings and the three-table
 * write (seller_verifications / vendor_details / profiles) are kept identical.
 */
@Service
public class SellerVerificationService {

  private final SupabaseClient supabase;
  private final ObjectMapper objectMapper;

  public SellerVerificationService(SupabaseClient supabase, ObjectMapper objectMapper) {
    this.supabase = supabase;
    this.objectMapper = objectMapper;
  }

  public record UpdateInput(
      String userId,
      String sessionId,
      String status,
      Integer sessionNumber,
      String workflowId,
      Integer workflowVersion,
      String vendorData,
      String verificationUrl,
      Object metadata,
      Map<String, Object> submittedDetails,
      Object providerPayload,
      Object webhookPayload,
      Object rawDecision,
      String lastWebhookEventId,
      String lastWebhookAt,
      String businessName,
      String businessEmail,
      String payoutMethod) {}

  public record UpdateResult(String applicationStatus, boolean approved) {}

  public static String statusFromDecision(Object decision, String fallback) {
    if (decision instanceof Map<?, ?> map) {
      Object status = map.get("status");
      if (status instanceof String s) return s;
    }
    // Jackson-decoded payloads may be JsonNode
    try {
      if (decision != null) {
        var node = new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(decision);
        if (node.has("status") && node.get("status").isTextual()) return node.get("status").asText();
      }
    } catch (Exception ignored) {}
    return fallback != null ? fallback : "Not Started";
  }

  public static String verificationUrl(Object payload) {
    if (payload == null) return null;
    try {
      var node = new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(payload);
      if (node.has("url") && node.get("url").isTextual()) return node.get("url").asText();
      if (node.has("session_url") && node.get("session_url").isTextual()) return node.get("session_url").asText();
    } catch (Exception ignored) {}
    if (payload instanceof Map<?, ?> map) {
      Object url = map.get("url");
      if (url instanceof String s) return s;
      Object sessionUrl = map.get("session_url");
      if (sessionUrl instanceof String s) return s;
    }
    return null;
  }

  public UpdateResult applyUpdate(UpdateInput input) {
    String status = input.status() != null ? input.status() : "Not Started";
    String applicationStatus = DiditService.mapDiditStatusToVerificationStatus(status);
    boolean approved = "verified".equals(applicationStatus);
    boolean rejected = "rejected".equals(applicationStatus);
    String now = Instant.now().toString();

    Map<String, Object> verificationRecord = new LinkedHashMap<>();
    verificationRecord.put("user_id", input.userId());
    verificationRecord.put("didit_session_id", input.sessionId());
    verificationRecord.put("status", status);
    verificationRecord.put("application_status", applicationStatus);
    if (input.sessionNumber() != null) verificationRecord.put("session_number", input.sessionNumber());
    if (input.workflowId() != null) verificationRecord.put("workflow_id", input.workflowId());
    if (input.workflowVersion() != null) verificationRecord.put("workflow_version", input.workflowVersion());
    if (input.vendorData() != null) verificationRecord.put("vendor_data", input.vendorData());
    if (input.verificationUrl() != null) verificationRecord.put("verification_url", input.verificationUrl());
    if (input.metadata() != null) verificationRecord.put("metadata", input.metadata());
    if (input.submittedDetails() != null) verificationRecord.put("submitted_details", input.submittedDetails());
    if (input.providerPayload() != null) verificationRecord.put("provider_payload", input.providerPayload());
    if (input.webhookPayload() != null) verificationRecord.put("webhook_payload", input.webhookPayload());
    if (input.rawDecision() != null) verificationRecord.put("raw_decision", input.rawDecision());
    if (input.lastWebhookEventId() != null) verificationRecord.put("last_webhook_event_id", input.lastWebhookEventId());
    if (input.lastWebhookAt() != null) verificationRecord.put("last_webhook_at", input.lastWebhookAt());
    if (approved) {
      verificationRecord.put("approved_at", now);
      verificationRecord.put("rejected_at", null);
    }
    if (rejected) {
      verificationRecord.put("rejected_at", now);
    }

    supabase.upsert("seller_verifications", verificationRecord, "didit_session_id");

    Map<String, Object> vendorDetails = new LinkedHashMap<>();
    vendorDetails.put("user_id", input.userId());
    vendorDetails.put("id_verification_status", applicationStatus);
    if (input.businessName() != null) vendorDetails.put("business_name", input.businessName());
    if (input.businessEmail() != null) vendorDetails.put("business_email", input.businessEmail());
    if (input.payoutMethod() != null) vendorDetails.put("payout_method", input.payoutMethod());
    supabase.upsert("vendor_details", vendorDetails, "user_id");

    if (approved) {
      Map<String, Object> profilePatch = new LinkedHashMap<>();
      profilePatch.put("role", "seller");
      profilePatch.put("is_verified", true);
      supabase.updateProfileRole(input.userId(), profilePatch);
    }

    return new UpdateResult(applicationStatus, approved);
  }
}
