package com.ezkey.didit;

import com.ezkey.config.AppProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * Port of {@code lib/didit.ts} — every validation, mapping and Didit HTTP call kept 1:1.
 */
@Service
public class DiditService {

  static final String FREE_KYC_WORKFLOW_ID = "54a83627-35c6-468c-b579-7be7d47dd4db";

  private final AppProperties props;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;

  public DiditService(AppProperties props, ObjectMapper objectMapper) {
    this.props = props;
    this.objectMapper = objectMapper;
    this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15)).build();
  }

  public String getWorkflowId() {
    return FREE_KYC_WORKFLOW_ID;
  }

  // ---- public API mirroring lib/didit.ts ---------------------------------

  public DiditModels.CreateSessionResponse createSession(DiditModels.CreateSessionInput input) {
    String idCountry = normalizeCountryToIso3(input.idCountry());
    Map<String, Object> expectedDetails = new LinkedHashMap<>(splitName(input.legalName()));
    if (input.dateOfBirth() != null) expectedDetails.put("date_of_birth", input.dateOfBirth());
    if (idCountry != null) expectedDetails.put("id_country", idCountry);
    expectedDetails.put("expected_document_types", expectedDocumentTypes(input.documentType()));

    Map<String, Object> contactDetails = new LinkedHashMap<>();
    if (input.email() != null) contactDetails.put("email", input.email());
    if (input.phone() != null) contactDetails.put("phone", input.phone());
    contactDetails.put("send_notification_emails", true);
    contactDetails.put("email_lang", "en");

    Map<String, Object> metadata = new LinkedHashMap<>();
    metadata.put("context", "seller_onboarding");
    metadata.put("user_id", input.userId());
    metadata.put("store_name", input.storeName());
    metadata.put("seller_type", input.sellerType());
    metadata.put("payout_country", input.payoutCountry());
    metadata.put("requested_document_type", input.documentType() != null ? input.documentType() : "national_id_or_driving_license");

    Map<String, Object> body = new LinkedHashMap<>();
    body.put("workflow_id", getWorkflowId());
    body.put("vendor_data", input.userId());
    body.put("callback", input.origin() + "/become-a-seller/kyc-result");
    body.put("callback_method", "both");
    body.put("language", "en");
    body.put("contact_details", contactDetails);
    body.put("expected_details", expectedDetails);
    body.put("metadata", metadata);

    return diditFetch("/v3/session/", "POST", body, DiditModels.CreateSessionResponse.class);
  }

  public DiditModels.DecisionResponse retrieveDecision(String sessionId) {
    return diditFetch("/v3/session/" + encode(sessionId) + "/decision/", "GET", null, DiditModels.DecisionResponse.class);
  }

  // ---- mappings ported verbatim from lib/didit.ts -------------------------

  public static String normalizeCountryToIso3(String country) {
    if (country == null || country.isBlank()) return null;
    String value = country.trim();
    String normalized = value.toLowerCase(Locale.ROOT);
    Map<String, String> aliases = Map.ofEntries(
        Map.entry("malaysia", "MYS"), Map.entry("mys", "MYS"),
        Map.entry("sri_lanka", "LKA"), Map.entry("sri lanka", "LKA"), Map.entry("lka", "LKA"),
        Map.entry("united states", "USA"), Map.entry("usa", "USA"), Map.entry("us", "USA"),
        Map.entry("india", "IND"), Map.entry("ind", "IND"),
        Map.entry("singapore", "SGP"), Map.entry("sgp", "SGP"));
    if (aliases.containsKey(normalized)) return aliases.get(normalized);
    if (value.matches("(?i)^[a-z]{3}$")) return value.toUpperCase(Locale.ROOT);
    return null;
  }

  public static String mapDiditStatusToVerificationStatus(String status) {
    if (status == null) return "pending";
    return switch (status) {
      case "Approved" -> "verified";
      case "Declined", "Expired", "Abandoned", "Kyc Expired", "KYC Expired" -> "rejected";
      case "In Progress", "In Review", "Resubmitted", "Awaiting User" -> "submitted";
      default -> "pending";
    };
  }

  public static boolean isSubmittedStatus(String status) {
    return "submitted".equals(mapDiditStatusToVerificationStatus(status));
  }

  // ---- private helpers -----------------------------------------------------

  private static Map<String, Object> splitName(String fullName) {
    if (fullName == null || fullName.isBlank()) return Map.of();
    String[] parts = fullName.trim().split("\\s+");
    if (parts.length == 1) return Map.of("first_name", parts[0]);
    return Map.of("first_name", parts[0], "last_name", String.join(" ", java.util.Arrays.copyOfRange(parts, 1, parts.length)));
  }

  private static List<String> expectedDocumentTypes(String documentType) {
    if (documentType == null) return List.of("ID", "DL");
    return switch (documentType) {
      case "passport" -> List.of("P");
      case "driving_license" -> List.of("DL");
      case "national_id" -> List.of("ID");
      default -> List.of("ID", "DL");
    };
  }

  private <T> T diditFetch(String path, String method, Object body, Class<T> type) {
    String apiKey = props.getDidit().getApiKey();
    if (apiKey == null || apiKey.isBlank()) throw new IllegalStateException("Missing DIDIT_API_KEY");
    String base = props.getDidit().getApiBaseUrl();
    try {
      String json = body != null ? objectMapper.writeValueAsString(body) : null;
      HttpRequest.Builder builder = HttpRequest.newBuilder()
          .uri(URI.create(base + path))
          .header("Accept", "application/json")
          .header("Content-Type", "application/json")
          .header("x-api-key", apiKey)
          .timeout(Duration.ofSeconds(20));
      if ("GET".equals(method)) builder.GET();
      else builder.method(method, HttpRequest.BodyPublishers.ofString(json != null ? json : ""));
      HttpResponse<String> res = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() < 200 || res.statusCode() >= 300) {
        String message = "Didit request failed with " + res.statusCode();
        try {
          JsonNode node = objectMapper.readTree(res.body());
          if (node.has("detail") && node.get("detail").isTextual()) message = node.get("detail").asText();
          else if (node.has("message") && node.get("message").isTextual()) message = node.get("message").asText();
          else message = node.toString();
        } catch (Exception ignored) {
          if (res.body() != null && !res.body().isBlank()) message = res.body();
        }
        throw new RuntimeException(message);
      }
      return objectMapper.readValue(res.body(), type);
    } catch (RuntimeException re) {
      throw re;
    } catch (Exception e) {
      throw new RuntimeException(e.getMessage(), e);
    }
  }

  private static String encode(String value) {
    try { return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8); }
    catch (Exception e) { return value; }
  }
}
