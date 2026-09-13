package com.ezkey.didit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/** Port of the types in {@code lib/didit.ts}. */
public final class DiditModels {

  private DiditModels() {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record CreateSessionResponse(
      @JsonProperty("session_id") String sessionId,
      @JsonProperty("session_kind") String sessionKind,
      @JsonProperty("session_number") Integer sessionNumber,
      @JsonProperty("session_token") String sessionToken,
      String url,
      @JsonProperty("vendor_data") String vendorData,
      Object metadata,
      String status,
      @JsonProperty("workflow_id") String workflowId,
      @JsonProperty("workflow_version") Integer workflowVersion,
      String callback) {}

  @JsonIgnoreProperties(ignoreUnknown = true)
  public record DecisionResponse(
      @JsonProperty("session_id") String sessionId,
      @JsonProperty("session_kind") String sessionKind,
      @JsonProperty("session_number") Integer sessionNumber,
      @JsonProperty("session_url") String sessionUrl,
      String status,
      String environment,
      @JsonProperty("workflow_id") String workflowId,
      @JsonProperty("workflow_version") Integer workflowVersion,
      @JsonProperty("vendor_data") String vendorData,
      Object metadata) {}

  public record CreateSessionInput(
      String userId,
      String email,
      String phone,
      String legalName,
      String dateOfBirth,
      String idCountry,
      String documentType,
      String storeName,
      String sellerType,
      String payoutCountry,
      String origin) {}
}
