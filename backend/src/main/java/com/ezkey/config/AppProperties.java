package com.ezkey.config;

import com.ezkey.env.DotEnvEnvironmentPostProcessor;
import java.util.Arrays;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Mirrors the {@code process.env.*} reads scattered through the TypeScript backend.
 *
 * <p>Every property is bound from the environment variable names that already exist in
 * {@code .env.example} / {@code .env.local}, so no env file has to change. Values that are not set
 * resolve to the same fallbacks the TypeScript code used (empty string, or the Didit production
 * base URL). See {@link DotEnvEnvironmentPostProcessor} for how {@code .env.local} gets loaded.
 */
@Component
@ConfigurationProperties(prefix = "ezkey")
public class AppProperties {

  private Supabase supabase = new Supabase();
  private String siteUrl = "";
  private Didit didit = new Didit();
  private Cors cors = new Cors();
  private Cookies cookies = new Cookies();

  /** Port of {@code hasEnvVars} in {@code lib/utils.ts}. */
  public boolean hasEnvVars() {
    return notBlank(supabase.getUrl()) && notBlank(supabase.getAnonKey());
  }

  /** Port of {@code createAdminClient()} returning {@code null} in {@code lib/supabase/admin.ts}. */
  public boolean hasAdminClient() {
    return notBlank(supabase.getUrl()) && notBlank(supabase.getServiceRoleKey());
  }

  private static boolean notBlank(String value) {
    return value != null && !value.trim().isEmpty();
  }

  public Supabase getSupabase() {
    return supabase;
  }

  public void setSupabase(Supabase supabase) {
    this.supabase = supabase;
  }

  public String getSiteUrl() {
    return siteUrl;
  }

  public void setSiteUrl(String siteUrl) {
    this.siteUrl = siteUrl;
  }

  public Didit getDidit() {
    return didit;
  }

  public void setDidit(Didit didit) {
    this.didit = didit;
  }

  public Cors getCors() {
    return cors;
  }

  public void setCors(Cors cors) {
    this.cors = cors;
  }

  public Cookies getCookies() {
    return cookies;
  }

  public void setCookies(Cookies cookies) {
    this.cookies = cookies;
  }

  public static class Supabase {
    private String url = "";
    private String anonKey = "";
    private String serviceRoleKey = "";

    public String getUrl() {
      return url;
    }

    public void setUrl(String url) {
      this.url = url;
    }

    public String getAnonKey() {
      return anonKey;
    }

    public void setAnonKey(String anonKey) {
      this.anonKey = anonKey;
    }

    public String getServiceRoleKey() {
      return serviceRoleKey;
    }

    public void setServiceRoleKey(String serviceRoleKey) {
      this.serviceRoleKey = serviceRoleKey;
    }
  }

  public static class Didit {
    private String apiBaseUrl = "https://verification.didit.me";
    private String apiKey = "";
    private String webhookSecret = "";

    public String getApiBaseUrl() {
      return apiBaseUrl;
    }

    public void setApiBaseUrl(String apiBaseUrl) {
      this.apiBaseUrl = apiBaseUrl;
    }

    public String getApiKey() {
      return apiKey;
    }

    public void setApiKey(String apiKey) {
      this.apiKey = apiKey;
    }

    public String getWebhookSecret() {
      return webhookSecret;
    }

    public void setWebhookSecret(String webhookSecret) {
      this.webhookSecret = webhookSecret;
    }
  }

  public static class Cors {
    private String allowedOrigins = "http://localhost:3000";

    public List<String> allowedOriginsList() {
      return Arrays.stream(allowedOrigins.split(","))
          .map(String::trim)
          .filter(value -> !value.isEmpty())
          .toList();
    }

    public String getAllowedOrigins() {
      return allowedOrigins;
    }

    public void setAllowedOrigins(String allowedOrigins) {
      this.allowedOrigins = allowedOrigins;
    }
  }

  public static class Cookies {
    private boolean secure = false;

    public boolean isSecure() {
      return secure;
    }

    public void setSecure(boolean secure) {
      this.secure = secure;
    }
  }
}
