"use client";

import { User, Mail, Bell, Save } from "lucide-react";

export default function BuyerSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-neon-purple" />
          Profile Information
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-white text-xl font-bold">
            U
          </div>
          <button className="px-4 py-2 border border-cyber-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
            Change Avatar
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <input type="text" placeholder="GamerTag123" className="input-neon" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Display Name</label>
            <input type="text" placeholder="Your display name" className="input-neon" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea placeholder="Tell others about yourself..." rows={3} className="input-neon resize-none" />
        </div>
      </div>

      {/* Email */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <Mail className="w-4 h-4 text-neon-blue" />
          Email & Security
        </h2>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <input type="email" placeholder="you@example.com" className="input-neon" disabled />
          <p className="text-xs text-muted-foreground">Email changes require re-verification</p>
        </div>
        <button className="text-sm text-neon-purple hover:text-neon-blue transition-colors">
          Change Password →
        </button>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <Bell className="w-4 h-4 text-neon-orange" />
          Notification Preferences
        </h2>
        {["Order updates", "Promotional offers", "New messages", "Security alerts"].map((item) => (
          <div key={item} className="flex items-center justify-between p-3 bg-cyber-surface/30 rounded-lg">
            <span className="text-sm">{item}</span>
            <button className="w-10 h-6 bg-neon-purple/30 rounded-full relative transition-all">
              <span className="absolute top-1 right-1 w-4 h-4 bg-neon-purple rounded-full transition-all" />
            </button>
          </div>
        ))}
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
