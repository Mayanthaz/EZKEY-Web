package com.ezkey.admin;

import com.ezkey.config.AppProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Service-role PostgREST access used only by the admin panel. The service-role key bypasses RLS, so
 * every caller MUST sit behind {@link AdminAuthInterceptor}.
 */
@Component
public class AdminDataClient {

  private static final Logger log = LoggerFactory.getLogger(AdminDataClient.class);

  public record Page(JsonNode rows, long total) {}

  private final AppProperties props;
  private final ObjectMapper mapper;
  private final HttpClient http =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  public AdminDataClient(AppProperties props, ObjectMapper mapper) {
    this.props = props;
    this.mapper = mapper;
  }

  /** Percent-encodes a value for a query string. */
  public static String enc(String value) {
    return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
  }

  private HttpRequest.Builder request(String pathAndQuery) {
    if (!props.hasAdminClient()) {
      throw new AdminException(
          503, "NOT_CONFIGURED", "Supabase service role is not configured on the backend.");
    }
    String key = props.getSupabase().getServiceRoleKey();
    return HttpRequest.newBuilder()
        .uri(URI.create(props.getSupabase().getUrl() + "/rest/v1/" + pathAndQuery))
        .header("apikey", key)
        .header("Authorization", "Bearer " + key)
        .timeout(Duration.ofSeconds(15));
  }

  private HttpResponse<String> send(HttpRequest request) {
    try {
      HttpResponse<String> res = http.send(request, HttpResponse.BodyHandlers.ofString());
      if (res.statusCode() >= 300) {
        log.warn("PostgREST {} {} -> {} {}", request.method(), request.uri().getPath(),
            res.statusCode(), res.body());
        throw new AdminException(502, "DATABASE_ERROR", "Database request failed.");
      }
      return res;
    } catch (AdminException e) {
      throw e;
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new AdminException(502, "DATABASE_ERROR", "Database request interrupted.");
    } catch (Exception e) {
      log.warn("PostgREST request failed: {}", e.toString());
      throw new AdminException(502, "DATABASE_ERROR", "Database is unreachable.");
    }
  }

  private JsonNode parse(String body) {
    try {
      return body == null || body.isBlank() ? mapper.createArrayNode() : mapper.readTree(body);
    } catch (Exception e) {
      throw new AdminException(502, "DATABASE_ERROR", "Unexpected database response.");
    }
  }

  /** Paginated select with an exact total count. */
  public Page page(String table, String query, int offset, int limit) {
    String path = table + "?" + query + "&offset=" + offset + "&limit=" + limit;
    HttpResponse<String> res =
        send(request(path).header("Prefer", "count=exact").GET().build());
    long total = 0;
    String range = res.headers().firstValue("Content-Range").orElse("");
    int slash = range.indexOf('/');
    if (slash >= 0) {
      try {
        total = Long.parseLong(range.substring(slash + 1));
      } catch (NumberFormatException ignored) {
        // keep 0
      }
    }
    return new Page(parse(res.body()), total);
  }

  public JsonNode rows(String table, String query) {
    return parse(send(request(table + "?" + query).GET().build()).body());
  }

  public long count(String table, String filter) {
    String query = "select=id" + (filter == null || filter.isEmpty() ? "" : "&" + filter);
    return page(table, query, 0, 1).total();
  }

  public JsonNode patch(String table, String filter, Object body) {
    return parse(
        send(request(table + "?" + filter)
                .header("Content-Type", "application/json")
                .header("Prefer", "return=representation")
                .method("PATCH", HttpRequest.BodyPublishers.ofString(toJson(body)))
                .build())
            .body());
  }

  public void insert(String table, Object body) {
    send(request(table)
        .header("Content-Type", "application/json")
        .header("Prefer", "return=minimal")
        .POST(HttpRequest.BodyPublishers.ofString(toJson(body)))
        .build());
  }

  private String toJson(Object body) {
    try {
      return mapper.writeValueAsString(body);
    } catch (Exception e) {
      throw new AdminException(500, "SERVER_ERROR", "Could not serialize request.");
    }
  }
}
