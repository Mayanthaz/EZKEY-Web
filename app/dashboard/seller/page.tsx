"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Package,
  ShoppingBag,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  KeyRound,
  Truck,
  ExternalLink,
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
import { OrderFulfilmentDialog } from "@/components/seller/OrderFulfilmentDialog";
import { toast } from "sonner";

export default function SellerDashboard() {
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    activeListings: 0,
    pendingOrders: 0,
    sellerRating: 4.8,
    recentOrders: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/stats");
      const data = await res.json();
      if (res.ok) {
        setStats({
          totalRevenue: data.totalRevenue || 0,
          activeListings: data.activeListings || 0,
          pendingOrders: data.pendingOrders || 0,
          sellerRating: data.sellerRating || 4.8,
          recentOrders: data.recentOrders || [],
        });
      }
    } catch {
      toast.error("Failed to load dashboard overview stats");
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Net Revenue",
      value: `$${Number(stats.totalRevenue).toFixed(2)}`,
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-neon-green",
      bg: "bg-neon-green/10",
      href: "/dashboard/seller/payouts",
    },
    {
      label: "Active Listings",
      value: `${stats.activeListings}`,
      change: "+3 this week",
      isPositive: true,
      icon: ShoppingBag,
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
      href: "/dashboard/seller/listings",
    },
    {
      label: "Pending Orders",
      value: `${stats.pendingOrders}`,
      change: stats.pendingOrders > 0 ? "Requires action" : "All clear",
      isPositive: stats.pendingOrders === 0,
      icon: Package,
      color: "text-neon-blue",
      bg: "bg-neon-blue/10",
      href: "/dashboard/seller/orders?status=paid",
    },
    {
      label: "Seller Rating",
      value: `${stats.sellerRating}`,
      change: "48 total reviews",
      isPositive: true,
      icon: Star,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
      href: "/dashboard/seller/settings",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Seller Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Store performance, active listings inventory, and live order fulfilment.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/seller/listings/new">
            <Button className="bg-neon-purple hover:bg-neon-purple/90 text-white font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="glass-card p-5 group transition-all hover:border-cyber-border block"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  stat.isPositive ? "text-neon-green" : "text-yellow-400"
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
          </Link>
        ))}
      </div>

      {/* Recent Orders Panel */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-cyber-border">
          <div>
            <h2 className="font-display text-base font-bold">Recent Store Orders</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live purchases requiring key dispatch or confirmed in escrow
            </p>
          </div>
          <Link
            href="/dashboard/seller/orders"
            className="text-xs text-neon-purple hover:text-neon-blue transition-colors flex items-center gap-1 font-medium"
          >
            View All Orders
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
            <p className="text-xs">Loading orders...</p>
          </div>
        ) : stats.recentOrders.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            No incoming orders yet. Once buyers purchase your listings, they will show up here.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-cyber-border">
                <TableHead>Order</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentOrders.map((order: any) => {
                const needsDelivery = order.status === "paid";
                return (
                  <TableRow
                    key={order.id}
                    className="border-cyber-border/40 hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-neon-purple">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="font-medium text-foreground max-w-[220px] truncate">
                      {order.product_title}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell text-xs">
                      {order.buyer_name}
                    </TableCell>
                    <TableCell className="font-bold text-neon-green">
                      ${Number(order.total_price).toFixed(2)}
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
                        className="text-[10px] capitalize"
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {needsDelivery ? (
                        <Button
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="bg-neon-green text-black hover:bg-neon-green/90 font-bold text-xs h-7"
                        >
                          <Truck className="w-3 h-3 mr-1" />
                          Fulfill
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs text-muted-foreground hover:text-foreground h-7"
                        >
                          Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Order Fulfilment Modal */}
      <OrderFulfilmentDialog
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderFulfilled={(updated) => {
          setStats((prev: any) => ({
            ...prev,
            recentOrders: prev.recentOrders.map((o: any) =>
              o.id === updated.id ? updated : o
            ),
          }));
        }}
      />
    </div>
  );
}
