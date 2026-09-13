package com.ezkey.controller;

import com.ezkey.config.AppProperties;
import com.ezkey.didit.DiditModels;
import com.ezkey.didit.DiditService;
import com.ezkey.seller.SellerVerificationService;
import com.ezkey.supabase.SupabaseClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Ports:
 * <ul>
 *   <li>{@code app/api/kyc/didit/session/route.ts} (POST)
 *   <li>{@code app/api/kyc/didit/status/route.ts} (GET)
 * </ul>
 * All validation messages, status codes and Didit error handling are kept 1:1.
 */
@RestController
@RequestMapping("/api/kyc/didit")
public class KycController {

  private final AppProperties props;
  private final SupabaseClient supabase;
  private final DiditService diditService;
  private final SellerVerificationService sellerVerificationService;
  private final ObjectMapper objectMapper;

  public KycController(
      AppProperties props,
      SupabaseClient supabase,
      DiditService diditService,
      SellerVerificationService sellerVerificationService,
      ObjectMapper objectMapper) {
    this.props = props;
    this.supabase = supabase;
    this.diditService = diditService;
    this.sellerVerificationService = sellerVerificationService;
    this.objectMapper = objectMapper;
  }

  // -----------------------------------------------------------------------
  // POST /api/kyc/didit/session — port of app/api/kyc/didit/session/route.ts
  // -----------------------------------------------------------------------
  @PostMapping("/session")
  public ResponseEntity<Map<String, Object>> createSession(
      HttpServletRequest request, @RequestBody(required = false) Map<String, Object> body) {

    if (!props.hasEnvVars()) {
      return error(503, "Authentication is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.");
    }

    SupabaseClient.SupabaseUser user = resolveUser(request);
    if (user == null) {
      return error(401, "Please log in or create an EZKEY account before starting KYC.");
    }

    if (body == null) {
      return error(400, "Invalid seller application payload.");
    }

    SellerApplicationPayload payload = parsePayload(body);
    if (payload == null) {
      return error(400, "Invalid seller application payload.");
    }

    String email = notBlank(payload.email()) ? payload.email() : user.email();
    List<String> missing = new ArrayList<>();
    if (isBlank(payload.legalName())) missing.add("legal name");
    if (isBlank(email)) missing.add("email");
    if (isBlank(payload.country())) missing.add("country");
    if (isBlank(payload.dateOfBirth())) missing.add("date of birth");
    if (isBlank(payload.documentType())) missing.add("ID document type");
    if (isBlank(payload.storeName())) missing.add("store name");
    if (isBlank(payload.sellerType())) missing.add("seller type");
    if (isBlank(payload.deliveryPlan())) missing.add("delivery plan");
    if (payload.productCategories().isEmpty()) missing.add("at least one product category");
    if (isBlank(payload.payoutCountry())) missing.add("payout country");
    if (isBlank(payload.accountHolderName())) missing.add("account holder name");

    if (!missing.isEmpty()) {
      return error(400, "Please complete: " + String.join(", ", missing) + ".");
    }
    if (!payload.sellerRulesAccepted() || !payload.kycConsent()) {
      return error(400, "Please accept the seller rules and consent to Didit identity verification before continuing.");
    }
    if (!props.hasAdminClient()) {
      return error(500, "Seller verification storage is not configured. Add SUPABASE_SERVICE_ROLE_KEY.");
    }

    try {
      DiditModels.CreateSessionResponse session = diditService.createSession(new DiditModels.CreateSessionInput(
          user.id(), email, normalizePhone(payload.phone()), payload.legalName(), payload.dateOfBirth(),
          payload.country(), payload.documentType(), payload.storeName(), payload.sellerType(),
          payload.payoutCountry(), getOrigin(request)));

      Map<String, Object> submittedDetails = new LinkedHashMap<>();
      submittedDetails.put("legal_name", payload.legalName());
      submittedDetails.put("email", email);
      submittedDetails.put("phone", payload.phone());
      submittedDetails.put("country", payload.country());
      submittedDetails.put("date_of_birth", payload.dateOfBirth());
      submittedDetails.put("document_type", payload.documentType());
      submittedDetails.put("store_name", payload.storeName());
      submittedDetails.put("seller_type", payload.sellerType());
      submittedDetails.put("product_categories", payload.productCategories());
      submittedDetails.put("delivery_plan", payload.deliveryPlan());
      submittedDetails.put("residential_address", payload.residentialAddress());
      submittedDetails.put("business_name", payload.businessName());
      submittedDetails.put("registration_number", payload.registrationNumber());
      submittedDetails.put("payout_method", payload.payoutMethod() != null ? payload.payoutMethod() : "bank_transfer");
      submittedDetails.put("payout_country", payload.payoutCountry());
      submittedDetails.put("account_holder_name", payload.accountHolderName());
      submittedDetails.put("kyc_provider", "Didit");
      submittedDetails.put("kyc_workflow_id", diditService.getWorkflowId());
      submittedDetails.put("consent_text", "Seller consented to EZKEY sharing details with Didit for live document, liveness, face match, and KYC checks.");
      submittedDetails.put("consent_at", java.time.Instant.now().toString());

      SellerVerificationService.UpdateResult result = sellerVerificationService.applyUpdate(
          new SellerVerificationService.UpdateInput(
              user.id(), session.sessionId(), session.status(), session.sessionNumber(),
              session.workflowId(), session.workflowVersion(), session.vendorData(),
              verificationUrl(session), session.metadata(), submittedDetails, session,
              null, null, null, null,
              payload.storeName(), email, payoutMethodForDatabase(payload.payoutMethod())));

      Map<String, Object> response = new LinkedHashMap<>();
      response.put("sessionId", session.sessionId());
      response.put("status", session.status());
      response.put("applicationStatus", result.applicationStatus());
      response.put("url", session.url());
      return ResponseEntity.ok(response);

    } catch (IllegalStateException e) {
      // Missing DIDIT_API_KEY -> 500, same as the TS catch branch.
      return error(500, "Didit is not configured. Add DIDIT_API_KEY.");
    } catch (RuntimeException e) {
      String message = e.getMessage() != null ? e.getMessage() : "Unable to create Didit session.";
      int status = message.contains("DIDIT_API_KEY") ? 500 : 502;
      if (status == 500) return error(500, "Didit is not configured. Add DIDIT_API_KEY.");
      return error(502, message);
    }
  }

  // -----------------------------------------------------------------------
  // GET /api/kyc/didit/status — port of app/api/kyc/didit/status/route.ts
  // -----------------------------------------------------------------------
  @GetMapping("/status")
  public ResponseEntity<Map<String, Object>> getStatus(
      HttpServletRequest request, @RequestParam(value = "sessionId", required = false) String sessionId) {

    SupabaseClient.SupabaseUser user = resolveUser(request);
    if (user == null) {
      return error(401, "Please log in to view seller verification status.");
    }

    // Load from seller_verifications (admin REST)
    JsonNode verification = supabase.selectSellerVerificationByUser(user.id(), isBlank(sessionId) ? null : sessionId);
    if (verification == null) {
      return error(404, "No seller verification session was found.");
    }

    String diditSessionId = verification.path("didit_session_id").asText(null);
    String status = verification.path("status").asText("Not Started");
    String applicationStatus = verification.path("application_status").asText("pending");
    String verificationUrl = verification.path("verification_url").isNull() ? null : verification.path("verification_url").asText(null);
    JsonNode submittedDetails = verification.path("submitted_details");

    if (!props.hasAdminClient()) {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("sessionId", diditSessionId);
      body.put("status", status);
      body.put("applicationStatus", applicationStatus);
      body.put("verificationUrl", verificationUrl);
      body.put("refreshError", "Status refresh is not configured. Add SUPABASE_SERVICE_ROLE_KEY.");
      return ResponseEntity.ok(body);
    }

    try {
      DiditModels.DecisionResponse decision = diditService.retrieveDecision(diditSessionId);
      String newStatus = decision.status() != null ? decision.status() : status;
      SellerVerificationService.UpdateResult update = sellerVerificationService.applyUpdate(
          new SellerVerificationService.UpdateInput(
              user.id(), diditSessionId, newStatus, decision.sessionNumber(),
              decision.workflowId(), decision.workflowVersion(), decision.vendorData(),
              decision.sessionUrl() != null ? decision.sessionUrl() : verificationUrl,
              decision.metadata(), null, null, null, decision,
              null, null,
              textField(submittedDetails, "store_name"), textField(submittedDetails, "email"),
              payoutFromDetails(submittedDetails)));

      Map<String, Object> body = new LinkedHashMap<>();
      body.put("sessionId", diditSessionId);
      body.put("status", newStatus);
      body.put("applicationStatus", update.applicationStatus());
      body.put("approved", update.approved());
      body.put("verificationUrl", decision.sessionUrl() != null ? decision.sessionUrl() : verificationUrl);
      return ResponseEntity.ok(body);

    } catch (Exception e) {
      Map<String, Object> body = new LinkedHashMap<>();
      body.put("sessionId", diditSessionId);
      body.put("status", status);
      body.put("applicationStatus", applicationStatus);
      body.put("verificationUrl", verificationUrl);
      body.put("refreshError", e.getMessage() != null ? e.getMessage() : "Unable to refresh Didit status yet.");
      return ResponseEntity.ok(body);
    }
  }

  // ---- helpers mirroring the TS helpers 1:1 ----

  private SupabaseClient.SupabaseUser resolveUser(HttpServletRequest request) {
    return supabase.resolveUser(request.getHeader("Authorization"), request.getHeader("Cookie"));
  }

  private String getOrigin(HttpServletRequest request) {
    String origin = request.getHeader("Origin");
    if (origin == null || origin.isBlank()) {
      String scheme = request.getScheme();
      String host = request.getHeader("Host");
      if (host != null) origin = scheme + "://" + host;
      else origin = props.getSiteUrl();
    }
    if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) return origin;
    String siteUrl = props.getSiteUrl();
    return siteUrl != null && !siteUrl.isBlank() ? siteUrl : origin;
  }

  private static String normalizePhone(String phone) {
    if (phone == null || phone.isBlank()) return null;
    String compact = phone.replaceAll("[\\s().\\-]", "");
    return compact.matches("^\\+\\d{7,15}$") ? compact : null;
  }

  private static String payoutMethodForDatabase(String payoutMethod) {
    if ("paypal".equals(payoutMethod) || "stripe".equals(payoutMethod)) return payoutMethod;
    return "bank_transfer";
  }

  private static String verificationUrl(DiditModels.CreateSessionResponse session) {
    return session.url();
  }

  private static String textField(JsonNode node, String key) {
    if (node == null || node.isNull()) return null;
    JsonNode value = node.path(key);
    if (value.isTextual() && !value.asText().isBlank()) return value.asText().trim();
    return null;
  }

  private static String payoutFromDetails(JsonNode submittedDetails) {
    String value = textField(submittedDetails, "payout_method");
    if ("paypal".equals(value) || "stripe".equals(value)) return value;
    return "bank_transfer";
  }

  private record SellerApplicationPayload(
      String legalName, String email, String phone, String country, String dateOfBirth,
      String documentType, String storeName, String sellerType, List<String> productCategories,
      String deliveryPlan, String residentialAddress, String businessName, String registrationNumber,
      String payoutMethod, String payoutCountry, String accountHolderName,
      boolean sellerRulesAccepted, boolean kycConsent) {}

  private SellerApplicationPayload parsePayload(Map<String, Object> body) {
    try {
      return new SellerApplicationPayload(
          str(body, "legalName"), str(body, "email"), str(body, "phone"), str(body, "country"),
          str(body, "dateOfBirth"), str(body, "documentType"), str(body, "storeName"), str(body, "sellerType"),
          strArray(body, "productCategories"), str(body, "deliveryPlan"), str(body, "residentialAddress"),
          str(body, "businessName"), str(body, "registrationNumber"), str(body, "payoutMethod"),
          str(body, "payoutCountry"), str(body, "accountHolderName"),
          Boolean.TRUE.equals(body.get("sellerRulesAccepted")), Boolean.TRUE.equals(body.get("kycConsent")));
    } catch (Exception e) {
      return null;
    }
  }

  private static String str(Map<String, Object> body, String key) {
    Object value = body.get(key);
    return value instanceof String s && !s.isBlank() ? s.trim() : null;
  }

  @SuppressWarnings("unchecked")
  private static List<String> strArray(Map<String, Object> body, String key) {
    Object value = body.get(key);
    if (value instanceof List<?> list) {
      List<String> out = new ArrayList<>();
      for (Object item : list) if (item instanceof String s) out.add(s);
      return out;
    }
    return List.of();
  }

  private static boolean isBlank(String value) { return value == null || value.isBlank(); }
  private static boolean notBlank(String value) { return value != null && !value.isBlank(); }

  private ResponseEntity<Map<String, Object>> error(int status, String message) {
    Map<String, Object> body = new LinkedHashMap<>();
    body.put("error", message);
    return ResponseEntity.status(status).body(body);
  }
}
