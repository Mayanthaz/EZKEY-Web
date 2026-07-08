import type { Metadata } from "next";
import Link from "next/link";
import {
  Gamepad2,
  Zap,
  Star,
  BadgeCheck,
  Shield,
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Clock,
  Package,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { MOCK_LISTINGS, PLATFORM_LABELS } from "@/lib/constants";

// Generate metadata dynamically for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = MOCK_LISTINGS.find((l) => l.slug === slug);

  if (!listing) {
    return { title: "Listing Not Found" };
  }

  return {
    title: listing.title,
    description: `Buy ${listing.title} for $${listing.price.toFixed(2)} on EZKEY. ${listing.category_name} from verified seller ${listing.seller_name}. Secure escrow & instant delivery.`,
    openGraph: {
      title: `${listing.title} — $${listing.price.toFixed(2)}`,
      description: `Buy ${listing.title} securely on EZKEY marketplace. ${listing.delivery_type === "instant" ? "Instant delivery!" : "Fast delivery!"} Buyer protection included.`,
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = MOCK_LISTINGS.find((l) => l.slug === slug);

  if (!listing) {
    return (
      <div className="pt-32 pb-20 bg-cyber-dark min-h-screen">
        <div className="section-container text-center">
          <Gamepad2 className="w-20 h-20 text-cyber-border mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold mb-3">
            Listing Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The listing you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/marketplace" className="btn-neon text-sm">
            <span className="relative z-10">Back to Marketplace</span>
          </Link>
        </div>
      </div>
    );
  }

  const relatedListings = MOCK_LISTINGS.filter(
    (l) => l.category_slug === listing.category_slug && l.id !== listing.id
  ).slice(0, 4);

  const discountPercent = listing.original_price
    ? Math.round((1 - listing.price / listing.original_price) * 100)
    : 0;

  return (
    <div className="pt-24 pb-20 bg-cyber-dark min-h-screen">
      <div className="section-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link
            href="/marketplace"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Marketplace
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link
            href={`/categories/${listing.category_slug}`}
            className="hover:text-foreground transition-colors"
          >
            {listing.category_name}
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[200px]">
            {listing.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="glass-card overflow-hidden">
              <div className="relative h-64 sm:h-80 md:h-96 bg-gradient-to-br from-cyber-card to-cyber-surface flex items-center justify-center">
                <Gamepad2 className="w-24 h-24 text-cyber-border/40" />
                {discountPercent > 0 && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-neon-green/90 text-black text-sm font-bold rounded-lg">
                    -{discountPercent}% OFF
                  </div>
                )}
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm text-sm font-medium rounded-lg border border-white/10">
                  {PLATFORM_LABELS[listing.platform] || listing.platform}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="glass-card p-6">
              <h2 className="font-display text-lg font-bold mb-4">Description</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  Get your copy of <strong>{listing.title}</strong> at the best price on EZKEY.
                  This is a digital product that will be delivered{" "}
                  {listing.delivery_type === "instant"
                    ? "instantly after payment"
                    : "within 24 hours"}.
                  All purchases are protected by our secure escrow system.
                </p>
                <h3 className="font-display text-sm font-semibold mt-6 mb-3 text-foreground">
                  What You Get
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-green mt-0.5 shrink-0" />
                    Official activation key for{" "}
                    {PLATFORM_LABELS[listing.platform] || listing.platform}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-green mt-0.5 shrink-0" />
                    Secure escrow payment protection
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-green mt-0.5 shrink-0" />
                    {listing.delivery_type === "instant"
                      ? "Instant automated delivery"
                      : "Fast manual delivery (usually within 1 hour)"}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-neon-green mt-0.5 shrink-0" />
                    24/7 buyer support
                  </li>
                </ul>
              </div>
            </div>

            {/* Reviews */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-bold">Customer Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(listing.seller_rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-cyber-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {listing.seller_rating} ({listing.sold_count} reviews)
                  </span>
                </div>
              </div>

              {/* Sample reviews */}
              <div className="space-y-4">
                {[
                  {
                    name: "Alex G.",
                    rating: 5,
                    date: "2 days ago",
                    comment: "Got my key instantly! Works perfectly. Great seller!",
                  },
                  {
                    name: "Sarah M.",
                    rating: 5,
                    date: "1 week ago",
                    comment:
                      "Best price I could find anywhere. Delivery was instant and key activated without issues.",
                  },
                  {
                    name: "Jordan K.",
                    rating: 4,
                    date: "2 weeks ago",
                    comment:
                      "Good deal, key worked fine. Would buy again from this seller.",
                  },
                ].map((review, i) => (
                  <div
                    key={i}
                    className="p-4 bg-cyber-surface/50 border border-cyber-border/50 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple/60 to-neon-blue/60 flex items-center justify-center text-xs font-bold text-white">
                          {review.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {review.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-cyber-border"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar — Purchase Card */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-24 space-y-6">
              {/* Category */}
              <div className="flex items-center gap-2">
                <span className="badge-purple">{listing.category_name}</span>
                {listing.delivery_type === "instant" && (
                  <span className="badge-info flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Instant Delivery
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display text-xl font-bold leading-tight">
                {listing.title}
              </h1>

              {/* Seller */}
              <div className="flex items-center gap-3 p-3 bg-cyber-surface/50 border border-cyber-border/50 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-white font-bold">
                  {listing.seller_name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold">
                      {listing.seller_name}
                    </span>
                    <BadgeCheck className="w-4 h-4 text-neon-blue" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-muted-foreground">
                        {listing.seller_rating}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      • {listing.sold_count.toLocaleString()} sales
                    </span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-end gap-3">
                  <span className="font-display text-3xl font-black text-neon-green">
                    ${listing.price.toFixed(2)}
                  </span>
                  {listing.original_price && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg text-muted-foreground line-through">
                        ${listing.original_price.toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 bg-neon-green/10 text-neon-green text-xs font-bold rounded">
                        Save ${(listing.original_price - listing.price).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  <span
                    className={`font-medium ${
                      listing.stock_count > 10
                        ? "text-neon-green"
                        : listing.stock_count > 0
                        ? "text-neon-orange"
                        : "text-red-400"
                    }`}
                  >
                    {listing.stock_count > 0
                      ? `${listing.stock_count} in stock`
                      : "Out of stock"}
                  </span>
                </span>
              </div>

              {/* Buy Button */}
              <button
                className="btn-neon w-full text-base !py-4 group"
                disabled={listing.stock_count <= 0}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </span>
              </button>

              {/* Secondary actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-cyber-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-neon-purple/30 transition-all">
                  <Heart className="w-4 h-4" />
                  Wishlist
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-cyber-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-neon-blue/30 transition-all">
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                <button className="py-3 px-4 border border-cyber-border rounded-lg text-muted-foreground hover:text-foreground hover:border-neon-green/30 transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Trust indicators */}
              <div className="space-y-3 pt-4 border-t border-cyber-border">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-neon-green shrink-0" />
                  <span>Escrow protected — funds released only after delivery</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4 text-neon-blue shrink-0" />
                  <span>
                    {listing.delivery_type === "instant"
                      ? "Instant delivery after payment"
                      : "Delivery within 24 hours"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <AlertTriangle className="w-4 h-4 text-neon-orange shrink-0" />
                  <span>Report issues within 48 hours for full refund</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs bg-cyber-surface border border-cyber-border rounded-lg text-muted-foreground hover:text-neon-purple hover:border-neon-purple/30 transition-all cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Listings */}
        {relatedListings.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl font-bold mb-6">
              Similar <span className="text-gradient">Listings</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedListings.map((item) => (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.slug}`}
                  className="glass-card overflow-hidden group transition-all duration-500 hover:-translate-y-1"
                >
                  <div className="relative h-36 bg-gradient-to-br from-cyber-card to-cyber-surface flex items-center justify-center">
                    <Gamepad2 className="w-12 h-12 text-cyber-border/50 group-hover:text-neon-purple/30 transition-colors" />
                    {item.original_price && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-neon-green/90 text-black text-[10px] font-bold rounded">
                        -{Math.round((1 - item.price / item.original_price) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold mb-2 line-clamp-1 group-hover:text-neon-purple transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-base font-bold text-neon-green">
                        ${item.price.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {item.sold_count.toLocaleString()} sold
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
