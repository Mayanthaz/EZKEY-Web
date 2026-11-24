package com.ezkey.admin;

/** An authenticated user that has been verified to hold {@code profiles.role = 'admin'}. */
public record AdminUser(String id, String email, String username, String displayName) {}
