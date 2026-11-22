// ============================================================
// EZKEY — Constants & Configuration
// ============================================================

export const SITE_CONFIG = {
  name: "EZKEY",
  tagline: "Your Premium Digital Marketplace",
  description:
    "Buy and sell digital apps, vouchers, keys, accounts, and digital assets securely with escrow protection.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  platformFeePercent: 5,
} as const;

export const PLATFORM_LABELS: Record<string, string> = {
  steam: "Steam",
  epic: "Epic Games",
  origin: "EA / Origin",
  uplay: "Ubisoft Connect",
  gog: "GOG",
  xbox: "Xbox",
  playstation: "PlayStation",
  nintendo: "Nintendo",
  battle_net: "Battle.net",
  other: "Other",
};

export const PLATFORM_COLORS: Record<string, string> = {
  steam: "#1b2838",
  epic: "#2a2a2a",
  origin: "#f56c2d",
  uplay: "#0070ff",
  gog: "#86328a",
  xbox: "#107c10",
  playstation: "#003087",
  nintendo: "#e60012",
  battle_net: "#00aeff",
  other: "#6b7280",
};

export const CATEGORY_ICONS: Record<string, string> = {
  "digital-keys": "🔑",
  "digital-apps": "📱",
  "vouchers": "🎟️",
  "digital-credits": "💳",
  "accounts": "👤",
  "digital-services": "🚀",
};

export const ORDER_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: "Pending", color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
  paid: { label: "Paid", color: "text-neon-blue", bgColor: "bg-neon-blue/10" },
  processing: { label: "Processing", color: "text-neon-purple", bgColor: "bg-neon-purple/10" },
  delivered: { label: "Delivered", color: "text-neon-orange", bgColor: "bg-neon-orange/10" },
  completed: { label: "Completed", color: "text-neon-green", bgColor: "bg-neon-green/10" },
  cancelled: { label: "Cancelled", color: "text-gray-400", bgColor: "bg-gray-400/10" },
  refunded: { label: "Refunded", color: "text-red-400", bgColor: "bg-red-400/10" },
  disputed: { label: "Disputed", color: "text-red-400", bgColor: "bg-red-400/10" },
};

export const ESCROW_STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  pending: { label: "Awaiting Payment", color: "text-yellow-400", icon: "⏳" },
  held: { label: "Funds Held", color: "text-neon-blue", icon: "🔒" },
  released: { label: "Released", color: "text-neon-green", icon: "🔓" },
  completed: { label: "Completed", color: "text-neon-green", icon: "✅" },
  disputed: { label: "Disputed", color: "text-red-400", icon: "⚠️" },
  refunded: { label: "Refunded", color: "text-red-400", icon: "↩️" },
};

export const NAV_LINKS = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Categories", href: "/categories" },
  { label: "Become a Seller", href: "/become-a-seller" },
] as const;

export const FOOTER_LINKS = {
  marketplace: [
    { label: "Browse All", href: "/marketplace" },
    { label: "Digital Apps", href: "/categories/digital-apps" },
    { label: "Vouchers", href: "/categories/vouchers" },
    { label: "Digital Keys", href: "/categories/digital-keys" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Buyer Protection", href: "/buyer-protection" },
    { label: "Seller Guide", href: "/seller-guide" },
    { label: "Contact Us", href: "/contact" },
  ],
  company: [
    { label: "About EZKEY", href: "/about" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Blog", href: "/blog" },
  ],
} as const;

// Listings are loaded from the database; none are bundled with the app.
export const MOCK_LISTINGS: Array<{
  id: string;
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  platform: string;
  category_slug: string;
  category_name: string;
  seller_name: string;
  seller_rating: number;
  seller_avatar: string;
  thumbnail_url: string;
  stock_count: number;
  sold_count: number;
  featured: boolean;
  delivery_type: string;
  tags: string[];
}> = [];

export const MOCK_CATEGORIES = [
  { name: "Digital Keys", slug: "digital-keys", icon: "🔑", description: "Activation keys for apps, software, games, and subscriptions" },
  { name: "Digital Apps", slug: "digital-apps", icon: "📱", description: "Apps, tools, subscriptions, and digital downloads" },
  { name: "Vouchers", slug: "vouchers", icon: "🎟️", description: "Digital vouchers, prepaid codes, and wallet credits" },
  { name: "Digital Credits", slug: "digital-credits", icon: "💳", description: "Wallet credits, top-ups, and virtual balances" },
  { name: "Accounts", slug: "accounts", icon: "👤", description: "Premium digital accounts and profiles" },
  { name: "Digital Services", slug: "digital-services", icon: "🚀", description: "Setup, activation, and account support services" },
];

export const TRUST_BADGES = [
  { icon: "🔒", title: "Secure Escrow", description: "Funds held safely until delivery" },
  { icon: "⚡", title: "Instant Delivery", description: "Get your keys in seconds" },
  { icon: "🛡️", title: "Buyer Protection", description: "Full refund if issues arise" },
  { icon: "💬", title: "24/7 Support", description: "Always here to help you" },
];
