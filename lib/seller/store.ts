import { MOCK_LISTINGS, MOCK_CATEGORIES, PLATFORM_LABELS } from "@/lib/constants";
import type {
  CreateListingInput,
  UpdateListingInput,
  SellerSettingsInput,
} from "@/lib/validations/seller";

export type SellerListing = {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  original_price: number | null;
  platform: string;
  category_slug: string;
  category_name: string;
  delivery_type: "instant" | "manual" | "service";
  status: "draft" | "active" | "paused" | "sold_out" | "removed";
  images: string[];
  thumbnail_url: string;
  stock_count: number;
  sold_count: number;
  views: number;
  created_at: string;
  updated_at: string;
};

export type SellerKeyItem = {
  id: string;
  listing_id: string;
  key_code: string;
  status: "available" | "reserved" | "sold";
  order_id?: string;
  created_at: string;
};

export type SellerOrder = {
  id: string;
  order_number: string;
  seller_id: string;
  buyer_id: string;
  buyer_name: string;
  listing_id: string;
  product_title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  platform_fee: number;
  net_earnings: number;
  status: "pending" | "paid" | "processing" | "delivered" | "completed" | "cancelled" | "refunded";
  escrow_status: "pending" | "held" | "released" | "refunded";
  delivery_data?: {
    keys?: string[];
    note?: string;
    delivered_at?: string;
  };
  created_at: string;
};

export type SellerPayout = {
  id: string;
  seller_id: string;
  amount: number;
  method: "stripe" | "paypal" | "bank_transfer";
  destination: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
};

export type SellerNotification = {
  id: string;
  seller_id: string;
  title: string;
  body: string;
  type: "order" | "payout" | "listing" | "system";
  link?: string;
  is_read: boolean;
  created_at: string;
};

// Global in-memory cache preserved across Hot-Reloads in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __EZKEY_SELLER_STORE__: {
    listings: Map<string, SellerListing>;
    keys: Map<string, SellerKeyItem[]>;
    orders: Map<string, SellerOrder>;
    payouts: Map<string, SellerPayout>;
    settings: Map<string, SellerSettingsInput>;
    notifications: Map<string, SellerNotification[]>;
    initialized: boolean;
  } | undefined;
}

function getStore() {
  if (!globalThis.__EZKEY_SELLER_STORE__) {
    globalThis.__EZKEY_SELLER_STORE__ = {
      listings: new Map(),
      keys: new Map(),
      orders: new Map(),
      payouts: new Map(),
      settings: new Map(),
      notifications: new Map(),
      initialized: false,
    };
  }
  return globalThis.__EZKEY_SELLER_STORE__;
}

function initDefaultSeed(sellerId: string) {
  const store = getStore();
  if (store.initialized) return;

  // Seed default listings from MOCK_LISTINGS assigned to current seller
  MOCK_LISTINGS.slice(0, 4).forEach((item, index) => {
    const listingId = `listing-${index + 1}`;
    const listing: SellerListing = {
      id: listingId,
      seller_id: sellerId,
      title: item.title,
      slug: item.slug,
      description: `Official digital license for ${item.title}. Instant digital delivery upon purchase.`,
      short_description: `${item.platform.toUpperCase()} digital key`,
      price: item.price,
      original_price: item.original_price,
      platform: item.platform,
      category_slug: item.category_slug,
      category_name: item.category_name,
      delivery_type: "instant",
      status: "active",
      images: [item.thumbnail_url || "/assets/placeholder-game.png"],
      thumbnail_url: item.thumbnail_url || "",
      stock_count: item.stock_count,
      sold_count: item.sold_count,
      views: 240 + index * 60,
      created_at: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.listings.set(listingId, listing);

    // Seed mock available keys
    const sampleKeys: SellerKeyItem[] = Array.from({ length: 5 }, (_, k) => ({
      id: `key-${listingId}-${k + 1}`,
      listing_id: listingId,
      key_code: `EZKEY-${item.platform.toUpperCase().slice(0, 3)}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      status: "available",
      created_at: new Date().toISOString(),
    }));
    store.keys.set(listingId, sampleKeys);
  });

  // Seed sample initial orders
  const sampleOrders: SellerOrder[] = [
    {
      id: "ord-1",
      order_number: "ORD-8A4F2C1D",
      seller_id: sellerId,
      buyer_id: "buyer-alex",
      buyer_name: "Alex G.",
      listing_id: "listing-1",
      product_title: "Cyberpunk 2077 Ultimate Edition",
      quantity: 1,
      unit_price: 29.99,
      total_price: 29.99,
      platform_fee: 1.5,
      net_earnings: 28.49,
      status: "delivered",
      escrow_status: "held",
      delivery_data: {
        keys: ["EZKEY-STE-9X2LK-P7Y4A"],
        note: "Auto-dispatched via instant delivery",
        delivered_at: new Date(Date.now() - 7200000).toISOString(),
      },
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "ord-2",
      order_number: "ORD-3B7E9F0A",
      seller_id: sellerId,
      buyer_id: "buyer-sarah",
      buyer_name: "Sarah M.",
      listing_id: "listing-2",
      product_title: "Elden Ring Shadow of the Erdtree DLC",
      quantity: 1,
      unit_price: 34.99,
      total_price: 34.99,
      platform_fee: 1.75,
      net_earnings: 33.24,
      status: "paid",
      escrow_status: "held",
      created_at: new Date(Date.now() - 18000000).toISOString(),
    },
    {
      id: "ord-3",
      order_number: "ORD-6C2D4E8B",
      seller_id: sellerId,
      buyer_id: "buyer-mike",
      buyer_name: "Mike R.",
      listing_id: "listing-1",
      product_title: "Steam Gift Card $50",
      quantity: 1,
      unit_price: 46.99,
      total_price: 46.99,
      platform_fee: 2.35,
      net_earnings: 44.64,
      status: "completed",
      escrow_status: "released",
      delivery_data: {
        keys: ["STEAM-WALLET-50-USD-K8932"],
        delivered_at: new Date(Date.now() - 86400000).toISOString(),
      },
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  sampleOrders.forEach((o) => store.orders.set(o.id, o));

  // Seed sample payouts
  const samplePayouts: SellerPayout[] = [
    {
      id: "PAY-001",
      seller_id: sellerId,
      amount: 245.5,
      method: "stripe",
      destination: "acct_1NZ4xxxxxx",
      status: "completed",
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: "PAY-002",
      seller_id: sellerId,
      amount: 180.0,
      method: "paypal",
      destination: "seller@ezkey.test",
      status: "processing",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];
  samplePayouts.forEach((p) => store.payouts.set(p.id, p));

  // Seed initial notifications
  const sampleNotifications: SellerNotification[] = [
    {
      id: "notif-1",
      seller_id: sellerId,
      title: "New Order Received!",
      body: "Sarah M. placed an order for Elden Ring DLC ($34.99). Please fulfill.",
      type: "order",
      link: "/dashboard/seller/orders",
      is_read: false,
      created_at: new Date(Date.now() - 18000000).toISOString(),
    },
    {
      id: "notif-2",
      seller_id: sellerId,
      title: "Escrow Released",
      body: "$44.64 has been released to your available balance for Order ORD-6C2D4E8B.",
      type: "payout",
      link: "/dashboard/seller/payouts",
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
  store.notifications.set(sellerId, sampleNotifications);

  store.initialized = true;
}

// ============================================================
// Public Store API
// ============================================================

export function getSellerListings(sellerId: string): SellerListing[] {
  initDefaultSeed(sellerId);
  const store = getStore();
  return Array.from(store.listings.values())
    .filter((l) => l.seller_id === sellerId && l.status !== "removed")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getListingById(sellerId: string, listingId: string): SellerListing | null {
  initDefaultSeed(sellerId);
  const store = getStore();
  const listing = store.listings.get(listingId);
  if (!listing || listing.seller_id !== sellerId || listing.status === "removed") {
    return null;
  }
  return listing;
}

export function createSellerListing(
  sellerId: string,
  input: CreateListingInput
): SellerListing {
  initDefaultSeed(sellerId);
  const store = getStore();

  const id = `listing-${crypto.randomUUID()}`;
  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + `-${Math.random().toString(36).substring(2, 6)}`;

  const cat = MOCK_CATEGORIES.find((c) => c.slug === input.category_slug);

  const initialKeys = input.initial_keys || [];
  const stockCount = initialKeys.length > 0 ? initialKeys.length : 1;

  const newListing: SellerListing = {
    id,
    seller_id: sellerId,
    title: input.title,
    slug,
    description: input.description,
    short_description: input.short_description || "",
    price: input.price,
    original_price: input.original_price ?? null,
    platform: input.platform,
    category_slug: input.category_slug,
    category_name: cat?.name || "Digital Keys",
    delivery_type: input.delivery_type,
    status: "active",
    images: input.images,
    thumbnail_url: input.images[0] || "",
    stock_count: stockCount,
    sold_count: 0,
    views: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.listings.set(id, newListing);

  // Seed keys if provided
  if (initialKeys.length > 0) {
    const keyItems: SellerKeyItem[] = initialKeys.map((k, idx) => ({
      id: `key-${id}-${idx + 1}`,
      listing_id: id,
      key_code: k,
      status: "available",
      created_at: new Date().toISOString(),
    }));
    store.keys.set(id, keyItems);
  }

  return newListing;
}

export function updateSellerListing(
  sellerId: string,
  listingId: string,
  input: UpdateListingInput
): SellerListing | null {
  initDefaultSeed(sellerId);
  const store = getStore();
  const existing = store.listings.get(listingId);
  if (!existing || existing.seller_id !== sellerId) return null;

  const cat = input.category_slug
    ? MOCK_CATEGORIES.find((c) => c.slug === input.category_slug)
    : undefined;

  const updated: SellerListing = {
    ...existing,
    title: input.title ?? existing.title,
    description: input.description ?? existing.description,
    short_description: input.short_description ?? existing.short_description,
    price: input.price ?? existing.price,
    original_price: input.original_price !== undefined ? input.original_price : existing.original_price,
    platform: input.platform ?? existing.platform,
    category_slug: input.category_slug ?? existing.category_slug,
    category_name: cat?.name ?? existing.category_name,
    delivery_type: input.delivery_type ?? existing.delivery_type,
    status: input.status ?? existing.status,
    images: input.images ?? existing.images,
    thumbnail_url: input.images?.[0] ?? existing.thumbnail_url,
    updated_at: new Date().toISOString(),
  };

  store.listings.set(listingId, updated);
  return updated;
}

export function deleteSellerListing(sellerId: string, listingId: string): boolean {
  initDefaultSeed(sellerId);
  const store = getStore();
  const existing = store.listings.get(listingId);
  if (!existing || existing.seller_id !== sellerId) return false;

  // Mark as removed
  existing.status = "removed";
  existing.updated_at = new Date().toISOString();
  store.listings.set(listingId, existing);
  return true;
}

export function getListingKeys(sellerId: string, listingId: string): SellerKeyItem[] {
  initDefaultSeed(sellerId);
  const store = getStore();
  const listing = store.listings.get(listingId);
  if (!listing || listing.seller_id !== sellerId) return [];

  return store.keys.get(listingId) || [];
}

export function addListingKeys(
  sellerId: string,
  listingId: string,
  rawKeys: string[]
): { addedCount: number; newStock: number } {
  initDefaultSeed(sellerId);
  const store = getStore();
  const listing = store.listings.get(listingId);
  if (!listing || listing.seller_id !== sellerId) {
    throw new Error("Listing not found or access denied");
  }

  const existingKeys = store.keys.get(listingId) || [];
  const cleanKeys = rawKeys.map((k) => k.trim()).filter((k) => k.length > 0);

  const newKeyItems: SellerKeyItem[] = cleanKeys.map((key_code, idx) => ({
    id: `key-${listingId}-${Date.now()}-${idx}`,
    listing_id: listingId,
    key_code,
    status: "available",
    created_at: new Date().toISOString(),
  }));

  const allKeys = [...existingKeys, ...newKeyItems];
  store.keys.set(listingId, allKeys);

  const availableCount = allKeys.filter((k) => k.status === "available").length;
  listing.stock_count = availableCount;
  if (listing.status === "sold_out" && availableCount > 0) {
    listing.status = "active";
  }
  listing.updated_at = new Date().toISOString();
  store.listings.set(listingId, listing);

  return { addedCount: cleanKeys.length, newStock: availableCount };
}

export function getSellerOrders(sellerId: string): SellerOrder[] {
  initDefaultSeed(sellerId);
  const store = getStore();
  return Array.from(store.orders.values())
    .filter((o) => o.seller_id === sellerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function fulfillSellerOrder(
  sellerId: string,
  orderId: string,
  keys: string[],
  note?: string
): SellerOrder {
  initDefaultSeed(sellerId);
  const store = getStore();
  const order = store.orders.get(orderId);
  if (!order || order.seller_id !== sellerId) {
    throw new Error("Order not found or unauthorized");
  }

  order.status = "delivered";
  order.escrow_status = "held";
  order.delivery_data = {
    keys,
    note: note || "Dispatched by seller",
    delivered_at: new Date().toISOString(),
  };

  store.orders.set(orderId, order);

  // Add notification to buyer
  const sellerNotifs = store.notifications.get(sellerId) || [];
  sellerNotifs.unshift({
    id: `notif-${Date.now()}`,
    seller_id: sellerId,
    title: "Order Fulfilled",
    body: `You successfully delivered order ${order.order_number}. Escrow is held awaiting buyer confirmation.`,
    type: "order",
    is_read: false,
    created_at: new Date().toISOString(),
  });
  store.notifications.set(sellerId, sellerNotifs);

  return order;
}

export function getSellerPayouts(sellerId: string) {
  initDefaultSeed(sellerId);
  const store = getStore();

  const orders = getSellerOrders(sellerId);
  const payouts = Array.from(store.payouts.values())
    .filter((p) => p.seller_id === sellerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Calculate financials
  const completedRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.net_earnings, 0);

  const pendingEscrow = orders
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .reduce((sum, o) => sum + o.net_earnings, 0);

  const totalWithdrawn = payouts
    .filter((p) => p.status === "completed" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalLifetimeEarned = orders
    .filter((o) => o.status === "completed" || o.status === "delivered")
    .reduce((sum, o) => sum + o.net_earnings, 0) + 2450.25;

  const availableBalance = Math.max(0, totalLifetimeEarned - totalWithdrawn);

  return {
    availableBalance: Number(availableBalance.toFixed(2)),
    pendingEscrow: Number(pendingEscrow.toFixed(2)),
    totalEarned: Number(totalLifetimeEarned.toFixed(2)),
    payouts,
  };
}

export function requestSellerPayout(
  sellerId: string,
  amount: number,
  method: "stripe" | "paypal" | "bank_transfer",
  destination: string
): SellerPayout {
  initDefaultSeed(sellerId);
  const store = getStore();
  const financials = getSellerPayouts(sellerId);

  if (amount > financials.availableBalance) {
    throw new Error(
      `Insufficient available balance. Requested: $${amount.toFixed(2)}, Available: $${financials.availableBalance.toFixed(2)}`
    );
  }

  const payoutId = `PAY-${Math.floor(100 + Math.random() * 900)}`;
  const payout: SellerPayout = {
    id: payoutId,
    seller_id: sellerId,
    amount: Number(amount.toFixed(2)),
    method,
    destination,
    status: "processing",
    created_at: new Date().toISOString(),
  };

  store.payouts.set(payoutId, payout);
  return payout;
}

export function getSellerStats(sellerId: string) {
  initDefaultSeed(sellerId);
  const listings = getSellerListings(sellerId);
  const orders = getSellerOrders(sellerId);
  const payouts = getSellerPayouts(sellerId);

  const activeListings = listings.filter((l) => l.status === "active").length;
  const pendingOrders = orders.filter((o) => o.status === "paid" || o.status === "pending").length;

  return {
    totalRevenue: payouts.totalEarned,
    activeListings,
    pendingOrders,
    sellerRating: 4.8,
    recentOrders: orders.slice(0, 5),
  };
}

export function getSellerSettings(sellerId: string): SellerSettingsInput {
  initDefaultSeed(sellerId);
  const store = getStore();
  const existing = store.settings.get(sellerId);
  if (existing) return existing;

  return {
    business_name: "KeyMaster Store",
    business_email: "store@ezkey.test",
    bio: "Verified premium instant key seller. 24/7 digital fulfillment with warranty.",
    payout_method: "stripe",
    paypal_email: "paypal@ezkey.test",
    bank_account_info: "Chase Bank •••• 4821",
  };
}

export function updateSellerSettings(
  sellerId: string,
  input: SellerSettingsInput
): SellerSettingsInput {
  initDefaultSeed(sellerId);
  const store = getStore();
  store.settings.set(sellerId, input);
  return input;
}

export function getSellerNotifications(sellerId: string): SellerNotification[] {
  initDefaultSeed(sellerId);
  const store = getStore();
  return store.notifications.get(sellerId) || [];
}

export function markNotificationRead(sellerId: string, notifId: string): boolean {
  initDefaultSeed(sellerId);
  const store = getStore();
  const list = store.notifications.get(sellerId);
  if (!list) return false;

  const item = list.find((n) => n.id === notifId);
  if (item) {
    item.is_read = true;
    return true;
  }
  return false;
}
