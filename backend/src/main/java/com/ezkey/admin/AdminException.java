package com.ezkey.admin;

/** Error that maps straight to an HTTP status + JSON body for the admin API. */
public class AdminException extends RuntimeException {
  private final int status;
  private final String code;

  public AdminException(int status, String code, String message) {
    super(message);
    this.status = status;
    this.code = code;
  }

  public int getStatus() {
    return status;
  }

  public String getCode() {
    return code;
  }
}
