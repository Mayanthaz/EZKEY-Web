package com.ezkey.controller;

import com.ezkey.config.AppProperties;
import com.ezkey.supabase.SupabaseClient;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Ports:
 * <ul>
 *   <li>{@code app/auth/callback/route.ts} (GET /auth/callback)
 *   <li>{@code app/auth/confirm/route.ts} (GET /auth/confirm)
 * </ul>
 * Both issue the same Supabase calls and redirects the Next.js routes did, with the same
 * open-redirect guard ({@code safeRedirectPath}).
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AppProperties props;
  private final SupabaseClient supabase;

  public AuthController(AppProperties props, SupabaseClient supabase) {
    this.props = props;
    this.supabase = supabase;
  }

  // GET /auth/callback?code=...&next=...  — port of app/auth/callback/route.ts
  @GetMapping("/callback")
  public void callback(
      @RequestParam(value = "code", required = false) String code,
      @RequestParam(value = "next", required = false) String next,
      HttpServletRequest request,
      HttpServletResponse response) throws IOException {

    String origin = requestOrigin(request);
    String safeNext = safeRedirectPath(next);

    if (code != null && !code.isBlank()) {
      SupabaseClient.ExchangeResult result = supabase.exchangeCodeForSession(code);
      if (result.success()) {
        setAuthCookies(response, result.accessToken(), result.refreshToken());
        response.sendRedirect(origin + safeNext);
        return;
      }
      response.sendRedirect(origin + "/auth/error?error=" + urlEncode(result.error()));
      return;
    }
    response.sendRedirect(origin + "/auth/error?error=" + urlEncode("Missing auth callback code"));
  }

  // GET /auth/confirm?token_hash=...&type=...&next=... — port of app/auth/confirm/route.ts
  @GetMapping("/confirm")
  public void confirm(
      @RequestParam(value = "token_hash", required = false) String tokenHash,
      @RequestParam(value = "type", required = false) String type,
      @RequestParam(value = "next", required = false) String next,
      HttpServletRequest request,
      HttpServletResponse response) throws IOException {

    String origin = requestOrigin(request);
    String safeNext = next != null && !next.isBlank() ? safeRedirectPath(next) : "/dashboard";

    if (tokenHash != null && !tokenHash.isBlank() && type != null && !type.isBlank()) {
      SupabaseClient.VerifyOtpResult result = supabase.verifyOtp(tokenHash, type);
      if (result.success()) {
        setAuthCookies(response, result.accessToken(), result.refreshToken());
        response.sendRedirect(origin + safeNext);
        return;
      }
      response.sendRedirect(origin + "/auth/error?error=" + urlEncode(result.error()));
      return;
    }
    response.sendRedirect(origin + "/auth/error?error=" + urlEncode("No token hash or type"));
  }

  // ---- helpers mirroring the TS helpers 1:1 ----

  private static String safeRedirectPath(String value) {
    if (value != null && value.startsWith("/") && !value.startsWith("//")) return value;
    return "/dashboard";
  }

  private String requestOrigin(HttpServletRequest request) {
    String scheme = request.getScheme();
    String host = request.getHeader("Host");
    if (host != null) return scheme + "://" + host;
    String siteUrl = props.getSiteUrl();
    return siteUrl != null && !siteUrl.isBlank() ? siteUrl : "http://localhost:3000";
  }

  private void setAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
    // Supabase SSR cookie names are project-ref based; we set generic ones the frontend can read.
    // The actual Supabase session is established server-side; these cookies let the frontend
    // read the session if it needs to. Supabase JS will re-establish from the auth callback.
    if (accessToken != null) {
      response.addHeader("Set-Cookie", "sb-access-token=" + accessToken + "; Path=/; HttpOnly; SameSite=Lax" + (props.getCookies().isSecure() ? "; Secure" : ""));
    }
    if (refreshToken != null) {
      response.addHeader("Set-Cookie", "sb-refresh-token=" + refreshToken + "; Path=/; HttpOnly; SameSite=Lax" + (props.getCookies().isSecure() ? "; Secure" : ""));
    }
  }

  private static String urlEncode(String value) {
    if (value == null) return "";
    return URLEncoder.encode(value, StandardCharsets.UTF_8);
  }
}
