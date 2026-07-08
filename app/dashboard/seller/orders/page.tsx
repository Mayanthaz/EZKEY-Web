"use client";

import { Clock, CheckCircle, Truck, Package } from "lucide-react";

const orders = [
  { id: "ORD-8a4f2c1d", product: "Cyberpunk 2077 Ultimate", buyer: "Alex G.", amount: "$29.99", status: "delivered", escrow: "held", date: "Jul 7, 2026" },
  { id: "ORD-3b7e9f0a", product: "Elden Ring DLC", buyer: "Sarah M.", amount: "$34.99", status: "paid", escrow: "held", date: "Jul 6, 2026" },
  { id: "ORD-6c2d4e8b", product: "Steam Gift Card $50", buyer: "Mike R.", amount: "$46.99", status: "completed", escrow: "released", date: "Jul 5, 2026" },
  { id: "ORD-1f5a3c7d", product: "CS2 Karambit Fade", buyer: "Jordan K.", amount: "$1,299.99", status: "pending", escrow: "pending", date: "Jul 4, 2026" },
];

const statusConfig: Record<string, { label: string; class: string; icon: typeof Clock }> = {
  pending: { label: "Pending", class: "badge-warning", icon: Clock },
  paid: { label: "Paid", class: "badge-info", icon: Package },
  delivered: { label: "Delivered", class: "badge-purple", icon: Truck },
  completed: { label: "Completed", class: "badge-success", icon: CheckCircle },
};

const escrowConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "⏳ Awaiting", class: "text-yellow-400" },
  held: { label: "🔒 Held", class: "text-neon-blue" },
  released: { label: "✅ Released", class: "text-neon-green" },
};

export default function SellerOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage incoming orders and deliveries</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyber-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Order</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Product</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Buyer</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden md:table-cell">Escrow</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-cyber-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4"><span className="text-sm font-mono text-neon-purple">{order.id}</span></td>
                  <td className="px-5 py-4"><span className="text-sm font-medium truncate max-w-[200px] block">{order.product}</span></td>
                  <td className="px-5 py-4 hidden sm:table-cell"><span className="text-sm text-muted-foreground">{order.buyer}</span></td>
                  <td className="px-5 py-4"><span className="text-sm font-semibold text-neon-green">{order.amount}</span></td>
                  <td className="px-5 py-4"><span className={statusConfig[order.status]?.class}>{statusConfig[order.status]?.label}</span></td>
                  <td className="px-5 py-4 hidden md:table-cell"><span className={`text-xs font-medium ${escrowConfig[order.escrow]?.class}`}>{escrowConfig[order.escrow]?.label}</span></td>
                  <td className="px-5 py-4 hidden lg:table-cell"><span className="text-xs text-muted-foreground">{order.date}</span></td>
                  <td className="px-5 py-4">
                    {order.status === "paid" && (
                      <button className="px-3 py-1.5 bg-neon-green/10 text-neon-green text-xs font-medium rounded-lg border border-neon-green/20 hover:bg-neon-green/20 transition-all">
                        Deliver
                      </button>
                    )}
                    {order.status === "delivered" && (
                      <span className="text-xs text-muted-foreground">Awaiting buyer</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
