package com.ezkey.admin;

import com.ezkey.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Login / logout / refresh / current-admin for the admin panel. */
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

  private static final Duration SESSION_LIFETIME = Duration.ofHours(8);

  public record LoginRequest(String email, String password) {}

  private final AdminAuthService auth;
  private final AdminAuditService audit;
  private final AppProperties props;

  public AdminAuthController(AdminAuthService auth, AdminAuditService audit, AppProperties props) {
    this.auth = auth;
    this.audit = audit;
    this.props = props;
  }

  @PostMapping("/login")
  public Map<String, Object> login(
      @RequestBody LoginRequest body, HttpServletRequest request, HttpServletResponse response) {
    requireCsrfHeader(request);
    String email = body.email() == null ? "" : body.email().trim();
    String password = body.password() == null ? "" : body.password();
    if (email.isEmpty() || password.isEmpty() || email.length() > 254 || password.length() > 256) {
      throw new AdminException(400, "BAD_REQUEST", "Email and password are required.");
    }
    AdminAuthService.Session session = auth.login(email, password, clientIp(request));
    setSessionCookies(response, session);
    audit.record(session.user(), "admin.login", "session", session.user().id(), Map.of(),
        clientIp(request));
    return Map.of("admin", session.user());
  }

  @PostMapping("/refresh")
  public Map<String, Object> refresh(HttpServletRequest request, HttpServletResponse response) {
    requireCsrfHeader(request);
    AdminAuthService.Session session;
    try {
      session = auth.refresh(AdminAuthInterceptor.cookie(request, AdminAuthInterceptor.REFRESH_COOKIE));
    } catch (AdminException e) {
      clearSessionCookies(response);
      throw e;
    }
    setSessionCookies(response, session);
    return Map.of("admin", session.user());
  }

  @PostMapping("/logout")
  public Map<String, Object> logout(HttpServletRequest request, HttpServletResponse response) {
    requireCsrfHeader(request);
    auth.forget(AdminAuthInterceptor.cookie(request, AdminAuthInterceptor.ACCESS_COOKIE));
    clearSessionCookies(response);
    return Map.of("ok", true);
  }

  /** Protected by {@link AdminAuthInterceptor}. */
  @GetMapping("/me")
  public Map<String, Object> me(HttpServletRequest request) {
    AdminUser admin = (AdminUser) request.getAttribute(AdminAuthInterceptor.ATTR_ADMIN);
    Map<String, Object> map = new LinkedHashMap<>();
    map.put("admin", admin);
    return map;
  }

  // ---------------------------------------------------------------- helpers

  private static void requireCsrfHeader(HttpServletRequest request) {
    if (!AdminAuthInterceptor.CSRF_VALUE.equals(request.getHeader(AdminAuthInterceptor.CSRF_HEADER))) {
      throw new AdminException(403, "FORBIDDEN", "Missing required request header.");
    }
  }

  private void setSessionCookies(HttpServletResponse response, AdminAuthService.Session session) {
    response.addHeader(
        HttpHeaders.SET_COOKIE, cookie(AdminAuthInterceptor.ACCESS_COOKIE, session.accessToken(), SESSION_LIFETIME));
    response.addHeader(
        HttpHeaders.SET_COOKIE, cookie(AdminAuthInterceptor.REFRESH_COOKIE, session.refreshToken(), SESSION_LIFETIME));
    response.setHeader("Cache-Control", "no-store");
  }

  private void clearSessionCookies(HttpServletResponse response) {
    response.addHeader(HttpHeaders.SET_COOKIE, cookie(AdminAuthInterceptor.ACCESS_COOKIE, "", Duration.ZERO));
    response.addHeader(HttpHeaders.SET_COOKIE, cookie(AdminAuthInterceptor.REFRESH_COOKIE, "", Duration.ZERO));
  }

  private String cookie(String name, String value, Duration maxAge) {
    return ResponseCookie.from(name, value)
        .httpOnly(true)
        .secure(props.getCookies().isSecure())
        .sameSite("Strict")
        .path("/")
        .maxAge(maxAge)
        .build()
        .toString();
  }

  /** First hop of X-Forwarded-For (set by the Next.js proxy), else the socket address. */
  static String clientIp(HttpServletRequest request) {
    String forwarded = request.getHeader("X-Forwarded-For");
    if (forwarded != null && !forwarded.isBlank()) {
      return forwarded.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}
