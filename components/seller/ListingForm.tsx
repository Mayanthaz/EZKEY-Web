"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Sparkles, DollarSign, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadZone } from "@/components/seller/ImageUploadZone";
import { MOCK_CATEGORIES, PLATFORM_LABELS, SITE_CONFIG } from "@/lib/constants";
import {
  createListingSchema,
  ALLOWED_PLATFORMS,
  type CreateListingInput,
} from "@/lib/validations/seller";
import { toast } from "sonner";

type ListingFormProps = {
  initialData?: {
    id: string;
    title: string;
    description: string;
    short_description?: string;
    price: number;
    original_price?: number | null;
    category_slug: string;
    platform: string;
    delivery_type: "instant" | "manual" | "service";
    status?: "active" | "draft" | "paused";
    images: string[];
  };
  isEditing?: boolean;
};

export function ListingForm({ initialData, isEditing = false }: ListingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [shortDescription, setShortDescription] = useState(
    initialData?.short_description || ""
  );
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.original_price?.toString() || ""
  );
  const [categorySlug, setCategorySlug] = useState(
    initialData?.category_slug || "digital-keys"
  );
  const [platform, setPlatform] = useState(initialData?.platform || "steam");
  const [deliveryType, setDeliveryType] = useState<"instant" | "manual" | "service">(
    initialData?.delivery_type || "instant"
  );
  const [status, setStatus] = useState<"active" | "draft" | "paused">(
    initialData?.status || "active"
  );
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [initialKeys, setInitialKeys] = useState("");

  // Live calculations
  const parsedPrice = parseFloat(price) || 0;
  const platformFee = parsedPrice * 0.05;
  const sellerEarnings = Math.max(0, parsedPrice - platformFee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const keysArray =
      deliveryType === "instant" && !isEditing
        ? initialKeys
            .split("\n")
            .map((k) => k.trim())
            .filter((k) => k.length > 0)
        : undefined;

    const payload: Record<string, any> = {
      title,
      description,
      short_description: shortDescription || undefined,
      price: parsedPrice,
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      category_slug: categorySlug,
      platform,
      delivery_type: deliveryType,
      images,
    };

    if (keysArray && keysArray.length > 0) {
      payload.initial_keys = keysArray;
    }

    if (isEditing) {
      payload.status = status;
    }

    // Validation
    const validation = createListingSchema.safeParse(payload);
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message || "Validation failed";
      toast.error(firstError);
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEditing
        ? `/api/seller/listings/${initialData?.id}`
        : `/api/seller/listings`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save listing");
      }

      toast.success(
        isEditing
          ? "Listing updated successfully!"
          : "Listing created and published to marketplace!"
      );
      router.push("/dashboard/seller/listings");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/seller/listings"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Listings
        </Link>
        <h1 className="font-display text-2xl font-bold">
          {isEditing ? "Edit Product Listing" : "Create New Product Listing"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isEditing
            ? "Update pricing, description, delivery mode and media assets."
            : "Publish a new digital asset or activation key to the EZKEY marketplace."}
        </p>
      </div>

      {/* Basic Information */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-purple" />
          General Details
        </h2>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            Listing Title <span className="text-red-400">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Cyberpunk 2077 Ultimate Edition - Steam Key"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Category</label>
            <Select value={categorySlug} onValueChange={setCategorySlug}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLATFORM_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            Full Description <span className="text-red-400">*</span>
          </label>
          <Textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide comprehensive details about redemption steps, system requirements, or digital activation..."
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">
            Short Summary / Tagline{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="e.g. Global activation key with instant delivery"
          />
        </div>
      </div>

      {/* Pricing & Fee Breakdown */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-neon-green" />
          Pricing & Platform Fee
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Selling Price (USD) <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.99"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Original / Compare Price (USD){" "}
              <span className="text-muted-foreground font-normal">(optional strike-through)</span>
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="59.99"
            />
          </div>
        </div>

        {/* Live fee breakdown card */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-cyber-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Buyer Checkout Total:</span>
            <span className="font-semibold text-foreground">${parsedPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              EZKEY Escrow Platform Fee (5%):
              <Info className="w-3 h-3 text-muted-foreground opacity-60" />
            </span>
            <span className="font-mono text-muted-foreground">-${platformFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-cyber-border/40 pt-2 flex items-center justify-between text-sm font-semibold">
            <span className="text-neon-green">Your Net Earnings Per Sale:</span>
            <span className="font-display text-base text-neon-green">
              ${sellerEarnings.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Configuration */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="font-display text-sm font-semibold">Delivery Mode & Key Vault</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: "instant",
              title: "⚡ Instant Key Delivery",
              desc: "Auto-dispatches license keys from your vault upon buyer payment",
            },
            {
              id: "manual",
              title: "📦 Manual Fulfilment",
              desc: "You deliver custom credentials or assets after each order",
            },
            {
              id: "service",
              title: "🛠️ Digital Service",
              desc: "Account boosting or tailored on-demand delivery",
            },
          ].map((mode) => (
            <div
              key={mode.id}
              onClick={() => setDeliveryType(mode.id as any)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                deliveryType === mode.id
                  ? "border-neon-purple bg-neon-purple/10 text-foreground"
                  : "border-cyber-border hover:border-white/20 bg-white/[0.01]"
              }`}
            >
              <p className="text-sm font-bold">{mode.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{mode.desc}</p>
            </div>
          ))}
        </div>

        {deliveryType === "instant" && !isEditing && (
          <div className="space-y-2 p-4 rounded-xl bg-neon-purple/5 border border-neon-purple/20">
            <label className="text-xs font-semibold text-foreground">
              Initial License Keys (Optional - paste one per line):
            </label>
            <Textarea
              rows={4}
              value={initialKeys}
              onChange={(e) => setInitialKeys(e.target.value)}
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY-YYYYY"
              className="font-mono text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              You can also add or manage keys anytime using the Key Vault button on your listings page.
            </p>
          </div>
        )}

        {isEditing && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Listing Visibility</label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active (Visible in Marketplace)</SelectItem>
                <SelectItem value="paused">Paused (Temporarily Hidden)</SelectItem>
                <SelectItem value="draft">Draft (Unpublished)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Internal Image Upload System */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="font-display text-sm font-semibold">
          Product Media & Cover Photo <span className="text-red-400">*</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Uploaded directly to the internal server. The first image will be used as the marketplace cover thumbnail.
        </p>

        <ImageUploadZone images={images} onChange={setImages} maxImages={6} />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/seller/listings")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-neon-purple hover:bg-neon-purple/90 text-white font-semibold px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving to Internal Server...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Save Changes" : "Publish Listing"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
