"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Plus, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type KeyVaultModalProps = {
  listingId: string | null;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated?: (newStock: number) => void;
};

type VaultKey = {
  id: string;
  masked_code: string;
  status: "available" | "reserved" | "sold";
  created_at: string;
};

export function KeyVaultModal({
  listingId,
  listingTitle,
  isOpen,
  onClose,
  onStockUpdated,
}: KeyVaultModalProps) {
  const [activeTab, setActiveTab] = useState<"view" | "add">("view");
  const [keys, setKeys] = useState<VaultKey[]>([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && listingId) {
      loadKeys();
    } else {
      setBulkInput("");
      setActiveTab("view");
    }
  }, [isOpen, listingId]);

  const loadKeys = async () => {
    if (!listingId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/seller/listings/${listingId}/keys`);
      const data = await res.json();
      if (res.ok) {
        setKeys(data.keys || []);
        setAvailableCount(data.available || 0);
        setSoldCount(data.sold || 0);
      } else {
        toast.error(data.error || "Failed to load keys");
      }
    } catch {
      toast.error("Failed to connect to Key Vault API");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeys = async () => {
    if (!listingId) return;
    const keyLines = bulkInput
      .split("\n")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keyLines.length === 0) {
      toast.error("Please enter at least one license key (one per line).");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/seller/listings/${listingId}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: keyLines }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add keys");
      }

      toast.success(data.message || `Added ${keyLines.length} key(s) to vault`);
      setBulkInput("");
      setActiveTab("view");
      await loadKeys();
      if (onStockUpdated && typeof data.newStock === "number") {
        onStockUpdated(data.newStock);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add keys");
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedKeyCount = bulkInput
    .split("\n")
    .map((k) => k.trim())
    .filter((k) => k.length > 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">Key Vault & Inventory</DialogTitle>
              <DialogDescription className="text-xs truncate max-w-sm mt-0.5">
                {listingTitle}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Inventory Summary Chips */}
        <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-white/[0.02] border border-cyber-border text-center">
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Available
            </p>
            <p className="text-lg font-bold text-neon-green mt-0.5 font-display">
              {availableCount}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Sold
            </p>
            <p className="text-lg font-bold text-neon-blue mt-0.5 font-display">
              {soldCount}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Total Keys
            </p>
            <p className="text-lg font-bold text-foreground mt-0.5 font-display">
              {keys.length}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 bg-cyber-card border border-cyber-border">
            <TabsTrigger value="view">Vault Keys ({keys.length})</TabsTrigger>
            <TabsTrigger value="add">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Keys Bulk
            </TabsTrigger>
          </TabsList>

          {/* View Tab */}
          <TabsContent value="view" className="space-y-3 mt-3">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-neon-purple" />
                <span className="text-xs">Loading vault inventory...</span>
              </div>
            ) : keys.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-cyber-border rounded-xl">
                <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No keys loaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Switch to &apos;Add Keys Bulk&apos; to paste your digital keys.
                </p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {keys.map((k) => (
                  <div
                    key={k.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-cyber-border/40 bg-white/[0.01]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-foreground font-semibold">
                        {k.masked_code}
                      </span>
                    </div>
                    <Badge
                      variant={
                        k.status === "available"
                          ? "default"
                          : k.status === "sold"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] capitalize"
                    >
                      {k.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Add Keys Tab */}
          <TabsContent value="add" className="space-y-3 mt-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Paste digital license keys (one key per line):
              </label>
              <Textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="XXXXX-XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY-YYYYY&#10;ZZZZZ-ZZZZZ-ZZZZZ-ZZZZZ"
                className="mt-1 font-mono text-xs"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  Detected keys to add:{" "}
                  <strong className="text-neon-purple">{parsedKeyCount}</strong>
                </span>
                <span>Automatic stock increment</span>
              </div>
            </div>

            <Button
              onClick={handleAddKeys}
              disabled={isSubmitting || parsedKeyCount === 0}
              className="w-full bg-neon-purple hover:bg-neon-purple/90 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Storing Keys into Vault...
                </>
              ) : (
                `Add ${parsedKeyCount} Key(s) to Vault`
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
