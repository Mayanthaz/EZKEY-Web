"use client";

import { Clock, Gamepad2 } from "lucide-react";

const orders = [
  { id: "ORD-8a4f2c1d", title: "Cyberpunk 2077 Ultimate Edition", seller: "KeyMaster", amount: "$29.99", status: "completed", date: "Jul 7, 2026" },
  { id: "ORD-3b7e9f0a", title: "Elden Ring Shadow of the Erdtree DLC", seller: "GameVault", amount: "$34.99", status: "delivered", date: "Jul 6, 2026" },
  { id: "ORD-6c2d4e8b", title: "Xbox Game Pass Ultimate — 12 Months", seller: "SubKing", amount: "$119.99", status: "paid", date: "Jul 5, 2026" },
];

const statusConfig: Record<string, { label: string; class: string }> = {
  pending: { label: "Pending", class: "badge-warning" },
  paid: { label: "Processing", class: "badge-info" },
  delivered: { label: "Delivered", class: "badge-purple" },
  completed: { label: "Completed", class: "badge-success" },
};

export default function BuyerOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all your purchases</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="glass-card flex items-center gap-4 p-5 group hover:border-neon-purple/20 transition-all">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyber-card to-cyber-surface flex items-center justify-center shrink-0">
              <Gamepad2 className="w-7 h-7 text-cyber-border/50" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold truncate">{order.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>by {order.seller}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{order.date}</span>
              </div>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="text-sm font-semibold text-neon-green">{order.amount}</p>
              <span className={statusConfig[order.status]?.class}>{statusConfig[order.status]?.label}</span>
            </div>
            {order.status === "delivered" && (
              <button className="shrink-0 px-4 py-2 bg-neon-green/10 text-neon-green text-xs font-medium rounded-lg border border-neon-green/20 hover:bg-neon-green/20 transition-all">
                Confirm
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
