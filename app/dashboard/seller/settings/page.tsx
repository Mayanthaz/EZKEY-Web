"use client";

import { User, Mail, Shield, CreditCard, Save } from "lucide-react";

export default function SellerSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Seller Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your seller profile and payout details</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-neon-purple" />
          Store Profile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Name</label>
            <input type="text" placeholder="Your store name" className="input-neon" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Email</label>
            <input type="email" placeholder="store@example.com" className="input-neon" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea placeholder="Tell buyers about your store..." rows={3} className="input-neon resize-none" />
        </div>
      </div>

      {/* Payout */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-neon-green" />
          Payout Method
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {["Stripe", "PayPal", "Bank Transfer"].map((method) => (
            <button
              key={method}
              type="button"
              className="p-4 rounded-xl border border-cyber-border text-center text-sm font-medium
                       hover:border-neon-purple/30 hover:bg-neon-purple/5 transition-all"
            >
              {method}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">PayPal Email</label>
          <input type="email" placeholder="paypal@example.com" className="input-neon" />
        </div>
      </div>

      {/* ID Verification */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <Shield className="w-4 h-4 text-neon-blue" />
          ID Verification
        </h2>
        <div className="p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-xl">
          <div className="flex items-center gap-2 text-sm">
            <span className="badge-warning">Pending</span>
            <span className="text-muted-foreground">Upload your ID to become a verified seller</span>
          </div>
        </div>
        <div className="border-2 border-dashed border-cyber-border rounded-xl p-8 text-center hover:border-neon-blue/30 transition-all cursor-pointer">
          <Shield className="w-8 h-8 text-cyber-border mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Upload government-issued ID</p>
          <p className="text-xs text-muted-foreground mt-1">Your data is encrypted and secure</p>
        </div>
      </div>

      <button className="btn-neon !px-8 !py-3 flex items-center gap-2">
        <span className="relative z-10 flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </span>
      </button>
    </div>
  );
}
