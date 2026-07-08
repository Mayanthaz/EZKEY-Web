"use client";

import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingBag,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Eye,
  Plus,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Total Revenue",
    value: "$12,450.00",
    change: "+12.5%",
    isPositive: true,
    icon: DollarSign,
    color: "neon-green",
  },
  {
    label: "Active Listings",
    value: "24",
    change: "+3",
    isPositive: true,
    icon: ShoppingBag,
    color: "neon-purple",
  },
  {
    label: "Pending Orders",
    value: "8",
    change: "-2",
    isPositive: false,
    icon: Package,
    color: "neon-blue",
  },
  {
    label: "Seller Rating",
    value: "4.8",
    change: "+0.1",
    isPositive: true,
    icon: Star,
    color: "yellow-400",
  },
];

const recentOrders = [
  { id: "ORD-8a4f2c1d", product: "Cyberpunk 2077 Ultimate", buyer: "Alex G.", amount: "$29.99", status: "delivered", time: "2 hours ago" },
  { id: "ORD-3b7e9f0a", product: "Elden Ring DLC", buyer: "Sarah M.", amount: "$34.99", status: "paid", time: "5 hours ago" },
  { id: "ORD-6c2d4e8b", product: "Steam Gift Card $50", buyer: "Mike R.", amount: "$46.99", status: "completed", time: "1 day ago" },
  { id: "ORD-1f5a3c7d", product: "CS2 Karambit Fade", buyer: "Jordan K.", amount: "$1,299.99", status: "pending", time: "2 days ago" },
];

const statusColors: Record<string, string> = {
  pending: "badge-warning",
  paid: "badge-info",
  delivered: "badge-purple",
  completed: "badge-success",
};

export default function SellerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here&apos;s your store overview.
          </p>
        </div>
        <Link
          href="/dashboard/seller/listings/new"
          className="btn-neon text-sm !px-5 !py-2.5 inline-flex items-center gap-2 w-fit"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Listing
          </span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.isPositive ? "text-neon-green" : "text-red-400"
                }`}
              >
                {stat.isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </span>
            </div>
            <p className="font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-cyber-border">
          <h2 className="font-display text-lg font-bold">Recent Orders</h2>
          <Link
            href="/dashboard/seller/orders"
            className="text-xs text-neon-purple hover:text-neon-blue transition-colors flex items-center gap-1"
          >
            View All
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyber-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Order
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Product
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">
                  Buyer
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-cyber-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-mono text-neon-purple">
                      {order.id}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-medium truncate max-w-[200px] block">
                      {order.product}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {order.buyer}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-neon-green">
                      {order.amount}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={statusColors[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {order.time}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Listings */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm font-semibold mb-4">Top Performing Listings</h3>
          <div className="space-y-3">
            {[
              { name: "Cyberpunk 2077 Ultimate", sales: 1230, revenue: "$36,893.70", views: 8940 },
              { name: "Elden Ring DLC", sales: 890, revenue: "$31,141.10", views: 6720 },
              { name: "Xbox Game Pass 12M", sales: 1120, revenue: "$134,388.80", views: 9800 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 bg-cyber-surface/30 rounded-lg">
                <span className="font-display text-lg font-bold text-muted-foreground w-8">
                  #{i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span>{item.sales} sales</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-neon-green whitespace-nowrap">
                  {item.revenue}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Chart Placeholder */}
        <div className="glass-card p-5">
          <h3 className="font-display text-sm font-semibold mb-4">Revenue Overview</h3>
          <div className="h-48 flex items-center justify-center border border-dashed border-cyber-border rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-10 h-10 text-neon-purple/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Revenue chart loads with real data
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connect Supabase to see analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
