"use client";

import { useState, useEffect } from "react";
import {
  DollarSign,
  Clock,
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
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
import { RequestPayoutDialog } from "@/components/seller/RequestPayoutDialog";
import { toast } from "sonner";

export default function PayoutsPage() {
  const [financials, setFinancials] = useState<any>({
    availableBalance: 0,
    pendingEscrow: 0,
    totalEarned: 0,
    payouts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/payouts");
      const data = await res.json();
      if (res.ok) {
        setFinancials({
          availableBalance: data.availableBalance || 0,
          pendingEscrow: data.pendingEscrow || 0,
          totalEarned: data.totalEarned || 0,
          payouts: data.payouts || [],
        });
      } else {
        toast.error(data.error || "Failed to load financials");
      }
    } catch {
      toast.error("Failed to connect to internal payouts API");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Earnings & Payouts Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor escrow releases, track revenue net of 5% platform fees, and withdraw funds.
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          disabled={financials.availableBalance < 10}
          className="bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Request Payout
        </Button>
      </div>

      {/* Financials Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 group">
          <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-neon-green" />
          </div>
          <p className="font-display text-2xl font-bold text-neon-green">
            ${financials.availableBalance.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Available for Withdrawal (Completed Orders)
          </p>
        </div>

        <div className="glass-card p-5 group">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-neon-blue" />
          </div>
          <p className="font-display text-2xl font-bold text-neon-blue">
            ${financials.pendingEscrow.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Held in Escrow (Awaiting Buyer Confirmation)
          </p>
        </div>

        <div className="glass-card p-5 group">
          <div className="w-10 h-10 rounded-xl bg-neon-purple/10 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5 text-neon-purple" />
          </div>
          <p className="font-display text-2xl font-bold text-foreground">
            ${financials.totalEarned.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Total Net Lifetime Earnings
          </p>
        </div>
      </div>

      {/* Payout History Ledger */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-cyber-border flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Payout Transactions</h2>
          <span className="text-xs text-muted-foreground">
            Minimum withdrawal threshold: $10.00
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
            <p className="text-xs">Loading ledger records...</p>
          </div>
        ) : financials.payouts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground space-y-1">
            <p className="text-sm font-semibold">No payout requests recorded</p>
            <p className="text-xs">When you request a payout, the transaction log will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-cyber-border">
                <TableHead>Payout Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="hidden sm:table-cell">Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date Requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financials.payouts.map((p: any) => (
                <TableRow key={p.id} className="border-cyber-border/40 hover:bg-white/[0.02]">
                  <TableCell className="font-mono text-xs font-semibold text-neon-purple">
                    {p.id}
                  </TableCell>
                  <TableCell className="font-bold text-neon-green">
                    ${Number(p.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="capitalize text-xs font-medium">
                    {p.method}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-[150px] truncate">
                    {p.destination}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.status === "completed"
                          ? "default"
                          : p.status === "processing"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] capitalize font-bold"
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Request Payout Dialog */}
      <RequestPayoutDialog
        isOpen={isDialogOpen}
        availableBalance={financials.availableBalance}
        onClose={() => setIsDialogOpen(false)}
        onPayoutRequested={() => fetchPayouts()}
      />
    </div>
  );
}
