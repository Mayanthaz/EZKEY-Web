// ============================================================
// EZKEY — Type Definitions
// ============================================================

export type UserRole = "buyer" | "seller" | "admin";

export type ListingStatus = "draft" | "active" | "paused" | "sold_out" | "removed";
export type DeliveryType = "instant" | "manual" | "service";
export type Platform = "steam" | "epic" | "origin" | "uplay" | "gog" | "xbox" | "playstation" | "nintendo" | "battle_net" | "other";

export type OrderStatus = "pending" | "paid" | "processing" | "delivered" | "completed" | "cancelled" | "refunded" | "disputed";
export type EscrowStatus = "pending" | "held" | "released" | "completed" | "disputed" | "refunded";
export type PaymentMethod = "stripe" | "paypal" | "balance";

export type DisputeReason = "not_delivered" | "wrong_item" | "invalid_key" | "fraud" | "other";
export type DisputeStatus = "open" | "under_review" | "resolved_buyer" | "resolved_seller" | "closed";

export type VerificationStatus = "pending" | "submitted" | "verified" | "rejected";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  balance: number;
  is_verified: boolean;
  total_sales: number;
  total_purchases: number;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface VendorDetails {
  id: string;
  user_id: string;
  business_name: string | null;
  business_email: string | null;
  payout_method: PaymentMethod;
  stripe_account_id: string | null;
  paypal_email: string | null;
  bank_info: Record<string, unknown> | null;
  id_verification_status: VerificationStatus;
  id_document_url: string | null;
  total_revenue: number;
  pending_payout: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  price: number;
  original_price: number | null;
  currency: string;
  platform: Platform | null;
  region: string;
  delivery_type: DeliveryType;
  status: ListingStatus;
  images: string[];
  thumbnail_url: string | null;
  stock_count: number;
  sold_count: number;
  view_count: number;
  featured: boolean;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined data
  seller?: Profile;
  category?: Category;
  reviews_count?: number;
  average_rating?: number;
}

export interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  platform_fee: number;
  status: OrderStatus;
  delivery_data: Record<string, unknown> | null;
  buyer_confirmed: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  buyer?: Profile;
  seller?: Profile;
  listing?: Listing;
  escrow?: EscrowTransaction;
}

export interface EscrowTransaction {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  platform_fee: number;
  payment_method: PaymentMethod | null;
  payment_intent_id: string | null;
  status: EscrowStatus;
  held_at: string | null;
  released_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  seller_id: string;
  listing_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  reviewer?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  order_id: string | null;
  content: string;
  message_type: "text" | "image" | "system";
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  type: "order" | "payment" | "escrow" | "review" | "message" | "system" | "payout";
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  escrow_id: string | null;
  initiated_by: string;
  against_user: string;
  reason: DisputeReason;
  description: string | null;
  evidence_urls: string[];
  status: DisputeStatus;
  resolution: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}
