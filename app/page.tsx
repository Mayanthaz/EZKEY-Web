import Link from "next/link";
import {
  Gamepad2,
  Zap,
  Shield,
  Star,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Clock,
  Users,
  ShoppingBag,
  BadgeCheck,
} from "lucide-react";
import {
  MOCK_LISTINGS,
  MOCK_CATEGORIES,
  PLATFORM_LABELS,
} from "@/lib/constants";

export default function HomePage() {
  const featuredListings = MOCK_LISTINGS.filter((l) => l.featured);

  return (
    <div className="relative">
      {/* ============================================================
          HERO SECTION
          ============================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-cyber-dark">
          {/* Grid */}
          <div className="absolute inset-0 bg-grid opacity-50" />
          {/* Gradient orbs */}
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[150px] animate-float" />
          <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-neon-blue/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-pink/5 rounded-full blur-[200px]" />
          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyber-dark/50 via-transparent to-cyber-dark" />
        </div>

        <div className="section-container relative z-10 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neon-purple/10 border border-neon-purple/20
                          rounded-full text-sm text-neon-purple mb-8 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trusted by 50,000+ gamers worldwide</span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black
                         leading-tight tracking-tight mb-6 animate-slide-up">
              <span className="text-foreground">Your Premium</span>
              <br />
              <span className="text-gradient">Gaming Marketplace</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10
                        leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Buy and sell game keys, in-game items, gift cards, and digital assets
              with <span className="text-neon-green font-medium">secure escrow protection</span> and{" "}
              <span className="text-neon-blue font-medium">instant delivery</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16
                          animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Link href="/marketplace" className="btn-neon text-base !px-8 !py-4 group">
                <span className="relative z-10 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Browse Marketplace
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="/auth/sign-up" className="btn-ghost-neon text-base !px-8 !py-4 group">
                Start Selling
                <ChevronRight className="w-4 h-4 inline ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto
                          animate-fade-in" style={{ animationDelay: "0.4s" }}>
              {[
                { value: "50K+", label: "Active Users", icon: Users },
                { value: "120K+", label: "Listings", icon: ShoppingBag },
                { value: "99.9%", label: "Uptime", icon: Zap },
                { value: "4.9★", label: "Rating", icon: Star },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    <stat.icon className="w-4 h-4 text-neon-purple opacity-60" />
                    <span className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyber-dark to-transparent" />
      </section>

      {/* ============================================================
          CATEGORIES SECTION
          ============================================================ */}
      <section className="relative py-20 bg-cyber-dark">
        <div className="section-container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
                Browse <span className="text-gradient">Categories</span>
              </h2>
              <p className="text-muted-foreground">
                Find exactly what you&apos;re looking for
              </p>
            </div>
            <Link
              href="/categories"
              className="hidden sm:flex items-center gap-1 text-sm text-neon-purple hover:text-neon-blue
                       transition-colors group"
            >
              View All
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {MOCK_CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="glass-card p-5 text-center group transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-4xl mb-3 transition-transform duration-500 group-hover:scale-110">
                  {cat.icon}
                </div>
                <h3 className="text-sm font-semibold mb-1 group-hover:text-neon-purple transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {cat.count.toLocaleString()} items
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          FEATURED LISTINGS SECTION
          ============================================================ */}
      <section className="relative py-20 bg-cyber-darker">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-neon-purple/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-neon-orange" />
                <span className="text-sm text-neon-orange font-medium">Hot Right Now</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                Featured <span className="text-gradient">Deals</span>
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="hidden sm:flex items-center gap-1 text-sm text-neon-purple hover:text-neon-blue
                       transition-colors group"
            >
              See All Deals
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredListings.map((listing) => (
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
                  {/* Discount badge */}
                  {listing.original_price && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-neon-green/90 text-black text-xs font-bold rounded-md">
                      -{Math.round((1 - listing.price / listing.original_price) * 100)}%
                    </div>
                  )}
                  {/* Platform badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-xs font-medium rounded-md border border-white/10">
                    {PLATFORM_LABELS[listing.platform] || listing.platform}
                  </div>
                  {/* Delivery type */}
                  {listing.delivery_type === "instant" && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-xs font-medium rounded-md">
                      <Zap className="w-3 h-3" />
                      Instant
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs text-neon-purple font-medium mb-1">
                    {listing.category_name}
                  </p>
                  <h3 className="text-sm font-semibold mb-3 line-clamp-2 group-hover:text-neon-purple transition-colors">
                    {listing.title}
                  </h3>

                  {/* Tags */}
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

                  {/* Seller */}
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

                  {/* Divider */}
                  <div className="divider-glow mb-3" />

                  {/* Price & Sales */}
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

          {/* Mobile CTA */}
          <div className="sm:hidden mt-8 text-center">
            <Link
              href="/marketplace"
              className="btn-neon inline-flex items-center gap-2 text-sm"
            >
              <span className="relative z-10 flex items-center gap-2">
                View All Deals
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS SECTION
          ============================================================ */}
      <section className="relative py-20 bg-cyber-dark">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
              How <span className="text-gradient">EZKEY</span> Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three simple steps to buy or sell digital gaming goods securely
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                icon: ShoppingBag,
                title: "Browse & Buy",
                description:
                  "Explore thousands of game keys, items, and gift cards from verified sellers. Find the best deals instantly.",
                color: "neon-purple",
              },
              {
                step: "02",
                icon: Shield,
                title: "Secure Escrow",
                description:
                  "Your payment is held securely in escrow. Funds are only released to the seller after you confirm delivery.",
                color: "neon-blue",
              },
              {
                step: "03",
                icon: Zap,
                title: "Instant Delivery",
                description:
                  "Receive your game keys or items instantly. Automated delivery for supported products, manual for rare items.",
                color: "neon-green",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center group">
                {/* Connector line */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-cyber-border to-transparent" />
                )}

                <div
                  className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-${item.color}/10 border border-${item.color}/20
                            flex items-center justify-center transition-all duration-500 group-hover:scale-110
                            group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]`}
                >
                  <item.icon className={`w-8 h-8 text-${item.color}`} />
                </div>

                <span className="font-display text-xs text-muted-foreground tracking-widest uppercase mb-2 block">
                  Step {item.step}
                </span>
                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          CTA SECTION
          ============================================================ */}
      <section className="relative py-24 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 via-cyber-dark to-neon-blue/10" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-neon-purple/10 rounded-full blur-[150px]" />

        <div className="section-container relative z-10 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="text-gradient">Start Trading?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join 50,000+ gamers buying and selling on the most secure gaming
              marketplace. Sign up free and start in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up" className="btn-neon text-base !px-8 !py-4 group">
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Create Free Account
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link href="/marketplace" className="btn-ghost-neon text-base !px-8 !py-4">
                Explore Marketplace
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-neon-green" />
                256-bit SSL Encryption
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-neon-blue" />
                24/7 Live Support
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-neon-purple" />
                Verified Sellers
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
