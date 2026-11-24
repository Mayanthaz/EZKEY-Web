package com.ezkey.admin;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Gate for every {@code /api/admin/**} route except login/refresh/logout (see {@code WebConfig}).
 * Requires a valid admin session cookie, and for state-changing requests a custom header that a
 * cross-site form post cannot send (defence in depth on top of SameSite=Strict cookies).
 */
@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

  public static final String ACCESS_COOKIE = "ezkey_admin_at";
  public static final String REFRESH_COOKIE = "ezkey_admin_rt";
  public static final String CSRF_HEADER = "X-Requested-With";
  public static final String CSRF_VALUE = "ezkey-admin";
  public static final String ATTR_ADMIN = "ezkeyAdminUser";

  private final AdminAuthService auth;

  public AdminAuthInterceptor(AdminAuthService auth) {
    this.auth = auth;
  }

  @Override
  public boolean preHandle(
      HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      return true;
    }
    if (isStateChanging(request) && !CSRF_VALUE.equals(request.getHeader(CSRF_HEADER))) {
      reject(response, 403, "Missing required request header.", "FORBIDDEN");
      return false;
    }
    AdminUser admin = auth.verify(cookie(request, ACCESS_COOKIE));
    if (admin == null) {
      reject(response, 401, "Admin authentication required.", "UNAUTHORIZED");
      return false;
    }
    request.setAttribute(ATTR_ADMIN, admin);
    return true;
  }

  public static boolean isStateChanging(HttpServletRequest request) {
    String method = request.getMethod();
    return !("GET".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method));
  }

  public static String cookie(HttpServletRequest request, String name) {
    Cookie[] cookies = request.getCookies();
    if (cookies == null) {
      return null;
    }
    for (Cookie c : cookies) {
      if (name.equals(c.getName())) {
        return c.getValue();
      }
    }
    return null;
  }

  private static void reject(HttpServletResponse response, int status, String message, String code)
      throws java.io.IOException {
    response.setStatus(status);
    response.setContentType("application/json");
    response.setHeader("Cache-Control", "no-store");
    response.getWriter().write("{\"error\":\"" + message + "\",\"code\":\"" + code + "\"}");
  }
}
