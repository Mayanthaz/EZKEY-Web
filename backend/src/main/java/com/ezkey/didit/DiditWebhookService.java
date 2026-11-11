package com.ezkey.didit;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;

/**
 * Port of {@code lib/didit-webhook.ts}. All three signature methods (v2/raw/simple), the
 * 5-minute freshness check and canonical JSON ordering are kept 1:1.
 */
@Service
public class DiditWebhookService {

  private final ObjectMapper objectMapper;

  public DiditWebhookService(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @JsonIgnoreProperties(ignoreUnknown = true)
  public static class WebhookPayload extends LinkedHashMap<String, Object> {
    public String string(String key) {
      Object value = get(key);
      return value instanceof String s && !s.isBlank() ? s.trim() : null;
    }
  }

  public record VerificationResult(WebhookPayload payload, String method) {}

  public VerificationResult verify(byte[] rawBody, Map<String, String> headers, String secret) {
    String timestamp = header(headers, "x-timestamp");
    if (!isFresh(timestamp)) {
      throw new IllegalArgumentException("Missing or stale Didit webhook timestamp");
    }

    String rawBodyText = new String(rawBody, StandardCharsets.UTF_8);
    WebhookPayload payload = parse(rawBodyText);

    String sigV2 = header(headers, "x-signature-v2");
    if (sigV2 != null) {
      String expected = hmacHex(secret, canonicalJson(payload));
      if (safeEquals(sigV2, expected)) return new VerificationResult(payload, "v2");
    }

    String sigRaw = header(headers, "x-signature");
    if (sigRaw != null) {
      String expected = hmacHex(secret, rawBody);
      if (safeEquals(sigRaw, expected)) return new VerificationResult(payload, "raw");
    }

    String sigSimple = header(headers, "x-signature-simple");
    if (sigSimple != null) {
      String expected = hmacHex(secret, simpleSignatureValue(payload, timestamp));
      if (safeEquals(sigSimple, expected)) return new VerificationResult(payload, "simple");
    }

    throw new IllegalArgumentException("Invalid Didit webhook signature");
  }

  // ---- canonical JSON (sort keys + truncate floats) — mirrors lib/didit-webhook.ts ----

  String canonicalJson(WebhookPayload payload) {
    try {
      Object normalized = shortenFloats(sortKeys(payload));
      return objectMapper.writeValueAsString(normalized);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private Object sortKeys(Object value) {
    if (value instanceof List<?> list) {
      List<Object> out = new ArrayList<>();
      for (Object item : list) out.add(sortKeys(item));
      return out;
    }
    if (value instanceof Map<?, ?> map) {
      TreeMap<String, Object> sorted = new TreeMap<>();
      for (Map.Entry<?, ?> entry : map.entrySet()) {
        sorted.put(String.valueOf(entry.getKey()), sortKeys(entry.getValue()));
      }
      return sorted;
    }
    return value;
  }

  private Object shortenFloats(Object value) {
    if (value instanceof List<?> list) {
      List<Object> out = new ArrayList<>();
      for (Object item : list) out.add(shortenFloats(item));
      return out;
    }
    if (value instanceof Map<?, ?> map) {
      Map<String, Object> out = new LinkedHashMap<>();
      for (Map.Entry<?, ?> entry : map.entrySet()) {
        out.put(String.valueOf(entry.getKey()), shortenFloats(entry.getValue()));
      }
      return out;
    }
    if (value instanceof Number n) {
      double d = n.doubleValue();
      if (Double.isFinite(d) && d == Math.floor(d)) return (long) d;
    }
    return value;
  }

  private WebhookPayload parse(String rawBodyText) {
    try {
      return objectMapper.readValue(rawBodyText, WebhookPayload.class);
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid webhook JSON", e);
    }
  }

  /**
   * Port of {@code simpleSignatureValue} in {@code lib/didit-webhook.ts}:
   * {@code [payload.timestamp ?? timestampHeader ?? "", session_id ?? business_session_id ?? "",
   *  status ?? "", webhook_type ?? ""].join(":")}
   *
   * <p>Didit sends {@code timestamp} as a number, so we coerce Number -&gt; string the way the JS
   * template literal does.
   */
  String simpleSignatureValue(WebhookPayload payload, String timestampHeader) {
    Object ts = payload.get("timestamp");
    String tsStr;
    if (ts != null) {
      tsStr = ts instanceof Number n ? String.valueOf(n.longValue()) : String.valueOf(ts);
    } else if (timestampHeader != null) {
      tsStr = timestampHeader;
    } else {
      tsStr = "";
    }

    String sid = payload.string("session_id");
    if (sid == null) sid = payload.string("business_session_id");
    if (sid == null) sid = "";

    String status = payload.string("status");
    if (status == null) status = "";

    String wtype = payload.string("webhook_type");
    if (wtype == null) wtype = "";

    return String.join(":", tsStr, sid, status, wtype);
  }

  private boolean isFresh(String timestamp) {
    if (timestamp == null) return false;
    try {
      long ts = Long.parseLong(timestamp.trim());
      long now = System.currentTimeMillis() / 1000;
      return Math.abs(now - ts) <= 300;
    } catch (NumberFormatException e) {
      return false;
    }
  }

  private String header(Map<String, String> headers, String name) {
    for (Map.Entry<String, String> e : headers.entrySet()) {
      if (e.getKey().equalsIgnoreCase(name)) return e.getValue();
    }
    return null;
  }

  private String hmacHex(String secret, String value) {
    return hmacHex(secret, value.getBytes(StandardCharsets.UTF_8));
  }

  private String hmacHex(String secret, byte[] data) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      byte[] digest = mac.doFinal(data);
      StringBuilder sb = new StringBuilder(digest.length * 2);
      for (byte b : digest) sb.append(String.format("%02x", b));
      return sb.toString();
    } catch (NoSuchAlgorithmException | InvalidKeyException e) {
      throw new RuntimeException(e);
    }
  }

  private boolean safeEquals(String received, String expected) {
    if (received == null) return false;
    String r = received.trim().replaceFirst("(?i)^sha256=", "").toLowerCase(Locale.ROOT);
    String e = expected.trim().toLowerCase(Locale.ROOT);
    return MessageDigest.isEqual(r.getBytes(StandardCharsets.UTF_8), e.getBytes(StandardCharsets.UTF_8));
  }
}
