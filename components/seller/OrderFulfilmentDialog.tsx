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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  PackageCheck,
  Truck,
  Shield,
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type OrderFulfilmentDialogProps = {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderFulfilled?: (updatedOrder: any) => void;
};

export function OrderFulfilmentDialog({
  order,
  isOpen,
  onClose,
  onOrderFulfilled,
}: OrderFulfilmentDialogProps) {
  const [keysInput, setKeysInput] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const isFulfilled =
    order.status === "delivered" || order.status === "completed";

  const handleDeliver = async () => {
    const keys = keysInput
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keys.length === 0) {
      toast.error("Please enter the license key(s) or redemption link to deliver.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/seller/orders/${order.id}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys,
          delivery_note: deliveryNote || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch order");
      }

      toast.success(data.message || `Order ${order.order_number} dispatched!`);
      if (onOrderFulfilled) {
        onOrderFulfilled(data.order);
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Fulfillment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Order Details & Fulfilment</DialogTitle>
              <DialogDescription className="font-mono text-xs text-neon-purple mt-0.5">
                {order.order_number}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Order Metadata */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-cyber-border space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Product Item:</span>
            <span className="font-semibold text-foreground truncate max-w-[220px]">
              {order.product_title}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Buyer Account:</span>
            <span className="font-medium text-foreground">{order.buyer_name}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Order Total:</span>
            <span className="font-bold text-neon-green">
              ${Number(order.total_price).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs border-t border-cyber-border/40 pt-2">
            <span className="text-muted-foreground">Your Net Payout (after 5% fee):</span>
            <span className="font-bold text-neon-green">
              ${Number(order.net_earnings || order.total_price * 0.95).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Escrow Status:</span>
            <span className="font-medium text-neon-blue capitalize">
              🔒 {order.escrow_status || "held"}
            </span>
          </div>
        </div>

        {/* Fulfilled View */}
        {isFulfilled ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-neon-green/5 border border-neon-green/20 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-foreground">Order has been dispatched</p>
                <p className="text-muted-foreground mt-0.5">
                  The buyer has received the keys. Escrow is currently held pending buyer confirmation.
                </p>
              </div>
            </div>

            {order.delivery_data?.keys && order.delivery_data.keys.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Delivered Keys:
                </label>
                <div className="mt-1 space-y-1.5 max-h-40 overflow-y-auto">
                  {order.delivery_data.keys.map((k: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-cyber-card border border-cyber-border font-mono text-xs"
                    >
                      <span>{k}</span>
                      <button
                        onClick={() => copyToClipboard(k)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Fulfilment Input Form */
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground">
                Enter License Key(s) / Access Details to Dispatch:
              </label>
              <Textarea
                rows={3}
                value={keysInput}
                onChange={(e) => setKeysInput(e.target.value)}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX&#10;(one key per line for multiple quantities)"
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">
                Redemption Instructions / Note (Optional):
              </label>
              <Textarea
                rows={2}
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                placeholder="e.g. Redeem on Steam > Games > Activate a Product on Steam"
                className="mt-1 text-xs"
              />
            </div>

            <Button
              onClick={handleDeliver}
              disabled={isSubmitting || !keysInput.trim()}
              className="w-full bg-neon-green text-black hover:bg-neon-green/90 font-bold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Dispatching Keys to Buyer...
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 mr-2" />
                  Dispatch & Fulfill Order
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
