package com.ezkey.admin;

import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AdminAuditService {

  private static final Logger log = LoggerFactory.getLogger(AdminAuditService.class);

  private final AdminDataClient data;

  public AdminAuditService(AdminDataClient data) {
    this.data = data;
  }

  /** Never throws: a failed audit write must not roll back an already-applied admin action. */
  public void record(AdminUser admin, String action, String targetType, String targetId,
      Map<String, Object> details, String ip) {
    try {
      Map<String, Object> row = new LinkedHashMap<>();
      row.put("admin_id", admin.id());
      row.put("action", action);
      row.put("target_type", targetType);
      row.put("target_id", targetId);
      row.put("details", details == null ? Map.of() : details);
      row.put("ip_address", ip);
      data.insert("admin_audit_log", row);
    } catch (Exception e) {
      log.error("Failed to write admin audit log for action {} by {}", action, admin.id(), e);
    }
  }
}
