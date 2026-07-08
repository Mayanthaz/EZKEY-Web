"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  Gamepad2,
  Zap,
  Star,
  BadgeCheck,
  ChevronDown,
  Grid3X3,
  LayoutList,
  ArrowUpDown,
} from "lucide-react";
import {
  MOCK_LISTINGS,
  MOCK_CATEGORIES,
  PLATFORM_LABELS,
} from "@/lib/constants";

type SortOption = "popular" | "price_asc" | "price_desc" | "newest";
type ViewMode = "grid" | "list";

export default function MarketplaceClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredListings = useMemo(() => {
    let results = [...MOCK_LISTINGS];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory) {
      results = results.filter((l) => l.category_slug === selectedCategory);
    }

    if (selectedPlatform) {
      results = results.filter((l) => l.platform === selectedPlatform);
    }

    results = results.filter(
      (l) => l.price >= priceRange[0] && l.price <= priceRange[1]
    );

    switch (sortBy) {
      case "price_asc":
        results.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        results.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        results.sort((a, b) => b.sold_count - a.sold_count);
        break;
      case "newest":
        results.sort((a, b) => b.id.localeCompare(a.id));
        break;
    }

    return results;
  }, [searchQuery, selectedCategory, selectedPlatform, priceRange, sortBy]);

  const platforms = Array.from(new Set(MOCK_LISTINGS.map((l) => l.platform)));

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedPlatform(null);
    setPriceRange([0, 2000]);
    setSortBy("popular");
  };

  const hasActiveFilters =
    searchQuery || selectedCategory || selectedPlatform || priceRange[0] > 0 || priceRange[1] < 2000;

  return (
    <div className="pt-24 pb-16 bg-cyber-dark min-h-screen">
      <div className="section-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
            <span className="text-gradient">Marketplace</span>
          </h1>
          <p className="text-muted-foreground">
            Discover the best deals on game keys, in-game items, and more
          </p>
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-neon !pl-11"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg text-sm font-medium transition-all
                ${showFilters
                  ? "border-neon-purple/50 bg-neon-purple/10 text-neon-purple"
                  : "border-cyber-border bg-cyber-card text-muted-foreground hover:text-foreground hover:border-cyber-border"
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-neon-purple rounded-full" />
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none px-4 py-3 pr-10 bg-cyber-card border border-cyber-border rounded-lg
                         text-sm text-muted-foreground focus:outline-none focus:border-neon-purple/50 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="newest">Newest First</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="hidden sm:flex border border-cyber-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-all ${
                  viewMode === "grid"
                    ? "bg-neon-purple/10 text-neon-purple"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-all ${
                  viewMode === "list"
                    ? "bg-neon-purple/10 text-neon-purple"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="hidden lg:block w-64 shrink-0">
              <div className="glass-card p-5 sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-neon-purple hover:text-neon-blue transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Category
                  </h4>
                  <div className="space-y-1.5">
                    {MOCK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === cat.slug ? null : cat.slug
                          )
                        }
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedCategory === cat.slug
                            ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Platform
                  </h4>
                  <div className="space-y-1.5">
                    {platforms.map((platform) => (
                      <button
                        key={platform}
                        onClick={() =>
                          setSelectedPlatform(
                            selectedPlatform === platform ? null : platform
                          )
                        }
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedPlatform === platform
                            ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {PLATFORM_LABELS[platform] || platform}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Price Range
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-sm
                               focus:outline-none focus:border-neon-purple/50"
                      placeholder="Min"
                    />
                    <span className="text-muted-foreground text-xs">—</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="w-full px-3 py-2 bg-cyber-dark border border-cyber-border rounded-lg text-sm
                               focus:outline-none focus:border-neon-purple/50"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            {/* Results info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">
                  {filteredListings.length}
                </span>{" "}
                {filteredListings.length === 1 ? "result" : "results"} found
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="lg:hidden text-xs text-neon-purple hover:text-neon-blue transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </button>
              )}
            </div>

            {filteredListings.length === 0 ? (
              <div className="glass-card p-16 text-center">
                <Gamepad2 className="w-16 h-16 text-cyber-border mx-auto mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">
                  No listings found
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-ghost-neon text-sm !px-6 !py-2.5"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                    : "space-y-4"
                }
              >
                {filteredListings.map((listing) =>
                  viewMode === "grid" ? (
                    <Link
                      key={listing.id}
                      href={`/marketplace/${listing.slug}`}
                      className="glass-card overflow-hidden group transition-all duration-500 hover:-translate-y-1"
                    >
                      {/* Thumbnail */}
                      <div className="relative h-44 bg-gradient-to-br from-cyber-card to-cyber-surface overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Gamepad2 className="w-16 h-16 text-cyber-border/50 group-hover:text-neon-purple/30 transition-colors duration-500" />
                        </div>
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
                        <p className="text-xs text-neon-purple font-medium mb-1">
                          {listing.category_name}
                        </p>
                        <h3 className="text-sm font-semibold mb-3 line-clamp-2 group-hover:text-neon-purple transition-colors">
                          {listing.title}
                        </h3>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {listing.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-[10px] bg-cyber-surface border border-cyber-border rounded-md text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-[8px] font-bold text-white">
                              {listing.seller_name[0]}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {listing.seller_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-muted-foreground">
                              {listing.seller_rating}
                            </span>
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
                  ) : (
                    /* List View */
                    <Link
                      key={listing.id}
                      href={`/marketplace/${listing.slug}`}
                      className="glass-card flex overflow-hidden group transition-all duration-300 hover:border-neon-purple/30"
                    >
                      <div className="relative w-48 h-36 bg-gradient-to-br from-cyber-card to-cyber-surface shrink-0 flex items-center justify-center">
                        <Gamepad2 className="w-12 h-12 text-cyber-border/50" />
                        {listing.original_price && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-neon-green/90 text-black text-[10px] font-bold rounded">
                            -{Math.round((1 - listing.price / listing.original_price) * 100)}%
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-neon-purple font-medium">
                              {listing.category_name}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {PLATFORM_LABELS[listing.platform]}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-1 group-hover:text-neon-purple transition-colors">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {listing.seller_rating}
                            </span>
                            <span>{listing.sold_count.toLocaleString()} sold</span>
                            {listing.delivery_type === "instant" && (
                              <span className="flex items-center gap-1 text-neon-blue">
                                <Zap className="w-3 h-3" />
                                Instant
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-[8px] font-bold text-white">
                              {listing.seller_name[0]}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {listing.seller_name}
                            </span>
                            <BadgeCheck className="w-3 h-3 text-neon-blue" />
                          </div>
                          <div>
                            <span className="font-display text-xl font-bold text-neon-green">
                              ${listing.price.toFixed(2)}
                            </span>
                            {listing.original_price && (
                              <span className="ml-2 text-xs text-muted-foreground line-through">
                                ${listing.original_price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
