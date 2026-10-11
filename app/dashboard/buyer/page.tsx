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
  Store,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const stats = [
  {
    label: "Total Purchases",
    value: "23",
    icon: ShoppingCart,
    colorClass: "text-neon-blue",
    bgClass: "bg-neon-blue/10 border-neon-blue/20",
    href: "/dashboard/buyer/orders",
  },
  {
    label: "Active Deliveries",
    value: "3",
    icon: Package,
    colorClass: "text-neon-purple",
    bgClass: "bg-neon-purple/10 border-neon-purple/20",
    href: "/dashboard/buyer/orders",
  },
  {
    label: "Digital Keys in Vault",
    value: "18",
    icon: Key,
    colorClass: "text-neon-green",
    bgClass: "bg-neon-green/10 border-neon-green/20",
    href: "/dashboard/buyer/keys",
  },
  {
    label: "Verified Buyer Rating",
    value: "5.0 ★",
    icon: Star,
    colorClass: "text-yellow-400",
    bgClass: "bg-yellow-400/10 border-yellow-400/20",
    href: "/dashboard/buyer/settings",
  },
];

const recentPurchases = [
  {
    id: "ORD-8a4f2c1d",
    title: "Cyberpunk 2077 Ultimate Edition",
    seller: "KeyMaster",
    price: 29.99,
    status: "completed",
    date: "2 hours ago",
    platform: "Steam",
  },
  {
    id: "ORD-3b7e9f0a",
    title: "Elden Ring Shadow of the Erdtree DLC",
    seller: "GameVault",
    price: 34.99,
    status: "delivered",
    date: "1 day ago",
    platform: "Steam",
  },
  {
    id: "ORD-6c2d4e8b",
    title: "Xbox Game Pass Ultimate — 12 Months",
    seller: "SubKing",
    price: 119.99,
    status: "paid",
    date: "3 days ago",
    platform: "Xbox",
  },
];

export default function BuyerDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30 font-semibold text-xs">
              Buyer Portal
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-neon-green" /> Escrow Protected
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mt-1 text-foreground">
            Welcome back to your Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your purchases, redeem license keys, and track live order deliveries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/marketplace">
            <Button className="bg-neon-purple hover:bg-neon-purple/90 text-white font-semibold text-xs h-9">
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              Browse Games
            </Button>
          </Link>
          <Link href="/become-a-seller">
            <Button
              variant="outline"
              className="text-xs h-9 border-cyber-border hover:border-white/20"
            >
              <Store className="w-3.5 h-3.5 mr-1.5 text-neon-purple" />
              Become a Seller
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="glass-card p-5 group hover:border-cyber-border transition-all block"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bgClass} border flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.colorClass}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Purchases Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-cyber-border">
          <div>
            <h2 className="font-display text-base font-bold">Recent Purchases</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your latest orders and instant digital deliveries
            </p>
          </div>
          <Link
            href="/dashboard/buyer/orders"
            className="text-xs text-neon-purple hover:text-neon-blue transition-colors flex items-center gap-1 font-medium"
          >
            View All Purchases
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-cyber-border">
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Platform</TableHead>
              <TableHead className="hidden sm:table-cell">Seller</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPurchases.map((order) => (
              <TableRow
                key={order.id}
                className="border-cyber-border/40 hover:bg-white/[0.02]"
              >
                <TableCell className="font-mono text-xs font-semibold text-neon-purple">
                  {order.id}
                </TableCell>
                <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                  {order.title}
                </TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell text-xs">
                  {order.platform}
                </TableCell>
                <TableCell className="text-muted-foreground hidden sm:table-cell text-xs">
                  {order.seller}
                </TableCell>
                <TableCell className="font-bold text-neon-green">
                  ${order.price.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "completed"
                        ? "default"
                        : order.status === "delivered"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-[10px] capitalize font-bold"
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link href="/dashboard/buyer/keys">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8 text-neon-green hover:bg-neon-green/10"
                    >
                      <Key className="w-3.5 h-3.5 mr-1" />
                      View Key
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Quick Action Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/marketplace"
          className="glass-card p-5 group hover:border-neon-purple/40 transition-all block space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Explore New Deals</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Browse verified digital keys, game gifts, and software licenses.
          </p>
        </Link>

        <Link
          href="/dashboard/buyer/keys"
          className="glass-card p-5 group hover:border-neon-green/40 transition-all block space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green">
            <Key className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">My Digital Keys Vault</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Access your permanent library of redeemed activation codes.
          </p>
        </Link>

        <Link
          href="/become-a-seller"
          className="glass-card p-5 group hover:border-neon-blue/40 transition-all block space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue">
            <Store className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Open a Seller Store</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Apply to list your own digital inventory and automate key delivery.
          </p>
        </Link>
      </div>
    </div>
  );
}
