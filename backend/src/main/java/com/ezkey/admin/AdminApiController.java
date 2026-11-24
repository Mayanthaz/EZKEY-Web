package com.ezkey.admin;

import static com.ezkey.admin.AdminDataClient.enc;

import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.regex.Pattern;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin panel data API. Every route here is behind {@link AdminAuthInterceptor}. Query parameters
 * are whitelisted / sanitised before being placed into PostgREST filters.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminApiController {

  static final Pattern UUID =
      Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

  private static final Set<String> ROLES = Set.of("buyer", "seller", "admin");
  private static final Set<String> LISTING_STATUSES =
      Set.of("draft", "active", "paused", "sold_out", "removed");
  private static final Set<String> ORDER_STATUSES =
      Set.of("pending", "paid", "processing", "delivered", "completed", "cancelled", "refunded", "disputed");
  private static final Set<String> DISPUTE_STATUSES =
      Set.of("open", "under_review", "resolved_buyer", "resolved_seller", "closed");
  private static final Set<String> VERIFICATION_STATUSES =
      Set.of("pending", "submitted", "verified", "rejected");
  private static final Set<String> REVENUE_ORDER_STATUSES =
      Set.of("paid", "processing", "delivered", "completed");
  private static final Pattern SAFE_SEARCH = Pattern.compile("[^\\p{L}\\p{N} _.@-]");

  private final AdminDataClient data;
  private final AdminAuditService audit;

  public AdminApiController(AdminDataClient data, AdminAuditService audit) {
    this.data = data;
    this.audit = audit;
  }

  // ================================================================ dashboard

  @GetMapping("/stats")
  public Map<String, Object> stats() {
    Instant now = Instant.now();
    String weekAgo = now.minus(7, ChronoUnit.DAYS).toString();
    String revenueStatuses = "status=in.(" + String.join(",", REVENUE_ORDER_STATUSES) + ")";

    Map<String, Object> out = new LinkedHashMap<>();
    out.put("totalUsers", data.count("profiles", ""));
    out.put("buyers", data.count("profiles", "role=eq.buyer"));
    out.put("sellers", data.count("profiles", "role=eq.seller"));
    out.put("admins", data.count("profiles", "role=eq.admin"));
    out.put("newUsers7d", data.count("profiles", "created_at=gte." + enc(weekAgo)));
    out.put("totalListings", data.count("listings", ""));
    out.put("activeListings", data.count("listings", "status=eq.active"));
    out.put("totalOrders", data.count("orders", ""));
    out.put("pendingVerifications",
        data.count("seller_verifications", "application_status=in.(pending,submitted)"));
    out.put("openDisputes", data.count("disputes", "status=in.(open,under_review)"));

    // Revenue and the 14-day chart are computed from a capped fetch (PostgREST aggregates are
    // disabled on most Supabase projects). Flag the cap so the UI can say so.
    final int cap = 10000;
    JsonNode paid =
        data.rows("orders", "select=total_price,platform_fee,created_at&" + revenueStatuses
            + "&order=created_at.desc&limit=" + cap);
    double gross = 0;
    double fees = 0;
    LocalDate today = LocalDate.now(ZoneOffset.UTC);
    Map<LocalDate, double[]> byDay = new TreeMap<>();
    for (int i = 13; i >= 0; i--) {
      byDay.put(today.minusDays(i), new double[] {0, 0});
    }
    for (JsonNode row : paid) {
      double total = row.path("total_price").asDouble(0);
      gross += total;
      fees += row.path("platform_fee").asDouble(0);
      try {
        LocalDate day = Instant.parse(row.path("created_at").asText()).atZone(ZoneOffset.UTC).toLocalDate();
        double[] bucket = byDay.get(day);
        if (bucket != null) {
          bucket[0] += 1;
          bucket[1] += total;
        }
      } catch (Exception ignored) {
        // skip rows with unparseable timestamps
      }
    }
    out.put("grossRevenue", round(gross));
    out.put("platformFees", round(fees));
    out.put("revenueCapped", paid.size() >= cap);
    out.put("ordersByDay",
        byDay.entrySet().stream()
            .map(e -> Map.of("date", e.getKey().toString(), "orders", (long) e.getValue()[0],
                "revenue", round(e.getValue()[1])))
            .toList());

    out.put("recentOrders",
        data.rows("orders",
            "select=id,order_number,total_price,status,created_at,"
                + "buyer:profiles!orders_buyer_id_fkey(username),listing:listings(title)"
                + "&order=created_at.desc&limit=6"));
    return out;
  }

  // ================================================================ users

  @GetMapping("/users")
  public Map<String, Object> users(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String role) {
    StringBuilder query = new StringBuilder(
        "select=id,username,display_name,avatar_url,role,balance,is_verified,total_sales,"
            + "total_purchases,rating,created_at&order=created_at.desc");
    if (role != null && !role.isBlank()) {
      query.append("&role=eq.").append(requireIn(role, ROLES, "role"));
    }
    appendSearch(query, q, "username", "display_name");
    return paged("profiles", query.toString(), page, pageSize);
  }

  @PatchMapping("/users/{id}")
  public Map<String, Object> updateUser(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    AdminUser admin = admin(request);
    requireUuid(id);
    Map<String, Object> patch = new LinkedHashMap<>();

    if (body.containsKey("role")) {
      String role = requireIn(str(body.get("role")), ROLES, "role");
      if (id.equalsIgnoreCase(admin.id())) {
        throw new AdminException(400, "BAD_REQUEST", "You cannot change your own role.");
      }
      patch.put("role", role);
    }
    if (body.containsKey("is_verified")) {
      if (!(body.get("is_verified") instanceof Boolean verified)) {
        throw new AdminException(400, "BAD_REQUEST", "is_verified must be a boolean.");
      }
      patch.put("is_verified", verified);
    }
    if (patch.isEmpty()) {
      throw new AdminException(400, "BAD_REQUEST", "Nothing to update.");
    }

    JsonNode updated = data.patch("profiles", "id=eq." + id, patch);
    if (updated.isEmpty()) {
      throw new AdminException(404, "NOT_FOUND", "User not found.");
    }
    audit.record(admin, "user.update", "profile", id, new LinkedHashMap<>(patch), AdminAuthController.clientIp(request));
    return Map.of("user", updated.get(0));
  }

  // ================================================================ seller verifications

  @GetMapping("/verifications")
  public Map<String, Object> verifications(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String status) {
    StringBuilder query = new StringBuilder(
        "select=id,user_id,status,application_status,verification_url,submitted_details,"
            + "created_at,approved_at,rejected_at,user:profiles(username,display_name,role)"
            + "&order=created_at.desc");
    if (status != null && !status.isBlank()) {
      query.append("&application_status=eq.").append(requireIn(status, VERIFICATION_STATUSES, "status"));
    }
    return paged("seller_verifications", query.toString(), page, pageSize);
  }

  @PostMapping("/verifications/{id}/decision")
  public Map<String, Object> decideVerification(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    AdminUser admin = admin(request);
    requireUuid(id);
    String decision = requireIn(str(body.get("decision")), Set.of("approve", "reject"), "decision");
    boolean approve = decision.equals("approve");

    JsonNode existing =
        data.rows("seller_verifications", "select=id,user_id,application_status&id=eq." + id + "&limit=1");
    if (existing.isEmpty()) {
      throw new AdminException(404, "NOT_FOUND", "Verification not found.");
    }
    String userId = existing.get(0).path("user_id").asText();
    requireUuid(userId);

    Map<String, Object> patch = new LinkedHashMap<>();
    patch.put("application_status", approve ? "verified" : "rejected");
    patch.put(approve ? "approved_at" : "rejected_at", Instant.now().toString());
    data.patch("seller_verifications", "id=eq." + id, patch);

    if (approve) {
      // Promote buyers to sellers, but never downgrade an admin.
      JsonNode profile = data.rows("profiles", "select=role&id=eq." + userId + "&limit=1");
      String currentRole = profile.isEmpty() ? "buyer" : profile.get(0).path("role").asText("buyer");
      Map<String, Object> profilePatch = new LinkedHashMap<>();
      profilePatch.put("is_verified", true);
      if (!"admin".equals(currentRole)) {
        profilePatch.put("role", "seller");
      }
      data.patch("profiles", "id=eq." + userId, profilePatch);
    } else {
      data.patch("profiles", "id=eq." + userId, Map.of("is_verified", false));
    }

    audit.record(admin, "verification." + decision, "seller_verification", id,
        Map.of("user_id", userId), AdminAuthController.clientIp(request));
    return Map.of("ok", true, "application_status", patch.get("application_status"));
  }

  // ================================================================ listings

  @GetMapping("/listings")
  public Map<String, Object> listings(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String status) {
    StringBuilder query = new StringBuilder(
        "select=id,title,slug,price,currency,status,featured,stock_count,sold_count,view_count,"
            + "created_at,seller:profiles!listings_seller_id_fkey(username),category:categories(name)"
            + "&order=created_at.desc");
    if (status != null && !status.isBlank()) {
      query.append("&status=eq.").append(requireIn(status, LISTING_STATUSES, "status"));
    }
    appendSearch(query, q, "title");
    return paged("listings", query.toString(), page, pageSize);
  }

  @PatchMapping("/listings/{id}")
  public Map<String, Object> updateListing(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    AdminUser admin = admin(request);
    requireUuid(id);
    Map<String, Object> patch = new LinkedHashMap<>();
    if (body.containsKey("status")) {
      patch.put("status", requireIn(str(body.get("status")), LISTING_STATUSES, "status"));
    }
    if (body.containsKey("featured")) {
      if (!(body.get("featured") instanceof Boolean featured)) {
        throw new AdminException(400, "BAD_REQUEST", "featured must be a boolean.");
      }
      patch.put("featured", featured);
    }
    if (patch.isEmpty()) {
      throw new AdminException(400, "BAD_REQUEST", "Nothing to update.");
    }
    JsonNode updated = data.patch("listings", "id=eq." + id, patch);
    if (updated.isEmpty()) {
      throw new AdminException(404, "NOT_FOUND", "Listing not found.");
    }
    audit.record(admin, "listing.update", "listing", id, new LinkedHashMap<>(patch), AdminAuthController.clientIp(request));
    return Map.of("ok", true);
  }

  // ================================================================ orders (read-only)

  @GetMapping("/orders")
  public Map<String, Object> orders(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String q,
      @RequestParam(required = false) String status) {
    StringBuilder query = new StringBuilder(
        "select=id,order_number,quantity,total_price,platform_fee,status,created_at,"
            + "buyer:profiles!orders_buyer_id_fkey(username),"
            + "seller:profiles!orders_seller_id_fkey(username),listing:listings(title)"
            + "&order=created_at.desc");
    if (status != null && !status.isBlank()) {
      query.append("&status=eq.").append(requireIn(status, ORDER_STATUSES, "status"));
    }
    appendSearch(query, q, "order_number");
    return paged("orders", query.toString(), page, pageSize);
  }

  // ================================================================ disputes

  @GetMapping("/disputes")
  public Map<String, Object> disputes(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int pageSize,
      @RequestParam(required = false) String status) {
    StringBuilder query = new StringBuilder(
        "select=id,order_id,reason,description,status,resolution,created_at,resolved_at,"
            + "initiator:profiles!disputes_initiated_by_fkey(username),"
            + "against:profiles!disputes_against_user_fkey(username),"
            + "order:orders(order_number,total_price)&order=created_at.desc");
    if (status != null && !status.isBlank()) {
      query.append("&status=eq.").append(requireIn(status, DISPUTE_STATUSES, "status"));
    }
    return paged("disputes", query.toString(), page, pageSize);
  }

  @PatchMapping("/disputes/{id}")
  public Map<String, Object> updateDispute(
      @PathVariable String id,
      @RequestBody Map<String, Object> body,
      HttpServletRequest request) {
    AdminUser admin = admin(request);
    requireUuid(id);
    String status = requireIn(str(body.get("status")), DISPUTE_STATUSES, "status");
    String resolution = body.get("resolution") == null ? null : str(body.get("resolution")).trim();
    if (resolution != null && resolution.length() > 2000) {
      throw new AdminException(400, "BAD_REQUEST", "Resolution note is too long (max 2000 characters).");
    }

    Map<String, Object> patch = new LinkedHashMap<>();
    patch.put("status", status);
    if (resolution != null && !resolution.isEmpty()) {
      patch.put("resolution", resolution);
    }
    boolean closing = status.startsWith("resolved_") || status.equals("closed");
    patch.put("resolved_by", closing ? admin.id() : null);
    patch.put("resolved_at", closing ? Instant.now().toString() : null);

    JsonNode updated = data.patch("disputes", "id=eq." + id, patch);
    if (updated.isEmpty()) {
      throw new AdminException(404, "NOT_FOUND", "Dispute not found.");
    }
    // Resolving a dispute here records the decision only; it does not move escrow funds.
    audit.record(admin, "dispute.update", "dispute", id,
        Map.of("status", status, "has_resolution", resolution != null && !resolution.isEmpty()),
        AdminAuthController.clientIp(request));
    return Map.of("ok", true);
  }

  // ================================================================ audit log

  @GetMapping("/audit-log")
  public Map<String, Object> auditLog(
      @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "25") int pageSize) {
    return paged(
        "admin_audit_log",
        "select=id,action,target_type,target_id,details,ip_address,created_at,"
            + "admin:profiles(username)&order=created_at.desc",
        page,
        pageSize);
  }

  // ================================================================ helpers

  private Map<String, Object> paged(String table, String query, int page, int pageSize) {
    int safePage = Math.max(1, Math.min(page, 100000));
    int safeSize = Math.max(1, Math.min(pageSize, 100));
    AdminDataClient.Page result = data.page(table, query, (safePage - 1) * safeSize, safeSize);
    Map<String, Object> out = new LinkedHashMap<>();
    out.put("rows", result.rows());
    out.put("total", result.total());
    out.put("page", safePage);
    out.put("pageSize", safeSize);
    return out;
  }

  /** Adds a case-insensitive "contains" match over the given columns, after sanitising the term. */
  private static void appendSearch(StringBuilder query, String q, String... columns) {
    if (q == null) {
      return;
    }
    String term = SAFE_SEARCH.matcher(q.trim()).replaceAll("");
    if (term.length() > 60) {
      term = term.substring(0, 60);
    }
    if (term.isBlank()) {
      return;
    }
    String pattern = "*" + term + "*";
    if (columns.length == 1) {
      query.append("&").append(columns[0]).append("=ilike.").append(enc(pattern));
    } else {
      StringBuilder or = new StringBuilder("(");
      for (int i = 0; i < columns.length; i++) {
        if (i > 0) {
          or.append(",");
        }
        or.append(columns[i]).append(".ilike.").append(pattern);
      }
      or.append(")");
      query.append("&or=").append(enc(or.toString()));
    }
  }

  private static AdminUser admin(HttpServletRequest request) {
    AdminUser admin = (AdminUser) request.getAttribute(AdminAuthInterceptor.ATTR_ADMIN);
    if (admin == null) {
      throw new AdminException(401, "UNAUTHORIZED", "Admin authentication required.");
    }
    return admin;
  }

  private static void requireUuid(String value) {
    if (value == null || !UUID.matcher(value).matches()) {
      throw new AdminException(400, "BAD_REQUEST", "Invalid id.");
    }
  }

  private static String requireIn(String value, Set<String> allowed, String field) {
    if (value == null || !allowed.contains(value)) {
      throw new AdminException(400, "BAD_REQUEST", "Invalid " + field + ".");
    }
    return value;
  }

  private static String str(Object value) {
    return value instanceof String s ? s : null;
  }

  private static double round(double value) {
    return Math.round(value * 100.0) / 100.0;
  }
}
