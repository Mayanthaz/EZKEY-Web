"use client";

import { useState, useEffect } from "react";
import { User, Shield, CreditCard, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { sellerSettingsSchema } from "@/lib/validations/seller";

export default function SellerSettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [bio, setBio] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"stripe" | "paypal" | "bank_transfer">("stripe");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [bankAccountInfo, setBankAccountInfo] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seller/settings");
      const data = await res.json();
      if (res.ok && data.settings) {
        setBusinessName(data.settings.business_name || "");
        setBusinessEmail(data.settings.business_email || "");
        setBio(data.settings.bio || "");
        setPayoutMethod(data.settings.payout_method || "stripe");
        setPaypalEmail(data.settings.paypal_email || "");
        setBankAccountInfo(data.settings.bank_account_info || "");
      }
    } catch {
      toast.error("Failed to load seller settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      business_name: businessName,
      business_email: businessEmail,
      bio,
      payout_method: payoutMethod,
      paypal_email: paypalEmail || undefined,
      bank_account_info: bankAccountInfo || undefined,
    };

    const validation = sellerSettingsSchema.safeParse(payload);
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message || "Validation failed");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/seller/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      toast.success("Store profile and payout preferences saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
        <p className="text-xs">Loading store settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Seller Store Profile & Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your public seller branding, contact email, and payout withdrawal preferences.
        </p>
      </div>

      {/* Store Profile */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-neon-purple" />
          Store Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Business / Store Display Name <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Apex Digital Keys"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Business Support Email <span className="text-red-400">*</span>
            </label>
            <Input
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              placeholder="support@apexkeys.com"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Store Bio / Description</label>
          <Textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell buyers about your digital inventory, support hours, and warranty..."
          />
        </div>
      </div>

      {/* Payout Preferences */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-neon-green" />
          Payout Method & Bank Details
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Preferred Payout Channel</label>
          <Select value={payoutMethod} onValueChange={(v) => setPayoutMethod(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payout method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stripe">Stripe Direct Connect</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="bank_transfer">Direct Bank Wire</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {payoutMethod === "paypal" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">PayPal Email</label>
            <Input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="payouts@example.com"
            />
          </div>
        )}

        {payoutMethod === "bank_transfer" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Bank Information / IBAN</label>
            <Input
              type="text"
              value={bankAccountInfo}
              onChange={(e) => setBankAccountInfo(e.target.value)}
              placeholder="Account holder, IBAN / Routing #, SWIFT"
            />
          </div>
        )}
      </div>

      {/* Verification Status */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-neon-blue" />
          Seller Verification Status
        </h2>
        <div className="p-4 bg-neon-green/5 border border-neon-green/20 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-neon-green shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-foreground">Verified Merchant Account</p>
            <p className="text-muted-foreground mt-0.5">
              Your identity has been verified on EZKEY. Instant key delivery and marketplace listings are unlocked.
            </p>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSaving}
        className="bg-neon-purple text-white hover:bg-neon-purple/90 font-semibold px-8"
      >
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving Profile...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  );
}
