"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  Search,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.error || "Failed to load orders");
      }
    } catch {
      toast.error("Failed to connect to internal orders API");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.product_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "all") return true;
    return o.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30">Paid - Awaiting Keys</Badge>;
      case "delivered":
        return <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30">Delivered</Badge>;
      case "completed":
        return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold">Incoming Orders & Fulfilment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track buyer purchases, fulfill digital game keys, and monitor escrow release.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, product, or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-fit">
          <TabsList className="bg-cyber-card border border-cyber-border">
            <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
            <TabsTrigger value="paid">Needs Fulfilment</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
            <p className="text-xs">Loading orders from internal server...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Package className="w-10 h-10 text-cyber-border mx-auto opacity-50" />
            <p className="text-sm font-semibold">No orders found</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "No results matching your query." : "Incoming orders will appear here in real-time."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-cyber-border">
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Buyer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Escrow</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const needsDelivery = order.status === "paid";
                return (
                  <TableRow
                    key={order.id}
                    className="border-cyber-border/40 hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-neon-purple">
                      {order.order_number}
                    </TableCell>
                    <TableCell className="font-medium text-foreground max-w-[200px] truncate">
                      {order.product_title}
                    </TableCell>
                    <TableCell className="text-muted-foreground hidden sm:table-cell">
                      {order.buyer_name}
                    </TableCell>
                    <TableCell className="font-bold text-neon-green">
                      ${Number(order.total_price).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs font-medium text-neon-blue">
                        🔒 {order.escrow_status || "held"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {needsDelivery ? (
                        <Button
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="bg-neon-green text-black hover:bg-neon-green/90 font-bold text-xs h-8"
                        >
                          <Truck className="w-3.5 h-3.5 mr-1.5" />
                          Fulfill Now
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="text-xs text-muted-foreground hover:text-foreground h-8"
                        >
                          Inspect Details
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
          setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o))
          );
        }}
      />
    </div>
  );
}
