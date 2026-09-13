import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Shared USD formatting.
 *
 * Prices were being rendered with `price.toFixed(2)` across ~8 screens.
 * Centralising this means adding a currency later is one edit, and every
 * surface stays consistent.
 */
export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Compact number formatting for counters ("5,670 sold", "4.9K listings").
 * Used wherever the UI needs a short, scannable figure.
 */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/**
 * Relative time helper ("3h ago", "2d ago").
 * Centralised so every timestamp across dashboards/orders/messages
 * reads the same way.
 */
export function timeAgo(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds)) return "";
  if (seconds < 60) return "just now";

  const steps: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.34524, "week"],
    [12, "month"],
    [Infinity, "year"],
  ];

  let value = seconds;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  for (const [next, u] of steps) {
    if (value < next) break;
    value = value / next;
    unit = u;
  }

  return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
    -Math.floor(value),
    unit
  );
}


// This check can be removed, it is just for tutorial purposes
export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
