package com.ezkey.admin;

import com.ezkey.config.AppProperties;
import com.ezkey.supabase.SupabaseClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Admin authentication. Credentials are checked against Supabase Auth (password grant); the account
 * must additionally hold {@code profiles.role = 'admin'}. Tokens are kept in HttpOnly cookies by
 * {@link AdminAuthController} and re-verified (with a short cache) on every admin request.
 */
@Service
public class AdminAuthService {

  private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);

  static final int MAX_FAILED_ATTEMPTS = 5;
  static final long LOCKOUT_MILLIS = Duration.ofMinutes(15).toMillis();
  private static final long VERIFY_CACHE_MILLIS = Duration.ofSeconds(30).toMillis();

  public record Session(String accessToken, String refreshToken, AdminUser user) {}

  private record CachedUser(AdminUser user, long expiresAt) {}

  private final AppProperties props;
  private final SupabaseClient supabase;
  private final AdminDataClient data;
  private final ObjectMapper mapper;
  private final HttpClient http =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  private final Map<String, CachedUser> verifyCache = new ConcurrentHashMap<>();
  private final Map<String, Deque<Long>> failures = new ConcurrentHashMap<>();

  public AdminAuthService(
      AppProperties props, SupabaseClient supabase, AdminDataClient data, ObjectMapper mapper) {
    this.props = props;
    this.supabase = supabase;
    this.data = data;
    this.mapper = mapper;
  }

  // ---------------------------------------------------------------- login / refresh

  public Session login(String email, String password, String ip) {
    requireConfigured();
    String limiterKey = limiterKey(email, ip);
    assertNotLocked(limiterKey);

    ObjectNode payload = mapper.createObjectNode();
    payload.put("email", email);
    payload.put("password", password);
    JsonNode body = tokenRequest("password", payload);

    if (body == null) {
      recordFailure(limiterKey);
      throw new AdminException(401, "INVALID_CREDENTIALS", "Invalid email or password.");
    }

    Session session = toSession(body);
    // Not an admin: treat like a failed attempt so the endpoint can't be used to probe accounts.
    if (session == null) {
      recordFailure(limiterKey);
      throw new AdminException(
          403, "NOT_ADMIN", "This account is not authorized to access the admin panel.");
    }
    failures.remove(limiterKey);
    return session;
  }

  public Session refresh(String refreshToken) {
    requireConfigured();
    if (refreshToken == null || refreshToken.isBlank()) {
      throw new AdminException(401, "UNAUTHORIZED", "Session expired. Please log in again.");
    }
    ObjectNode payload = mapper.createObjectNode();
    payload.put("refresh_token", refreshToken);
    JsonNode body = tokenRequest("refresh_token", payload);
    Session session = body == null ? null : toSession(body);
    if (session == null) {
      throw new AdminException(401, "UNAUTHORIZED", "Session expired. Please log in again.");
    }
    return session;
  }

  /** Verifies a stored access token. Returns {@code null} unless it belongs to a current admin. */
  public AdminUser verify(String accessToken) {
    if (accessToken == null || accessToken.isBlank()) {
      return null;
    }
    long now = System.currentTimeMillis();
    String cacheKey = sha256(accessToken);
    CachedUser cached = verifyCache.get(cacheKey);
    if (cached != null && cached.expiresAt() > now) {
      return cached.user();
    }
    verifyCache.remove(cacheKey);
    if (verifyCache.size() > 500) {
      verifyCache.entrySet().removeIf(e -> e.getValue().expiresAt() <= now);
    }

    SupabaseClient.SupabaseUser user = supabase.getUserFromAuthorization("Bearer " + accessToken);
    if (user == null) {
      return null;
    }
    AdminUser admin = loadAdmin(user.id(), user.email());
    if (admin != null) {
      verifyCache.put(cacheKey, new CachedUser(admin, now + VERIFY_CACHE_MILLIS));
    }
    return admin;
  }

  public void forget(String accessToken) {
    if (accessToken != null) {
      verifyCache.remove(sha256(accessToken));
    }
  }

  // ---------------------------------------------------------------- internals

  private Session toSession(JsonNode body) {
    String accessToken = body.path("access_token").asText(null);
    String refreshToken = body.path("refresh_token").asText(null);
    String userId = body.path("user").path("id").asText(null);
    String email = body.path("user").path("email").asText(null);
    if (accessToken == null || refreshToken == null || userId == null) {
      return null;
    }
    AdminUser admin = loadAdmin(userId, email);
    return admin == null ? null : new Session(accessToken, refreshToken, admin);
  }

  private AdminUser loadAdmin(String userId, String email) {
    // userId originates from Supabase Auth, but validate before placing it in a filter anyway.
    if (!AdminApiController.UUID.matcher(userId).matches()) {
      return null;
    }
    JsonNode rows =
        data.rows(
            "profiles",
            "select=id,username,display_name,role&id=eq." + userId + "&limit=1");
    if (!rows.isArray() || rows.isEmpty()) {
      return null;
    }
    JsonNode profile = rows.get(0);
    if (!"admin".equals(profile.path("role").asText())) {
      return null;
    }
    return new AdminUser(
        userId, email, profile.path("username").asText(""), profile.path("display_name").asText(""));
  }

  private JsonNode tokenRequest(String grantType, ObjectNode payload) {
    try {
      HttpRequest req =
          HttpRequest.newBuilder()
              .uri(URI.create(props.getSupabase().getUrl() + "/auth/v1/token?grant_type=" + grantType))
              .header("apikey", props.getSupabase().getAnonKey())
              .header("Content-Type", "application/json")
              .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
              .timeout(Duration.ofSeconds(15))
              .build();
      HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() != 200) {
        return null;
      }
      return mapper.readTree(res.body());
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      return null;
    } catch (Exception e) {
      log.warn("Supabase token request failed: {}", e.toString());
      return null;
    }
  }

  private void requireConfigured() {
    if (!props.hasEnvVars() || !props.hasAdminClient()) {
      throw new AdminException(
          503,
          "NOT_CONFIGURED",
          "Backend is missing Supabase configuration (URL, anon key and service role key).");
    }
  }

  // ---------------------------------------------------------------- brute-force protection

  private static String limiterKey(String email, String ip) {
    return (email == null ? "" : email.trim().toLowerCase()) + "|" + (ip == null ? "" : ip);
  }

  private void assertNotLocked(String key) {
    Deque<Long> attempts = failures.get(key);
    if (attempts == null) {
      return;
    }
    long cutoff = System.currentTimeMillis() - LOCKOUT_MILLIS;
    synchronized (attempts) {
      while (!attempts.isEmpty() && attempts.peekFirst() < cutoff) {
        attempts.pollFirst();
      }
      if (attempts.size() >= MAX_FAILED_ATTEMPTS) {
        throw new AdminException(
            429, "TOO_MANY_ATTEMPTS", "Too many failed login attempts. Try again in 15 minutes.");
      }
    }
  }

  private void recordFailure(String key) {
    if (failures.size() > 5000) {
      long cutoff = System.currentTimeMillis() - LOCKOUT_MILLIS;
      failures.entrySet().removeIf(e -> {
        synchronized (e.getValue()) {
          return e.getValue().isEmpty() || e.getValue().peekLast() < cutoff;
        }
      });
    }
    Deque<Long> attempts = failures.computeIfAbsent(key, k -> new ArrayDeque<>());
    synchronized (attempts) {
      attempts.addLast(System.currentTimeMillis());
    }
  }

  private static String sha256(String value) {
    try {
      return HexFormat.of()
          .formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }
}
