"use client";

import { Clock, Gamepad2, Package, Search, Key } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const orders = [
  {
    id: "ORD-8a4f2c1d",
    title: "Cyberpunk 2077 Ultimate Edition",
    seller: "KeyMaster",
    amount: "$29.99",
    status: "completed",
    date: "Jul 7, 2026",
    platform: "Steam",
  },
  {
    id: "ORD-3b7e9f0a",
    title: "Elden Ring Shadow of the Erdtree DLC",
    seller: "GameVault",
    amount: "$34.99",
    status: "delivered",
    date: "Jul 6, 2026",
    platform: "Steam",
  },
  {
    id: "ORD-6c2d4e8b",
    title: "Xbox Game Pass Ultimate — 12 Months",
    seller: "SubKing",
    amount: "$119.99",
    status: "paid",
    date: "Jul 5, 2026",
    platform: "Xbox",
  },
];

export default function BuyerOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.seller.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    return o.status === activeTab;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Order History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your purchased items, escrow status, and activation receipts.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product, order ID, or seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
          <TabsList className="bg-cyber-card border border-cyber-border">
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-cyber-border">
              <TableHead>Order ID</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="hidden sm:table-cell">Platform</TableHead>
              <TableHead className="hidden sm:table-cell">Seller</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
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
                  {order.amount}
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
                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                  {order.date}
                </TableCell>
                <TableCell className="text-right">
                  <Link href="/dashboard/buyer/keys">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-neon-green hover:bg-neon-green/10 h-8"
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
    </div>
  );
}
