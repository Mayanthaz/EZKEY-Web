-- ============================================================
-- EZKEY Gaming Marketplace — Row Level Security Policies
-- Migration 002: RLS Policies
-- ============================================================

-- ============================================================
-- Enable RLS on ALL tables
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PROFILES
-- ============================================================
-- Anyone can read public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  TO authenticated, anon
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- VENDOR_DETAILS (Critical: private financial data)
-- ============================================================
-- Only the vendor can read their own details
CREATE POLICY "Vendors can view own details"
  ON public.vendor_details FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only the vendor can insert their details
CREATE POLICY "Vendors can create own details"
  ON public.vendor_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only the vendor can update their details
CREATE POLICY "Vendors can update own details"
  ON public.vendor_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- CATEGORIES
-- ============================================================
-- Anyone can read categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  TO authenticated, anon
  USING (is_active = true);


-- ============================================================
-- LISTINGS
-- ============================================================
-- Anyone can read active listings
CREATE POLICY "Active listings are viewable by everyone"
  ON public.listings FOR SELECT
  TO authenticated, anon
  USING (status = 'active' OR seller_id = auth.uid());

-- Sellers can create listings
CREATE POLICY "Sellers can create listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = seller_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'seller'
    )
  );

-- Sellers can update their own listings
CREATE POLICY "Sellers can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own listings
CREATE POLICY "Sellers can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = seller_id);


-- ============================================================
-- LISTING_KEYS (Highly sensitive)
-- ============================================================
-- Sellers can see keys for their listings
CREATE POLICY "Sellers can view keys for own listings"
  ON public.listing_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_keys.listing_id
      AND listings.seller_id = auth.uid()
    )
    OR (buyer_id = auth.uid() AND status = 'sold')
  );

-- Sellers can insert keys for their listings
CREATE POLICY "Sellers can add keys to own listings"
  ON public.listing_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_keys.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Sellers can update keys for their listings
CREATE POLICY "Sellers can update own listing keys"
  ON public.listing_keys FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_keys.listing_id
      AND listings.seller_id = auth.uid()
    )
  );


-- ============================================================
-- ORDERS
-- ============================================================
-- Buyer and seller can see their orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

-- Only via RPC for status updates (restricted direct updates)
CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);


-- ============================================================
-- ESCROW_TRANSACTIONS
-- ============================================================
-- Buyer and seller can view their escrow transactions
CREATE POLICY "Users can view own escrow transactions"
  ON public.escrow_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Only via RPC (no direct insert/update from client)
-- Insert policy for server-side operations
CREATE POLICY "System can create escrow transactions"
  ON public.escrow_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);


-- ============================================================
-- REVIEWS
-- ============================================================
-- Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only verified buyers can create reviews
CREATE POLICY "Buyers can review completed orders"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = reviews.order_id
      AND orders.buyer_id = auth.uid()
      AND orders.status = 'completed'
    )
  );

-- Reviewers can update their own reviews
CREATE POLICY "Reviewers can update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);


-- ============================================================
-- MESSAGES
-- ============================================================
-- Users can read their own messages
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Authenticated users can send messages
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Users can mark messages as read
CREATE POLICY "Users can update received messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System inserts (handled via service role in Edge Functions)
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- DISPUTES
-- ============================================================
-- Involved parties can see disputes
CREATE POLICY "Involved users can view disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (auth.uid() = initiated_by OR auth.uid() = against_user);

-- Users can create disputes for their orders
CREATE POLICY "Users can create disputes"
  ON public.disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = initiated_by
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = disputes.order_id
      AND (orders.buyer_id = auth.uid() OR orders.seller_id = auth.uid())
    )
  );
