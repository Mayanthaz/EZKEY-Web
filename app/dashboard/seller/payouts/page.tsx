"use client";

import { DollarSign, Clock, Wallet } from "lucide-react";

const payouts = [
  { id: "PAY-001", amount: "$245.50", method: "Stripe", status: "completed", date: "Jul 5, 2026" },
  { id: "PAY-002", amount: "$180.00", method: "PayPal", status: "processing", date: "Jul 7, 2026" },
  { id: "PAY-003", amount: "$520.75", method: "Stripe", status: "completed", date: "Jun 28, 2026" },
];

export default function PayoutsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your earnings and withdrawals</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-neon-green" />
          </div>
          <p className="font-display text-2xl font-bold">$2,450.25</p>
          <p className="text-xs text-muted-foreground mt-1">Available Balance</p>
        </div>
        <div className="glass-card p-5">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-neon-blue" />
          </div>
          <p className="font-display text-2xl font-bold">$180.00</p>
          <p className="text-xs text-muted-foreground mt-1">Pending Payout</p>
        </div>
        <div className="glass-card p-5">
          <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5 text-neon-purple" />
          </div>
          <p className="font-display text-2xl font-bold">$12,450.00</p>
          <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-neon text-sm !px-6 !py-2.5">
          <span className="relative z-10">Request Payout</span>
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-cyber-border">
          <h2 className="font-display text-lg font-bold">Payout History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cyber-border">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">ID</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Method</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-cyber-border/50 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4"><span className="text-sm font-mono text-neon-purple">{p.id}</span></td>
                  <td className="px-5 py-4"><span className="text-sm font-semibold text-neon-green">{p.amount}</span></td>
                  <td className="px-5 py-4"><span className="text-sm text-muted-foreground">{p.method}</span></td>
                  <td className="px-5 py-4">
                    <span className={p.status === "completed" ? "badge-success" : "badge-info"}>
                      {p.status === "completed" ? "✅ Completed" : "⏳ Processing"}
                    </span>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs text-muted-foreground">{p.date}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
