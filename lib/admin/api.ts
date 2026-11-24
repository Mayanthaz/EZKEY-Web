"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Same-origin prefix; next.config.ts rewrites it to the Spring Boot backend. */
const BASE = "/admin-api";

export class AdminApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type AdminIdentity = {
  id: string;
  email: string | null;
  username: string;
  displayName: string;
};

function request(path: string, init: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      // Required by the backend for state-changing calls (CSRF defence in depth).
      "X-Requested-With": "ezkey-admin",
      ...(init.headers ?? {}),
    },
  });
}

async function toError(res: Response): Promise<AdminApiError> {
  let message = `Request failed (${res.status})`;
  let code: string | undefined;
  try {
    const body = await res.json();
    if (body?.error) message = body.error;
    code = body?.code;
  } catch {
    // non-JSON error body (e.g. backend offline behind the proxy)
    if (res.status >= 502) message = "Admin backend is unreachable. Is the Spring Boot server running?";
  }
  return new AdminApiError(message, res.status, code);
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  refreshing ??= request("/auth/refresh", { method: "POST" })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export function redirectToLogin() {
  const here = `${window.location.pathname}${window.location.search}`;
  const target =
    here === "/admin" || here.startsWith("/admin/login")
      ? "/admin/login"
      : `/admin/login?redirectedFrom=${encodeURIComponent(here)}`;
  window.location.replace(target);
}

/** JSON call to the admin API. On 401 it refreshes the session once, then bounces to login. */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await request(path, init);
  if (res.status === 401 && !path.startsWith("/auth/")) {
    if (await tryRefresh()) {
      res = await request(path, init);
    }
    if (res.status === 401) {
      redirectToLogin();
      throw new AdminApiError("Session expired", 401, "UNAUTHORIZED");
    }
  }
  if (!res.ok) throw await toError(res);
  return (await res.json()) as T;
}

export const adminAuth = {
  async login(email: string, password: string): Promise<AdminIdentity> {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw await toError(res);
    return (await res.json()).admin as AdminIdentity;
  },
  async logout(): Promise<void> {
    await request("/auth/logout", { method: "POST" }).catch(() => undefined);
  },
  async me(): Promise<AdminIdentity | null> {
    const res = await request("/auth/me");
    if (res.status === 401 && (await tryRefresh())) {
      const retry = await request("/auth/me");
      return retry.ok ? ((await retry.json()).admin as AdminIdentity) : null;
    }
    if (res.status === 401) return null;
    if (!res.ok) throw await toError(res);
    return (await res.json()).admin as AdminIdentity;
  },
};

export type Paged<T> = { rows: T[]; total: number; page: number; pageSize: number };

/** Loads a paginated admin list and refetches whenever the params change. */
export function useAdminList<T>(path: string, params: Record<string, string | number | undefined>) {
  const [data, setData] = useState<Paged<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const qs = query.toString();

  const load = useCallback(async () => {
    const id = ++seq.current;
    setLoading(true);
    try {
      const result = await adminFetch<Paged<T>>(`${path}?${qs}`);
      if (id !== seq.current) return; // a newer request superseded this one
      setData(result);
      setError(null);
    } catch (e) {
      if (id !== seq.current) return;
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, [path, qs]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

export const money = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value ?? 0);

export const dateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
    : "—";
