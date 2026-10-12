"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { payoutRequestSchema } from "@/lib/validations/seller";

type RequestPayoutDialogProps = {
  isOpen: boolean;
  availableBalance: number;
  onClose: () => void;
  onPayoutRequested?: (payout: any) => void;
};

export function RequestPayoutDialog({
  isOpen,
  availableBalance,
  onClose,
  onPayoutRequested,
}: RequestPayoutDialogProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"stripe" | "paypal" | "bank_transfer">("stripe");
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMaxClick = () => {
    setAmount(availableBalance.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    const validation = payoutRequestSchema.safeParse({
      amount: parsedAmount,
      method,
      destination,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Validation failed");
      return;
    }

    if (parsedAmount > availableBalance) {
      toast.error(`Amount exceeds available balance ($${availableBalance.toFixed(2)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/seller/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          method,
          destination,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payout request failed");
      }

      toast.success(data.message || "Payout request submitted!");
      if (onPayoutRequested) {
        onPayoutRequested(data.payout);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payout");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Request Funds Withdrawal</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Available to withdraw:{" "}
                <strong className="text-neon-green font-mono">
                  ${availableBalance.toFixed(2)}
                </strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-foreground">
                Withdrawal Amount (USD)
              </label>
              <button
                type="button"
                onClick={handleMaxClick}
                className="text-xs text-neon-purple hover:underline"
              >
                Withdraw Max
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="10"
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                className="pl-7"
                required
              />
            </div>
            <p className="text-[11px] text-muted-foreground">Minimum withdrawal: $10.00</p>
          </div>

          {/* Method */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Payout Method</label>
            <Select value={method} onValueChange={(v) => setMethod(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe Direct Connect</SelectItem>
                <SelectItem value="paypal">PayPal Balance</SelectItem>
                <SelectItem value="bank_transfer">Wire / Bank Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              {method === "paypal"
                ? "PayPal Email Address"
                : method === "stripe"
                ? "Stripe Account ID or Connected Email"
                : "Bank Account Details / IBAN"}
            </label>
            <Input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={
                method === "paypal"
                  ? "seller@example.com"
                  : method === "stripe"
                  ? "acct_1NZ4xxxxxx or email"
                  : "Routing # + Account #"
              }
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || availableBalance < 10}
            className="w-full bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Withdrawal...
              </>
            ) : (
              "Submit Payout Request"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
