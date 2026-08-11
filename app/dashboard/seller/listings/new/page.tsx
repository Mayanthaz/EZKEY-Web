"use client";

import { useState } from "react";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import Link from "next/link";
import { MOCK_CATEGORIES, PLATFORM_LABELS } from "@/lib/constants";

export default function NewListingPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [deliveryType, setDeliveryType] = useState("instant");
  const [gameKeys, setGameKeys] = useState<string[]>([""]);

  const addKeyField = () => setGameKeys([...gameKeys, ""]);
  const removeKeyField = (index: number) =>
    setGameKeys(gameKeys.filter((_, i) => i !== index));
  const updateKey = (index: number, value: string) => {
    const updated = [...gameKeys];
    updated[index] = value;
    setGameKeys(updated);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/seller/listings"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Listings
        </Link>
        <h1 className="font-display text-2xl font-bold">Create New Listing</h1>
        <p className="text-sm text-muted-foreground mt-1">
          List a new product on the marketplace
        </p>
      </div>

      <form className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="font-display text-sm font-semibold">Basic Information</h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Cyberpunk 2077 Ultimate Edition - Steam Key"
              className="input-neon"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product in detail..."
              rows={5}
              className="input-neon resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-neon appearance-none cursor-pointer"
              >
                <option value="">Select category</option>
                {MOCK_CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="input-neon appearance-none cursor-pointer"
              >
                <option value="">Select platform</option>
                {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="font-display text-sm font-semibold">Pricing</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                className="input-neon"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Original Price <span className="text-muted-foreground">(optional, for discount)</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="59.99"
                className="input-neon"
              />
            </div>
          </div>
        </div>

        {/* Delivery */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="font-display text-sm font-semibold">Delivery</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "instant", label: "⚡ Instant", desc: "Auto-deliver keys" },
              { value: "manual", label: "📦 Manual", desc: "You deliver" },
              { value: "service", label: "🛠️ Service", desc: "Custom service" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDeliveryType(opt.value)}
                className={`p-4 rounded-xl border text-center transition-all ${
                  deliveryType === opt.value
                    ? "border-neon-purple/50 bg-neon-purple/10"
                    : "border-cyber-border hover:border-cyber-border hover:bg-white/5"
                }`}
              >
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>

          {/* Digital Keys Input */}
          {deliveryType === "instant" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Digital Keys</label>
                <button
                  type="button"
                  onClick={addKeyField}
                  className="text-xs text-neon-purple hover:text-neon-blue transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Add Key
                </button>
              </div>
              {gameKeys.map((key, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => updateKey(i, e.target.value)}
                    placeholder="XXXXX-XXXXX-XXXXX"
                    className="input-neon flex-1 font-mono text-sm"
                  />
                  {gameKeys.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKeyField(i)}
                      className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Stock count: <span className="text-neon-green font-medium">{gameKeys.filter((k) => k.trim()).length}</span> keys
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="font-display text-sm font-semibold">Images</h2>
          <div className="border-2 border-dashed border-cyber-border rounded-xl p-10 text-center
                        hover:border-neon-purple/30 transition-all cursor-pointer">
            <Upload className="w-10 h-10 text-cyber-border mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Drop images here or <span className="text-neon-purple">browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WEBP up to 5MB each
            </p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" className="btn-neon flex-1 !py-3.5">
            <span className="relative z-10">Publish Listing</span>
          </button>
          <button
            type="button"
            className="px-6 py-3.5 border border-cyber-border rounded-lg text-sm text-muted-foreground
                     hover:text-foreground hover:bg-white/5 transition-all"
          >
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );
}
