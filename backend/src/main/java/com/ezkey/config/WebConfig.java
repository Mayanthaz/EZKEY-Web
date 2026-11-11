package com.ezkey.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * HTTP client and CORS. CORS allowed origins come from {@code BACKEND_CORS_ORIGINS} and default to
 * the Next.js dev origins so the unchanged frontend can call this backend from the browser.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

  private final AppProperties props;

  public WebConfig(AppProperties props) {
    this.props = props;
  }

  @Bean
  public RestClient restClient() {
    return RestClient.create();
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry
        .addMapping("/**")
        .allowedOrigins(props.getCors().allowedOriginsList().toArray(new String[0]))
        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        .allowedHeaders("*")
        .allowCredentials(true);
  }
}
