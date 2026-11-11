package com.ezkey.supabase;

import com.ezkey.config.AppProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Minimal Supabase REST client. Port of {@code lib/supabase/{server,admin,proxy}.ts} and every
 * {@code supabase.from(...)} call in the Next.js routes. Uses {@code SUPABASE_SERVICE_ROLE_KEY}
 * when {@code admin} semantics are needed and the caller's JWT otherwise, exactly like the
 * original code did.
 */
@Component
public class SupabaseClient {

  private final AppProperties props;
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;

  public SupabaseClient(AppProperties props, ObjectMapper objectMapper) {
    this.props = props;
    this.objectMapper = objectMapper;
    this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
  }

  public record SupabaseUser(String id, String email) {}

  /** Mirrors {@code supabase.auth.getUser()} in the Next.js routes. */
  public SupabaseUser getUserFromAuthorization(String authorizationHeader) {
    if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
      return null;
    }
    String token = authorizationHeader.substring(7).trim();
    if (token.isEmpty()) {
      return null;
    }
    return fetchUser(token);
  }

  /** Extracts {@code sb-*-auth-token} from cookies (Supabase SSR cookie). */
  public SupabaseUser getUserFromCookies(String cookieHeader) {
    if (cookieHeader == null || cookieHeader.isBlank()) {
      return null;
    }
    // Supabase SSR stores the access token in a cookie whose name contains "auth-token".
    // We look for any cookie value that looks like a JWT and try it.
    for (String part : cookieHeader.split(";")) {
      String trimmed = part.trim();
      int eq = trimmed.indexOf('=');
      String value = eq >= 0 ? trimmed.substring(eq + 1).trim() : trimmed;
      // URL-decode and strip quotes that the browser may add.
      value = value.replace("%22", "").replace("\"", "").trim();
      // Supabase stores JSON array like ["base64..."] in newer SSR; handle that.
      if (value.startsWith("[")) {
        try {
          JsonNode arr = objectMapper.readTree(value);
          if (arr.isArray() && !arr.isEmpty()) {
            String candidate = arr.get(0).asText("");
            SupabaseUser user = tryFetchUser(candidate);
            if (user != null) return user;
          }
        } catch (Exception ignored) {
        }
        continue;
      }
      SupabaseUser user = tryFetchUser(value);
      if (user != null) return user;
    }
    return null;
  }

  public SupabaseUser resolveUser(String authorizationHeader, String cookieHeader) {
    SupabaseUser byHeader = getUserFromAuthorization(authorizationHeader);
    if (byHeader != null) return byHeader;
    return getUserFromCookies(cookieHeader);
  }

  private SupabaseUser tryFetchUser(String token) {
    if (token == null || token.isBlank() || token.chars().filter(c -> c == '.').count() < 2) {
      return null;
    }
    try {
      return fetchUser(token);
    } catch (Exception e) {
      return null;
    }
  }

  private SupabaseUser fetchUser(String token) {
    try {
      String url = props.getSupabase().getUrl();
      String anonKey = props.getSupabase().getAnonKey();
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(url + "/auth/v1/user"))
              .header("apikey", anonKey)
              .header("Authorization", "Bearer " + token)
              .GET()
              .timeout(Duration.ofSeconds(10))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() != 200) return null;
      JsonNode body = objectMapper.readTree(res.body());
      String id = body.path("id").asText(null);
      String email = body.path("email").asText(null);
      if (id == null || id.isBlank()) return null;
      return new SupabaseUser(id, email);
    } catch (Exception e) {
      return null;
    }
  }

  /** Exchange OAuth code for session — port of {@code supabase.auth.exchangeCodeForSession(code)}. */
  public ExchangeResult exchangeCodeForSession(String code) {
    try {
      String url = props.getSupabase().getUrl();
      String anonKey = props.getSupabase().getAnonKey();
      ObjectNode payload = objectMapper.createObjectNode();
      payload.put("auth_code", code);
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(url + "/auth/v1/token?grant_type=pkce"))
              .header("apikey", anonKey)
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
              .timeout(Duration.ofSeconds(15))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() == 200) {
        JsonNode body = objectMapper.readTree(res.body());
        String accessToken = body.path("access_token").asText(null);
        String refreshToken = body.path("refresh_token").asText(null);
        return new ExchangeResult(true, accessToken, refreshToken, null);
      }
      JsonNode err = null;
      try {
        err = objectMapper.readTree(res.body());
      } catch (Exception ignored) {}
      String msg = err != null ? err.path("msg").asText(err.path("error_description").asText(res.body())) : res.body();
      return new ExchangeResult(false, null, null, msg);
    } catch (Exception e) {
      return new ExchangeResult(false, null, null, e.getMessage());
    }
  }

  public record ExchangeResult(
      boolean success, String accessToken, String refreshToken, String error) {}

  /** Verify OTP — port of {@code supabase.auth.verifyOtp({ token_hash, type })}. */
  public VerifyOtpResult verifyOtp(String tokenHash, String type) {
    try {
      String url = props.getSupabase().getUrl();
      String anonKey = props.getSupabase().getAnonKey();
      ObjectNode payload = objectMapper.createObjectNode();
      payload.put("token_hash", tokenHash);
      payload.put("type", type);
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(url + "/auth/v1/verify"))
              .header("apikey", anonKey)
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
              .timeout(Duration.ofSeconds(15))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() == 200) {
        JsonNode body = objectMapper.readTree(res.body());
        String accessToken = body.path("access_token").asText(null);
        String refreshToken = body.path("refresh_token").asText(null);
        return new VerifyOtpResult(true, accessToken, refreshToken, null);
      }
      String msg = res.body();
      try {
        JsonNode err = objectMapper.readTree(res.body());
        msg = err.path("msg").asText(err.path("error_description").asText(msg));
      } catch (Exception ignored) {}
      return new VerifyOtpResult(false, null, null, msg);
    } catch (Exception e) {
      return new VerifyOtpResult(false, null, null, e.getMessage());
    }
  }

  public record VerifyOtpResult(
      boolean success, String accessToken, String refreshToken, String error) {}

  // -------------------------------------------------------------------------
  // PostgREST helpers (service_role)
  // -------------------------------------------------------------------------

  private boolean hasAdmin() {
    return props.hasAdminClient();
  }

  private String adminKey() {
    return props.getSupabase().getServiceRoleKey();
  }

  private String restBase() {
    return props.getSupabase().getUrl() + "/rest/v1";
  }

  public JsonNode selectSellerVerificationByUser(String userId, String sessionId) {
    try {
      String filter = "user_id=eq." + userId;
      if (sessionId != null) {
        filter += "&didit_session_id=eq." + sessionId;
      }
      String uri = restBase() + "/seller_verifications?select=didit_session_id,status,application_status,verification_url,submitted_details,created_at&" + filter;
      if (sessionId == null) {
        uri += "&order=created_at.desc&limit=1";
      }
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(uri))
              .header("apikey", adminKey())
              .header("Authorization", "Bearer " + adminKey())
              .GET()
              .timeout(Duration.ofSeconds(10))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() != 200) return null;
      JsonNode arr = objectMapper.readTree(res.body());
      if (arr.isArray() && !arr.isEmpty()) return arr.get(0);
      return null;
    } catch (Exception e) {
      return null;
    }
  }

  public JsonNode selectSellerVerificationBySessionId(String sessionId) {
    try {
      String uri = restBase() + "/seller_verifications?select=user_id&didit_session_id=eq." + sessionId + "&limit=1";
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(uri))
              .header("apikey", adminKey())
              .header("Authorization", "Bearer " + adminKey())
              .GET()
              .timeout(Duration.ofSeconds(10))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() != 200) return null;
      JsonNode arr = objectMapper.readTree(res.body());
      if (arr.isArray() && !arr.isEmpty()) return arr.get(0);
      return null;
    } catch (Exception e) {
      return null;
    }
  }

  public RestInsertResult insertWebhookEvent(Map<String, Object> record) {
    try {
      String body = objectMapper.writeValueAsString(record);
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(restBase() + "/didit_webhook_events"))
              .header("apikey", adminKey())
              .header("Authorization", "Bearer " + adminKey())
              .header("Content-Type", "application/json")
              .header("Prefer", "return=representation")
              .POST(HttpRequest.BodyPublishers.ofString(body))
              .timeout(Duration.ofSeconds(10))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      return new RestInsertResult(res.statusCode(), res.body());
    } catch (Exception e) {
      return new RestInsertResult(500, e.getMessage());
    }
  }

  public RestInsertResult updateWebhookEvent(String idempotencyKey, Map<String, Object> patch) {
    try {
      String body = objectMapper.writeValueAsString(patch);
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(restBase() + "/didit_webhook_events?idempotency_key=eq." + idempotencyKey))
              .header("apikey", adminKey())
              .header("Authorization", "Bearer " + adminKey())
              .header("Content-Type", "application/json")
              .header("Prefer", "return=representation")
              .method("PATCH", HttpRequest.BodyPublishers.ofString(body))
              .timeout(Duration.ofSeconds(10))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      return new RestInsertResult(res.statusCode(), res.body());
    } catch (Exception e) {
      return new RestInsertResult(500, e.getMessage());
    }
  }

  public record RestInsertResult(int statusCode, String body) {
    public boolean isConflict() { return statusCode == 409; }
    public boolean isSuccess() { return statusCode >= 200 && statusCode < 300; }
  }

  /** Generic upsert via PostgREST - mirrors supabase.from(...).upsert(record, { onConflict }). */
  public void upsert(String table, Map<String, Object> record, String onConflict) {
    try {
      String body = objectMapper.writeValueAsString(record);
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(restBase() + "/" + table + "?on_conflict=" + onConflict))
              .header("apikey", adminKey())
              .header("Authorization", "Bearer " + adminKey())
              .header("Content-Type", "application/json")
              .header("Prefer", "resolution=merge-duplicates,return=minimal")
              .POST(HttpRequest.BodyPublishers.ofString(body))
              .timeout(Duration.ofSeconds(10))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() < 200 || res.statusCode() >= 300) {
        throw new RuntimeException("PostgREST upsert failed (" + res.statusCode() + "): " + res.body());
      }
    } catch (RuntimeException re) {
      throw re;
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public void updateProfileRole(String userId, Map<String, Object> patch) {
    try {
      String body = objectMapper.writeValueAsString(patch);
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(restBase() + "/profiles?id=eq." + userId))
              .header("apikey", adminKey())
              .header("Authorization", "Bearer " + adminKey())
              .header("Content-Type", "application/json")
              .header("Prefer", "return=minimal")
              .method("PATCH", HttpRequest.BodyPublishers.ofString(body))
              .timeout(Duration.ofSeconds(10))
              .build();
      HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() < 200 || res.statusCode() >= 300) {
        throw new RuntimeException("Profile update failed (" + res.statusCode() + "): " + res.body());
      }
    } catch (RuntimeException re) {
      throw re;
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
