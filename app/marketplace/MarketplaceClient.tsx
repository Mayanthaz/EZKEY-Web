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
  Grid3X3,
  LayoutList,
} from "lucide-react";
import {
  MOCK_LISTINGS,
  MOCK_CATEGORIES,
  PLATFORM_LABELS,
} from "@/lib/constants";
import { ProductThumbnail } from "@/components/marketplace/ProductThumbnail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
            Discover the best deals on digital apps, vouchers, keys, accounts, and more
          </p>
        </div>

        {/* Search & Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-white/[0.03] border-white/10 focus:border-neon-purple/60 focus-visible:ring-neon-purple/20 text-foreground placeholder:text-muted-foreground/50 h-11"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "gap-2 border h-11",
                showFilters
                  ? "border-neon-purple/50 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/15 hover:text-neon-purple"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-neon-purple rounded-full" />
              )}
            </Button>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[160px] h-11 bg-white/[0.03] border-white/10 text-muted-foreground focus:ring-neon-purple/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cyber-card border-white/[0.08]">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price_asc">Price: Low → High</SelectItem>
                <SelectItem value="price_desc">Price: High → Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="hidden sm:flex border border-white/10 rounded-lg overflow-hidden bg-white/[0.03]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "rounded-none h-11 w-11",
                  viewMode === "grid"
                    ? "bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/15 hover:text-neon-purple"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={cn(
                  "rounded-none h-11 w-11",
                  viewMode === "list"
                    ? "bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/15 hover:text-neon-purple"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-neon-purple hover:text-neon-blue h-auto px-2 py-1"
                    >
                      Clear All
                    </Button>
                  )}
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Categories */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Category
                  </h4>
                  <div className="space-y-1">
                    {MOCK_CATEGORIES.map((cat) => (
                      <Button
                        key={cat.slug}
                        variant="ghost"
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === cat.slug ? null : cat.slug
                          )
                        }
                        className={cn(
                          "w-full justify-start gap-2 h-9 text-sm",
                          selectedCategory === cat.slug
                            ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20 hover:bg-neon-purple/15 hover:text-neon-purple"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Platform */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Platform
                  </h4>
                  <div className="space-y-1">
                    {platforms.map((platform) => (
                      <Button
                        key={platform}
                        variant="ghost"
                        onClick={() =>
                          setSelectedPlatform(
                            selectedPlatform === platform ? null : platform
                          )
                        }
                        className={cn(
                          "w-full justify-start h-9 text-sm",
                          selectedPlatform === platform
                            ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20 hover:bg-neon-blue/15 hover:text-neon-blue"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        {PLATFORM_LABELS[platform] || platform}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-white/[0.06]" />

                {/* Price Range */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Price Range
                  </h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="bg-white/[0.03] border-white/10 focus:border-neon-purple/60 focus-visible:ring-neon-purple/20 text-foreground text-sm h-9"
                      placeholder="Min"
                    />
                    <span className="text-muted-foreground text-xs shrink-0">—</span>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="bg-white/[0.03] border-white/10 focus:border-neon-purple/60 focus-visible:ring-neon-purple/20 text-foreground text-sm h-9"
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="lg:hidden text-xs text-neon-purple hover:text-neon-blue gap-1 h-auto px-2 py-1"
                >
                  <X className="w-3 h-3" />
                  Clear filters
                </Button>
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
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="btn-ghost-neon border-white/10"
                >
                  Clear All Filters
                </Button>
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
                        <ProductThumbnail
                          src={listing.thumbnail_url}
                          alt={listing.title}
                          className="group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 via-transparent to-transparent pointer-events-none" />
                        {listing.original_price && (
                          <Badge className="absolute top-3 left-3 bg-neon-green/90 text-black text-xs font-bold hover:bg-neon-green/90">
                            -{Math.round((1 - listing.price / listing.original_price) * 100)}%
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-xs border-white/10 text-foreground"
                        >
                          {PLATFORM_LABELS[listing.platform] || listing.platform}
                        </Badge>
                        {listing.delivery_type === "instant" && (
                          <Badge
                            variant="outline"
                            className="absolute bottom-3 left-3 bg-neon-blue/20 border-neon-blue/30 text-neon-blue text-xs gap-1"
                          >
                            <Zap className="w-3 h-3" />
                            Instant
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <p className="text-xs text-neon-purple font-medium mb-1">
                          {listing.category_name}
                        </p>
                        <h3 className="text-sm font-semibold mb-3 line-clamp-2 group-hover:text-neon-purple transition-colors">
                          {listing.title}
                        </h3>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {listing.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="px-2 py-0.5 text-[10px] bg-cyber-surface border-cyber-border text-muted-foreground"
                            >
                              {tag}
                            </Badge>
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
                            <BadgeCheck className="w-3 h-3 text-neon-blue" />
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-xs text-muted-foreground">
                              {listing.seller_rating}
                            </span>
                          </div>
                        </div>

                        <Separator className="mb-3 bg-white/[0.06]" />

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
                      </CardContent>
                    </Link>
                  ) : (
                    /* List View */
                    <Link
                      key={listing.id}
                      href={`/marketplace/${listing.slug}`}
                      className="glass-card flex overflow-hidden group transition-all duration-300 hover:border-neon-purple/30"
                    >
                      <div className="relative w-48 h-36 bg-gradient-to-br from-cyber-card to-cyber-surface shrink-0 overflow-hidden flex items-center justify-center">
                        <ProductThumbnail
                          src={listing.thumbnail_url}
                          alt={listing.title}
                          className="group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-cyber-dark/80 via-transparent to-transparent pointer-events-none" />
                        {listing.original_price && (
                          <Badge className="absolute top-2 left-2 bg-neon-green/90 text-black text-[10px] font-bold hover:bg-neon-green/90">
                            -{Math.round((1 - listing.price / listing.original_price) * 100)}%
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-neon-purple font-medium">
                              {listing.category_name}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-white/10 bg-transparent text-muted-foreground py-0"
                            >
                              {PLATFORM_LABELS[listing.platform]}
                            </Badge>
                          </div>
                          <h3 className="font-semibold mb-2 group-hover:text-neon-purple transition-colors">
                            {listing.title}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              {listing.seller_rating}
                            </span>
                            <span>{listing.sold_count.toLocaleString()} sold</span>
                            {listing.delivery_type === "instant" && (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-neon-blue/30 bg-neon-blue/10 text-neon-blue gap-1 py-0"
                              >
                                <Zap className="w-2.5 h-2.5" />
                                Instant
                              </Badge>
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
