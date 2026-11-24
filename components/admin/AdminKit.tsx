"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Small shared building blocks for the admin pages. */

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-neon-green/10 text-neon-green border-neon-green/30",
  completed: "bg-neon-green/10 text-neon-green border-neon-green/30",
  verified: "bg-neon-green/10 text-neon-green border-neon-green/30",
  delivered: "bg-neon-green/10 text-neon-green border-neon-green/30",
  resolved_buyer: "bg-neon-green/10 text-neon-green border-neon-green/30",
  resolved_seller: "bg-neon-green/10 text-neon-green border-neon-green/30",
  paid: "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
  processing: "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
  under_review: "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
  seller: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
  admin: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
  pending: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  submitted: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  open: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  draft: "bg-white/5 text-muted-foreground border-white/10",
  paused: "bg-white/5 text-muted-foreground border-white/10",
  buyer: "bg-white/5 text-muted-foreground border-white/10",
  closed: "bg-white/5 text-muted-foreground border-white/10",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
  rejected: "bg-red-500/10 text-red-400 border-red-500/30",
  refunded: "bg-red-500/10 text-red-400 border-red-500/30",
  disputed: "bg-red-500/10 text-red-400 border-red-500/30",
  removed: "bg-red-500/10 text-red-400 border-red-500/30",
  sold_out: "bg-red-500/10 text-red-400 border-red-500/30",
};

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const key = value ?? "";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize whitespace-nowrap",
        STATUS_STYLES[key] ?? "bg-white/5 text-muted-foreground border-white/10",
      )}
    >
      {key.replace(/_/g, " ") || "—"}
    </span>
  );
}

/** Search box that reports the typed value after the user pauses. */
export function SearchBox({
  placeholder,
  onSearch,
}: {
  placeholder: string;
  onSearch: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  useEffect(() => {
    const t = setTimeout(() => onSearch(value.trim()), 350);
    return () => clearTimeout(t);
  }, [value, onSearch]);
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="bg-white/[0.03] border-white/10 pl-9"
      />
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-white/10 bg-cyber-card px-3 text-sm capitalize text-foreground focus:outline-none focus:ring-1 focus:ring-neon-purple/50"
    >
      <option value="">{`All ${label}`}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}

/** Compact inline select used for row actions (status / role changes). */
export function InlineSelect({
  value,
  onChange,
  options,
  disabled,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
  label: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 rounded-md border border-white/10 bg-cyber-card px-2 text-xs capitalize text-foreground focus:outline-none focus:ring-1 focus:ring-neon-purple/50 disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}

export function TableState({
  loading,
  error,
  empty,
  colSpan,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
  colSpan: number;
}) {
  if (error) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-red-400">
          <AlertCircle className="mx-auto mb-2 h-5 w-5" />
          {error}
        </td>
      </tr>
    );
  }
  if (loading && empty) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
          Loading…
        </td>
      </tr>
    );
  }
  if (empty) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-muted-foreground">
          Nothing to show.
        </td>
      </tr>
    );
  }
  return null;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-cyber-border px-4 py-3 text-xs text-muted-foreground">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2">
          Page {page} / {pages}
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/** Wrapper that gives every list the same card + horizontal-scroll treatment. */
export function TableCard({ children }: { children: React.ReactNode }) {
  return <div className="glass-card overflow-hidden !rounded-xl">{children}</div>;
}

export const thClass = "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap";
export const tdClass = "px-4 py-3 text-sm align-middle";
