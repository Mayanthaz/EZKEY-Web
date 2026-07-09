"use client";

import {
  ShoppingCart,
  Package,
  Key,
  Star,
  ArrowUpRight,
  Clock,
  Gamepad2,
  Shield,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    label: "Total Purchases",
    value: "23",
    icon: ShoppingCart,
    color: "neon-blue",
  },
  {
    label: "Active Orders",
    value: "3",
    icon: Package,
    color: "neon-orange",
  },
  {
    label: "Digital Keys",
    value: "18",
    icon: Key,
    color: "neon-green",
  },
  {
    label: "Reviews Given",
    value: "12",
    icon: Star,
    color: "yellow-400",
  },
];

const recentPurchases = [
  {
    id: "ORD-8a4f2c1d",
    title: "Cyberpunk 2077 Ultimate Edition",
    seller: "KeyMaster",
    price: "$29.99",
    status: "completed",
    date: "2 hours ago",
    platform: "Steam",
  },
  {
    id: "ORD-3b7e9f0a",
    title: "Elden Ring Shadow of the Erdtree DLC",
    seller: "GameVault",
    price: "$34.99",
    status: "delivered",
    date: "1 day ago",
    platform: "Steam",
  },
  {
    id: "ORD-6c2d4e8b",
    title: "Xbox Game Pass Ultimate — 12 Months",
    seller: "SubKing",
    price: "$119.99",
    status: "paid",
    date: "3 days ago",
    platform: "Xbox",
  },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "badge-warning" },
  paid: { label: "Processing", class: "badge-info" },
  delivered: { label: "Delivered", class: "badge-purple" },
  completed: { label: "Completed", class: "badge-success" },
};

export default function BuyerDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your purchases and digital keys
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}/10 flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}`} />
            </div>
            <p className="font-display text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Purchases */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-cyber-border">
          <h2 className="font-display text-lg font-bold">Recent Purchases</h2>
          <Link
            href="/dashboard/buyer/orders"
            className="text-xs text-neon-purple hover:text-neon-blue transition-colors flex items-center gap-1"
          >
            View All Orders
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-cyber-border/50">
          {recentPurchases.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-card to-cyber-surface
                            flex items-center justify-center shrink-0">
                <Gamepad2 className="w-6 h-6 text-cyber-border" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{order.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>by {order.seller}</span>
                  <span>•</span>
                  <span>{order.platform}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {order.date}
                  </span>
                </div>
              </div>

              {/* Price & Status */}
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-neon-green">{order.price}</p>
                <span className={`mt-1 ${statusConfig[order.status]?.class}`}>
                  {statusConfig[order.status]?.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/marketplace"
          className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center mb-3
                        group-hover:bg-neon-purple/20 transition-all">
            <ShoppingCart className="w-5 h-5 text-neon-purple" />
          </div>
          <h3 className="text-sm font-semibold mb-1 group-hover:text-neon-purple transition-colors">
            Browse Marketplace
          </h3>
          <p className="text-xs text-muted-foreground">
            Discover new digital deals and keys
          </p>
        </Link>

        <Link
          href="/dashboard/buyer/keys"
          className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center mb-3
                        group-hover:bg-neon-green/20 transition-all">
            <Key className="w-5 h-5 text-neon-green" />
          </div>
          <h3 className="text-sm font-semibold mb-1 group-hover:text-neon-green transition-colors">
            My Digital Keys
          </h3>
          <p className="text-xs text-muted-foreground">
            View and manage your purchased keys
          </p>
        </Link>

        <Link
          href="/dashboard/buyer/messages"
          className="glass-card p-5 group hover:-translate-y-1 transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-3
                        group-hover:bg-neon-blue/20 transition-all">
            <Shield className="w-5 h-5 text-neon-blue" />
          </div>
          <h3 className="text-sm font-semibold mb-1 group-hover:text-neon-blue transition-colors">
            Support & Chat
          </h3>
          <p className="text-xs text-muted-foreground">
            Contact sellers or get help
          </p>
        </Link>
      </div>
    </div>
  );
}
