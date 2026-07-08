-- ============================================================
-- EZKEY Gaming Marketplace — Database Schema
-- Migration 001: Create Tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES — Extended user data linked to auth.users
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  total_sales INTEGER NOT NULL DEFAULT 0,
  total_purchases INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::TEXT, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. VENDOR_DETAILS — Seller-specific private data
-- ============================================================
CREATE TABLE public.vendor_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  business_email TEXT,
  payout_method TEXT DEFAULT 'stripe' CHECK (payout_method IN ('stripe', 'paypal', 'bank_transfer')),
  stripe_account_id TEXT,
  paypal_email TEXT,
  bank_info JSONB, -- Encrypted at application level
  id_verification_status TEXT DEFAULT 'pending' CHECK (id_verification_status IN ('pending', 'submitted', 'verified', 'rejected')),
  id_document_url TEXT,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  pending_payout DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 3. CATEGORIES — Game / asset categories
-- ============================================================
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name or URL
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default categories
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('Game Keys', 'game-keys', 'Digital game activation keys for all platforms', 'gamepad-2', 1),
  ('In-Game Items', 'in-game-items', 'Rare skins, weapons, and collectibles', 'swords', 2),
  ('Gift Cards', 'gift-cards', 'Digital gift cards for gaming platforms', 'gift', 3),
  ('Game Coins', 'game-coins', 'In-game currency and virtual money', 'coins', 4),
  ('Accounts', 'accounts', 'Premium gaming accounts with progress', 'user-check', 5),
  ('Boosting Services', 'boosting-services', 'Rank boosting and leveling services', 'trending-up', 6);


-- ============================================================
-- 4. LISTINGS — Products for sale
-- ============================================================
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  original_price DECIMAL(10, 2), -- For showing discounts
  currency TEXT NOT NULL DEFAULT 'USD',
  platform TEXT CHECK (platform IN ('steam', 'epic', 'origin', 'uplay', 'gog', 'xbox', 'playstation', 'nintendo', 'battle_net', 'other')),
  region TEXT DEFAULT 'global',
  delivery_type TEXT NOT NULL DEFAULT 'instant' CHECK (delivery_type IN ('instant', 'manual', 'service')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'sold_out', 'removed')),
  images TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  stock_count INTEGER NOT NULL DEFAULT 0,
  sold_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_listings_seller ON public.listings(seller_id);
CREATE INDEX idx_listings_category ON public.listings(category_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_slug ON public.listings(slug);
CREATE INDEX idx_listings_featured ON public.listings(featured) WHERE featured = TRUE;
CREATE INDEX idx_listings_price ON public.listings(price);


-- ============================================================
-- 5. LISTING_KEYS — Actual game keys (sensitive)
-- ============================================================
CREATE TABLE public.listing_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  encrypted_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold', 'revoked')),
  buyer_id UUID REFERENCES public.profiles(id),
  order_id UUID, -- Will be set via FK after orders table exists
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listing_keys_listing ON public.listing_keys(listing_id);
CREATE INDEX idx_listing_keys_status ON public.listing_keys(status);
CREATE INDEX idx_listing_keys_buyer ON public.listing_keys(buyer_id);


-- ============================================================
-- 6. ORDERS — Purchase records
-- ============================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || LEFT(uuid_generate_v4()::TEXT, 8),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  listing_id UUID NOT NULL REFERENCES public.listings(id),
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'delivered', 'completed', 'cancelled', 'refunded', 'disputed')),
  delivery_data JSONB, -- Delivered keys or service details
  buyer_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK on listing_keys now that orders table exists
ALTER TABLE public.listing_keys
  ADD CONSTRAINT fk_listing_keys_order
  FOREIGN KEY (order_id) REFERENCES public.orders(id);

CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_listing ON public.orders(listing_id);


-- ============================================================
-- 7. ESCROW_TRANSACTIONS — Secure payment escrow
-- ============================================================
CREATE TABLE public.escrow_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'balance')),
  payment_intent_id TEXT, -- Stripe PaymentIntent ID or PayPal Order ID
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'held', 'released', 'completed', 'disputed', 'refunded')),
  held_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_escrow_buyer ON public.escrow_transactions(buyer_id);
CREATE INDEX idx_escrow_seller ON public.escrow_transactions(seller_id);
CREATE INDEX idx_escrow_status ON public.escrow_transactions(status);


-- ============================================================
-- 8. REVIEWS — Buyer reviews for sellers
-- ============================================================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  listing_id UUID NOT NULL REFERENCES public.listings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_seller ON public.reviews(seller_id);
CREATE INDEX idx_reviews_listing ON public.reviews(listing_id);


-- ============================================================
-- 9. MESSAGES — Buyer-seller communication
-- ============================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL, -- Groups messages between two users about an order
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  receiver_id UUID NOT NULL REFERENCES public.profiles(id),
  order_id UUID REFERENCES public.orders(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX idx_messages_order ON public.messages(order_id);


-- ============================================================
-- 10. NOTIFICATIONS — In-app notifications
-- ============================================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('order', 'payment', 'escrow', 'review', 'message', 'system', 'payout')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT, -- Internal navigation link
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);


-- ============================================================
-- 11. DISPUTES — Order dispute tickets
-- ============================================================
CREATE TABLE public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  escrow_id UUID REFERENCES public.escrow_transactions(id),
  initiated_by UUID NOT NULL REFERENCES public.profiles(id),
  against_user UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL CHECK (reason IN ('not_delivered', 'wrong_item', 'invalid_key', 'fraud', 'other')),
  description TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'closed')),
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_disputes_order ON public.disputes(order_id);
CREATE INDEX idx_disputes_status ON public.disputes(status);


-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.vendor_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.escrow_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.disputes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
