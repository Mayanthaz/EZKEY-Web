import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Gamepad2, Zap, Star, BadgeCheck } from "lucide-react";
import { MOCK_LISTINGS, MOCK_CATEGORIES, PLATFORM_LABELS } from "@/lib/constants";

export function generateStaticParams() {
  return MOCK_CATEGORIES.map((category) => ({
    slug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: category.name,
    description: `Browse ${category.count.toLocaleString()} ${category.name.toLowerCase()} on EZKEY marketplace. ${category.description}`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug);
  const listings = MOCK_LISTINGS.filter((l) => l.category_slug === slug);

  if (!category) {
    return (
      <div className="pt-32 pb-20 bg-cyber-dark min-h-screen">
        <div className="section-container text-center">
          <h1 className="font-display text-2xl font-bold mb-3">Category Not Found</h1>
          <Link href="/categories" className="btn-neon text-sm">
            <span className="relative z-10">View All Categories</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 bg-cyber-dark min-h-screen">
      <div className="section-container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/marketplace" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Marketplace
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/categories" className="hover:text-foreground transition-colors">
            Categories
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="glass-card p-8 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{category.icon}</span>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground mt-1">{category.description}</p>
              <p className="text-sm text-neon-purple mt-2 font-medium">
                {category.count.toLocaleString()} listings available
              </p>
            </div>
          </div>
        </div>

        {/* Listings */}
        {listings.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Gamepad2 className="w-16 h-16 text-cyber-border mx-auto mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No listings yet</h3>
            <p className="text-sm text-muted-foreground">
              Check back soon for new listings in this category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/marketplace/${listing.slug}`}
                className="glass-card overflow-hidden group transition-all duration-500 hover:-translate-y-1"
              >
                <div className="relative h-44 bg-gradient-to-br from-cyber-card to-cyber-surface flex items-center justify-center">
                  <Gamepad2 className="w-16 h-16 text-cyber-border/50 group-hover:text-neon-purple/30 transition-colors duration-500" />
                  {listing.original_price && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-neon-green/90 text-black text-xs font-bold rounded-md">
                      -{Math.round((1 - listing.price / listing.original_price) * 100)}%
                    </div>
                  )}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-xs font-medium rounded-md border border-white/10">
                    {PLATFORM_LABELS[listing.platform] || listing.platform}
                  </div>
                  {listing.delivery_type === "instant" && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-xs font-medium rounded-md">
                      <Zap className="w-3 h-3" />
                      Instant
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-3 line-clamp-2 group-hover:text-neon-purple transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-[8px] font-bold text-white">
                        {listing.seller_name[0]}
                      </div>
                      <span className="text-xs text-muted-foreground">{listing.seller_name}</span>
                      <BadgeCheck className="w-3 h-3 text-neon-blue" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-muted-foreground">{listing.seller_rating}</span>
                    </div>
                  </div>
                  <div className="divider-glow mb-3" />
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="font-display text-lg font-bold text-neon-green">
                        ${listing.price.toFixed(2)}
                      </span>
                      {listing.original_price && (
                        <span className="ml-2 text-xs text-muted-foreground line-through">
                          ${listing.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {listing.sold_count.toLocaleString()} sold
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
