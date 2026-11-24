package com.ezkey.admin;

import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(basePackages = "com.ezkey.admin")
public class AdminExceptionHandler {

  private static final Logger log = LoggerFactory.getLogger(AdminExceptionHandler.class);

  @ExceptionHandler(AdminException.class)
  public ResponseEntity<Map<String, Object>> handleAdmin(AdminException e) {
    return ResponseEntity.status(e.getStatus()).body(body(e.getMessage(), e.getCode()));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, Object>> handleBadBody(HttpMessageNotReadableException e) {
    return ResponseEntity.badRequest().body(body("Malformed request body", "BAD_REQUEST"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleOther(Exception e) {
    log.error("Unhandled admin API error", e);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(body("Internal server error", "SERVER_ERROR"));
  }

  private static Map<String, Object> body(String message, String code) {
    Map<String, Object> map = new LinkedHashMap<>();
    map.put("error", message);
    map.put("code", code);
    return map;
  }
}
