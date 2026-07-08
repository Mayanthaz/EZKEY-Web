// ============================================================
// EZKEY — Constants & Configuration
// ============================================================

export const SITE_CONFIG = {
  name: "EZKEY",
  tagline: "Your Premium Gaming Marketplace",
  description:
    "Buy and sell game keys, in-game items, gift cards, and digital gaming assets securely with escrow protection.",
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
  "game-keys": "🎮",
  "in-game-items": "⚔️",
  "gift-cards": "🎁",
  "game-coins": "🪙",
  "accounts": "👤",
  "boosting-services": "🚀",
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
  { label: "Sell", href: "/dashboard/seller" },
] as const;

export const FOOTER_LINKS = {
  marketplace: [
    { label: "Browse All", href: "/marketplace" },
    { label: "Game Keys", href: "/categories/game-keys" },
    { label: "In-Game Items", href: "/categories/in-game-items" },
    { label: "Gift Cards", href: "/categories/gift-cards" },
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

// Mock data for initial development
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
}> = [
  {
    id: "1",
    title: "Cyberpunk 2077 Ultimate Edition",
    slug: "cyberpunk-2077-ultimate",
    price: 29.99,
    original_price: 59.99,
    platform: "steam",
    category_slug: "game-keys",
    category_name: "Game Keys",
    seller_name: "KeyMaster",
    seller_rating: 4.8,
    seller_avatar: "",
    thumbnail_url: "",
    stock_count: 45,
    sold_count: 1230,
    featured: true,
    delivery_type: "instant",
    tags: ["RPG", "Open World", "Action"],
  },
  {
    id: "2",
    title: "Elden Ring Shadow of the Erdtree DLC",
    slug: "elden-ring-dlc",
    price: 34.99,
    original_price: 39.99,
    platform: "steam",
    category_slug: "game-keys",
    category_name: "Game Keys",
    seller_name: "GameVault",
    seller_rating: 4.9,
    seller_avatar: "",
    thumbnail_url: "",
    stock_count: 22,
    sold_count: 890,
    featured: true,
    delivery_type: "instant",
    tags: ["RPG", "Souls-like", "DLC"],
  },
  {
    id: "3",
    title: "CS2 Karambit | Fade (Factory New)",
    slug: "cs2-karambit-fade",
    price: 1299.99,
    original_price: null,
    platform: "steam",
    category_slug: "in-game-items",
    category_name: "In-Game Items",
    seller_name: "SkinTrader",
    seller_rating: 4.7,
    seller_avatar: "",
    thumbnail_url: "",
    stock_count: 1,
    sold_count: 56,
    featured: true,
    delivery_type: "manual",
    tags: ["CS2", "Knife", "Rare"],
  },
  {
    id: "4",
    title: "Steam Gift Card $50",
    slug: "steam-gift-card-50",
    price: 46.99,
    original_price: 50.0,
    platform: "steam",
    category_slug: "gift-cards",
    category_name: "Gift Cards",
    seller_name: "CardKing",
    seller_rating: 4.6,
    seller_avatar: "",
    thumbnail_url: "",
    stock_count: 100,
    sold_count: 3400,
    featured: false,
    delivery_type: "instant",
    tags: ["Gift Card", "Steam", "Wallet"],
  },
  {
    id: "5",
    title: "GTA V Online — 10M Cash Package",
    slug: "gta-v-10m-cash",
    price: 14.99,
    original_price: 24.99,
    platform: "steam",
    category_slug: "game-coins",
    category_name: "Game Coins",
    seller_name: "CoinMaster",
    seller_rating: 4.5,
    seller_avatar: "",
    thumbnail_url: "",
    stock_count: 999,
    sold_count: 5670,
    featured: false,
    delivery_type: "manual",
    tags: ["GTA V", "Money", "Online"],
  },
  {
    id: "6",
    title: "Valorant Diamond Rank Boost",
    slug: "valorant-diamond-boost",
    price: 79.99,
    original_price: 99.99,
    platform: "other",
    category_slug: "boosting-services",
    category_name: "Boosting Services",
    seller_name: "BoostPro",
    seller_rating: 4.9,
    seller_avatar: "",
    thumbnail_url: "",
    stock_count: 10,
    sold_count: 234,
    featured: true,
    delivery_type: "service",
    tags: ["Valorant", "Boost", "Ranked"],
  },
  {
    id: "7",
    title: "Baldur's Gate 3 Deluxe Edition",
    slug: "baldurs-gate-3-deluxe",
    price: 44.99,
    original_price: 69.99,
    platform: "steam",
    category_slug: "game-keys",
    category_name: "Game Keys",
    seller_name: "KeyMaster",
    seller_rating: 4.8,
    seller_avatar: "",
    thumbnail_url: "",
    stock_count: 18,
    sold_count: 670,
    featured: false,
    delivery_type: "instant",
    tags: ["RPG", "Turn-Based", "Co-op"],
  },
  {
    id: "8",
    title: "Xbox Game Pass Ultimate — 12 Months",
    slug: "xbox-game-pass-12m",
    price: 119.99,
    original_price: 179.99,
    platform: "xbox",
    category_slug: "gift-cards",
    category_name: "Gift Cards",
    seller_name: "SubKing",
    seller_rating: 4.7,
    seller_avatar: "",
    thumbnail_url: "",
    stock_count: 30,
    sold_count: 1120,
    featured: true,
    delivery_type: "instant",
    tags: ["Xbox", "Game Pass", "Subscription"],
  },
];

export const MOCK_CATEGORIES = [
  { name: "Game Keys", slug: "game-keys", icon: "🎮", count: 12450, description: "Digital game activation keys for all platforms" },
  { name: "In-Game Items", slug: "in-game-items", icon: "⚔️", count: 8320, description: "Rare skins, weapons, and collectibles" },
  { name: "Gift Cards", slug: "gift-cards", icon: "🎁", count: 5670, description: "Digital gift cards for gaming platforms" },
  { name: "Game Coins", slug: "game-coins", icon: "🪙", count: 9100, description: "In-game currency and virtual money" },
  { name: "Accounts", slug: "accounts", icon: "👤", count: 3240, description: "Premium gaming accounts with progress" },
  { name: "Boosting Services", slug: "boosting-services", icon: "🚀", count: 1890, description: "Rank boosting and leveling services" },
];

export const TRUST_BADGES = [
  { icon: "🔒", title: "Secure Escrow", description: "Funds held safely until delivery" },
  { icon: "⚡", title: "Instant Delivery", description: "Get your keys in seconds" },
  { icon: "🛡️", title: "Buyer Protection", description: "Full refund if issues arise" },
  { icon: "💬", title: "24/7 Support", description: "Always here to help you" },
];
