package com.ezkey;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * EZKEY backend.
 *
 * <p>Spring Boot port of the Next.js server side of this repository:
 *
 * <ul>
 *   <li>{@code app/api/kyc/didit/session/route.ts}
 *   <li>{@code app/api/kyc/didit/status/route.ts}
 *   <li>{@code app/api/webhooks/didit/route.ts}
 *   <li>{@code app/auth/callback/route.ts}
 *   <li>{@code app/auth/confirm/route.ts}
 *   <li>{@code lib/didit.ts}, {@code lib/didit-webhook.ts}, {@code lib/seller-verification.ts},
 *       {@code lib/supabase/*}
 * </ul>
 *
 * <p>The React/Next.js pages and components stay exactly as they are; they simply call this
 * server instead of the Next.js route handlers.
 */
@SpringBootApplication
public class EzKeyBackendApplication {

  public static void main(String[] args) {
    SpringApplication.run(EzKeyBackendApplication.class, args);
  }
}
