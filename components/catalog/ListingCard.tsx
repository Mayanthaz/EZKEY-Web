import Link from "next/link";
import { Clock3, Gamepad2, Star, Zap } from "lucide-react";
import { PLATFORM_LABELS } from "@/lib/constants";
import { cn, formatUsd } from "@/lib/utils";

type DeliveryVariant = "instant" | "manual" | "service" | string;

export type ListingCardListing = {
  id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  platform: string;
  category_slug?: string;
  category_name?: string;
  seller_name: string;
  seller_rating: number;
  stock_count?: number;
  sold_count: number;
  delivery_type: DeliveryVariant;
  tags: string[];
};

/**
 * Shared listing card.
 *
 * Two listing grids — homepage and marketplace — were copy-pasting the same
 * 60-line card markup. Having one component keeps the marketplace looking the
 * same everywhere, lets every card pick up hover/focus polish in one place,
 * and removes a class of bugs where one surface gets a fix and the other
 * doesn't.
 *
 * `variant` also adds the list layout so MarketplaceClient doesn't have to
 * carry a second ad-hoc card branch.
 */
export default function ListingCard({
  listing,
  variant = "grid",
  className,
  stockWarningThreshold = 5,
}: {
  listing: ListingCardListing;
  variant?: "grid" | "list";
  className?: string;
  stockWarningThreshold?: number;
}) {
  const discount =
    listing.original_price != null
      ? Math.round((1 - listing.price / listing.original_price) * 100)
      : null;

  const isInstant = listing.delivery_type === "instant";
  const lowStock =
    listing.stock_count != null && listing.stock_count <= stockWarningThreshold;

  const href = `/marketplace/${listing.slug}`;

  if (variant === "list") {
    return (
      <Link
        href={href}
        className={cn(
          "glass-card flex overflow-hidden group hover:border-neon-purple/30",
          className
        )}
      >
        <ListingThumb
          listing={listing}
          discount={discount}
          isInstant={isInstant}
          size="list"
        />
        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 text-xs flex-wrap">
              {listing.category_name && (
                <span className="font-medium text-neon-purple">
                  {listing.category_name}
                </span>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {PLATFORM_LABELS[listing.platform] || listing.platform}
              </span>
              <ListingChips listing={listing} />
            </div>
            <h3 className="font-semibold leading-tight line-clamp-2 group-hover:text-neon-purple transition-colors duration-200">
              {listing.title}
            </h3>
            <MetaRow listing={listing} className="mt-2" isInstant={isInstant} />
            {lowStock && (
              <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="w-3.5 h-3.5 shrink-0" />
                {listing.stock_count} left
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3 gap-4">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue inline-flex items-center justify-center text-[10px] font-bold text-white">
                {listing.seller_name[0]}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {listing.seller_name}
              </span>
            </div>
            <div className="flex items-baseline gap-2 shrink-0">
              <span className="font-display text-lg font-bold text-neon-green">
                {formatUsd(listing.price)}
              </span>
              {listing.original_price != null && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatUsd(listing.original_price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "glass-card overflow-hidden group flex flex-col transition-all duration-300 hover:-translate-y-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-purple/40",
        className
      )}
    >
      <ListingThumb
        listing={listing}
        discount={discount}
        isInstant={isInstant}
        size="grid"
      />
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-medium text-neon-purple mb-1 truncate">
          {listing.category_name}
        </p>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.75em] group-hover:text-neon-purple transition-colors duration-200">
          {listing.title}
        </h3>

        <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
          {listing.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-[11px] leading-none bg-white/[0.04] border border-white/10 rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue inline-flex items-center justify-center text-[10px] font-bold text-white shrink-0">
              {listing.seller_name[0]}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {listing.seller_name}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {listing.seller_rating.toFixed(1)}
          </span>
        </div>

        {lowStock && (
          <span className="flex items-center gap-1 text-[11px] text-neon-orange/90 mb-3">
            <Clock3 className="w-3 h-3" />
            Only {listing.stock_count} left
          </span>
        )}

        <div className="mt-auto">
          <div className="divider-glow mb-3" />
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="font-display text-lg font-bold text-neon-green">
                {formatUsd(listing.price)}
              </span>
              {listing.original_price != null && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatUsd(listing.original_price)}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {listing.sold_count.toLocaleString()} sold
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ListingChips({ listing }: { listing: ListingCardListing }) {
  if (!listing.tags.length) return null;
  return (
    <span className="flex flex-wrap gap-1">
      {listing.tags.slice(0, 2).map((tag) => (
        <span
          key={tag}
          className="px-1.5 py-0.5 text-[10px] leading-none rounded-full bg-white/[0.04] border border-white/10 text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </span>
  );
}

function MetaRow({
  listing,
  className,
  isInstant,
}: {
  listing: ListingCardListing;
  className?: string;
  isInstant: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 text-xs text-muted-foreground",
        className
      )}
    >
      <span className="inline-flex items-center gap-1">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        {listing.seller_rating.toFixed(1)}
      </span>
      <span>{listing.sold_count.toLocaleString()} sold</span>
      {isInstant && (
        <span className="inline-flex items-center gap-1 text-neon-blue">
          <Zap className="w-3 h-3" />
          Instant
        </span>
      )}
    </div>
  );
}

function ListingThumb({
  listing,
  discount,
  isInstant,
  size,
}: {
  listing: ListingCardListing;
  discount: number | null;
  isInstant: boolean;
  size: "grid" | "list";
}) {
  // One shared thumbnail chrome so both surfaces feel like the same marketplace.
  // Keeping it here (instead of a generic media wrapper) avoids pulling in a
  // bespoke image pipeline in this pass — a single text fallback is fine and
  // the gradient becomes a soft placeholder for thumbnails that arrive later.
  const height =
    size === "grid" ? "h-44" : "w-44 min-w-44 shrink-0";

  return (
    <div className={cn("relative bg-gradient-to-br from-cyber-card to-cyber-surface overflow-hidden flex items-center justify-center", height)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <Gamepad2 className="w-14 h-14 text-white/10 group-hover:text-neon-purple/20 transition-colors duration-500" />
      </div>
      {discount != null && (
        <span className="absolute top-2.5 left-2.5 px-2 py-1 bg-neon-green text-black text-[11px] font-bold rounded-md leading-none">
          -{discount}%
        </span>
      )}
      <span className="absolute top-2.5 right-2.5 px-2 py-1 bg-black/60 backdrop-blur-sm text-xs font-medium rounded-md border border-white/10 leading-none">
        {PLATFORM_LABELS[listing.platform] || listing.platform}
      </span>
      {size === "grid" && isInstant && (
        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-xs font-medium rounded-md leading-none">
          <Zap className="w-3 h-3" />
          Instant
        </span>
      )}
    </div>
  );
}
