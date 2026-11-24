package com.ezkey.config;

import com.ezkey.admin.AdminAuthInterceptor;
import java.util.LinkedHashSet;
import java.util.Set;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * HTTP client and CORS. CORS allowed origins come from {@code BACKEND_CORS_ORIGINS} and default to
 * the Next.js dev origins so the unchanged frontend can call this backend from the browser.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final AppProperties props;

  private final AdminAuthInterceptor adminAuthInterceptor;

  public WebConfig(AppProperties props, AdminAuthInterceptor adminAuthInterceptor) {
    this.props = props;
    this.adminAuthInterceptor = adminAuthInterceptor;
  }

  /** Every admin route requires an admin session, except the endpoints that create/end one. */
  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(adminAuthInterceptor)
        .addPathPatterns("/api/admin/**")
        .excludePathPatterns(
            "/api/admin/auth/login", "/api/admin/auth/refresh", "/api/admin/auth/logout");
  }

  @Bean
  public RestClient restClient() {
    return RestClient.create();
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    // The admin panel reaches this backend through the Next.js proxy, which forwards the browser's
    // Origin header, so the public site URL must always be an allowed origin.
    Set<String> origins = new LinkedHashSet<>(props.getCors().allowedOriginsList());
    String siteUrl = props.getSiteUrl();
    if (siteUrl != null && !siteUrl.isBlank()) {
      origins.add(siteUrl.trim().replaceAll("/+$", ""));
    }
    registry
        .addMapping("/**")
        .allowedOrigins(origins.toArray(new String[0]))
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
