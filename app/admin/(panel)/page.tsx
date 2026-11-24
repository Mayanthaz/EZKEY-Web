"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  DollarSign,
  Loader2,
  ShoppingBag,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageHeader, StatusBadge } from "@/components/admin/AdminKit";
import { useAdmin } from "@/components/admin/AdminShell";
import { adminFetch, dateTime, money } from "@/lib/admin/api";

type Stats = {
  totalUsers: number;
  buyers: number;
  sellers: number;
  admins: number;
  newUsers7d: number;
  totalListings: number;
  activeListings: number;
  totalOrders: number;
  pendingVerifications: number;
  openDisputes: number;
  grossRevenue: number;
  platformFees: number;
  revenueCapped: boolean;
  ordersByDay: { date: string; orders: number; revenue: number }[];
  recentOrders: {
    id: string;
    order_number: string;
    total_price: number;
    status: string;
    created_at: string;
    buyer: { username: string } | null;
    listing: { title: string } | null;
  }[];
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "text-neon-purple",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  href?: string;
  tone?: string;
}) {
  const body = (
    <div className="glass-card h-full p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

export default function AdminDashboardPage() {
  const admin = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Stats>("/stats")
      .then(setStats)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load stats"));
  }, []);

  if (error) {
    return <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{error}</p>;
  }
  if (!stats) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-neon-purple" />
      </div>
    );
  }

  const maxOrders = Math.max(1, ...stats.ordersByDay.map((d) => d.orders));

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${admin.displayName || admin.username}. Here's what's happening on EZKEY.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={stats.totalUsers} hint={`+${stats.newUsers7d} in 7 days · ${stats.sellers} sellers`} icon={Users} href="/admin/users" />
        <StatCard label="Listings" value={stats.totalListings} hint={`${stats.activeListings} active`} icon={ShoppingBag} href="/admin/listings" tone="text-neon-blue" />
        <StatCard label="Orders" value={stats.totalOrders} icon={ShoppingCart} href="/admin/orders" tone="text-neon-green" />
        <StatCard
          label="Gross revenue"
          value={money(stats.grossRevenue)}
          hint={`${money(stats.platformFees)} platform fees${stats.revenueCapped ? " · latest 10,000 orders" : ""}`}
          icon={DollarSign}
          tone="text-neon-green"
        />
        <StatCard label="Pending seller KYC" value={stats.pendingVerifications} icon={BadgeCheck} href="/admin/verifications" tone="text-neon-orange" />
        <StatCard label="Open disputes" value={stats.openDisputes} icon={AlertTriangle} href="/admin/disputes" tone="text-neon-pink" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="glass-card p-5 lg:col-span-3">
          <h2 className="font-display text-sm font-semibold">Paid orders · last 14 days</h2>
          <div className="mt-6 flex h-40 items-end gap-1.5">
            {stats.ordersByDay.map((d) => (
              <div key={d.date} className="group relative flex h-full flex-1 flex-col justify-end">
                <div
                  className="rounded-t bg-gradient-to-t from-neon-purple/60 to-neon-blue/70 transition-opacity group-hover:opacity-80"
                  style={{ height: `${(d.orders / maxOrders) * 100}%`, minHeight: d.orders ? 4 : 2 }}
                />
                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-cyber-card px-2 py-1 text-[10px] shadow group-hover:block">
                  {d.date.slice(5)} · {d.orders} · {money(d.revenue)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{stats.ordersByDay[0]?.date.slice(5)}</span>
            <span>{stats.ordersByDay[stats.ordersByDay.length - 1]?.date.slice(5)}</span>
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="font-display text-sm font-semibold">Recent orders</h2>
          <ul className="mt-4 space-y-3">
            {stats.recentOrders.length === 0 && <li className="text-sm text-muted-foreground">No orders yet.</li>}
            {stats.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.listing?.title ?? o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.buyer?.username ?? "unknown"} · {dateTime(o.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-medium">{money(o.total_price)}</span>
                  <StatusBadge value={o.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
