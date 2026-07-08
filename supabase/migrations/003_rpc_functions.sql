-- ============================================================
-- EZKEY Gaming Marketplace — RPC Functions
-- Migration 003: Security Definer Functions for Escrow
-- ============================================================

-- ============================================================
-- 1. PLACE ORDER — Creates order + escrow in a single transaction
-- ============================================================
CREATE OR REPLACE FUNCTION public.place_order(
  p_listing_id UUID,
  p_quantity INTEGER DEFAULT 1,
  p_payment_method TEXT DEFAULT 'stripe'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_listing RECORD;
  v_order_id UUID;
  v_escrow_id UUID;
  v_total_price DECIMAL(10, 2);
  v_platform_fee DECIMAL(10, 2);
  v_buyer_id UUID;
BEGIN
  v_buyer_id := auth.uid();
  
  -- Validate buyer exists
  IF v_buyer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get listing details with lock
  SELECT * INTO v_listing
    FROM public.listings
    WHERE id = p_listing_id AND status = 'active'
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Listing not found or not active';
  END IF;

  -- Can't buy own listing
  IF v_listing.seller_id = v_buyer_id THEN
    RAISE EXCEPTION 'Cannot purchase your own listing';
  END IF;

  -- Check stock
  IF v_listing.stock_count < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock. Available: %', v_listing.stock_count;
  END IF;

  -- Calculate prices
  v_total_price := v_listing.price * p_quantity;
  v_platform_fee := ROUND(v_total_price * 0.05, 2); -- 5% platform fee

  -- Create order
  INSERT INTO public.orders (
    buyer_id, seller_id, listing_id,
    quantity, unit_price, total_price, platform_fee, status
  ) VALUES (
    v_buyer_id, v_listing.seller_id, p_listing_id,
    p_quantity, v_listing.price, v_total_price, v_platform_fee, 'pending'
  ) RETURNING id INTO v_order_id;

  -- Create escrow transaction
  INSERT INTO public.escrow_transactions (
    order_id, buyer_id, seller_id,
    amount, platform_fee, payment_method, status
  ) VALUES (
    v_order_id, v_buyer_id, v_listing.seller_id,
    v_total_price, v_platform_fee, p_payment_method, 'pending'
  ) RETURNING id INTO v_escrow_id;

  -- Reserve keys if instant delivery
  IF v_listing.delivery_type = 'instant' THEN
    UPDATE public.listing_keys
      SET status = 'reserved', buyer_id = v_buyer_id, order_id = v_order_id
      WHERE listing_id = p_listing_id
        AND status = 'available'
        AND id IN (
          SELECT id FROM public.listing_keys
          WHERE listing_id = p_listing_id AND status = 'available'
          LIMIT p_quantity
        );
  END IF;

  -- Update stock count
  UPDATE public.listings
    SET stock_count = stock_count - p_quantity
    WHERE id = p_listing_id;

  -- Create notification for seller
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    v_listing.seller_id, 'order',
    'New Order Received!',
    'You have a new order for "' || v_listing.title || '"',
    '/dashboard/seller/orders'
  );

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'escrow_id', v_escrow_id,
    'total_price', v_total_price,
    'platform_fee', v_platform_fee
  );
END;
$$;


-- ============================================================
-- 2. CONFIRM PAYMENT — Mark escrow as held (called after Stripe/PayPal confirms)
-- ============================================================
CREATE OR REPLACE FUNCTION public.confirm_payment(
  p_order_id UUID,
  p_payment_intent_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Update escrow to held
  UPDATE public.escrow_transactions
    SET status = 'held',
        payment_intent_id = p_payment_intent_id,
        held_at = NOW()
    WHERE order_id = p_order_id
      AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow transaction not found or already processed';
  END IF;

  -- Update order status
  UPDATE public.orders
    SET status = 'paid'
    WHERE id = p_order_id;

  -- Notify seller
  INSERT INTO public.notifications (user_id, type, title, body, link)
  SELECT seller_id, 'payment', 'Payment Confirmed!',
    'Payment has been received and is held in escrow.',
    '/dashboard/seller/orders'
  FROM public.orders WHERE id = p_order_id;
END;
$$;


-- ============================================================
-- 3. DELIVER ORDER — Seller delivers keys/service
-- ============================================================
CREATE OR REPLACE FUNCTION public.deliver_order(
  p_order_id UUID,
  p_delivery_data JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id AND seller_id = auth.uid()
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or unauthorized';
  END IF;

  IF v_order.status NOT IN ('paid', 'processing') THEN
    RAISE EXCEPTION 'Order not in a deliverable state';
  END IF;

  -- Mark reserved keys as sold
  UPDATE public.listing_keys
    SET status = 'sold', sold_at = NOW()
    WHERE order_id = p_order_id AND status = 'reserved';

  -- Update order
  UPDATE public.orders
    SET status = 'delivered',
        delivery_data = p_delivery_data
    WHERE id = p_order_id;

  -- Update listing sold count
  UPDATE public.listings
    SET sold_count = sold_count + v_order.quantity
    WHERE id = v_order.listing_id;

  -- Notify buyer
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    v_order.buyer_id, 'order',
    'Order Delivered!',
    'Your order has been delivered. Please confirm receipt.',
    '/dashboard/buyer/orders'
  );
END;
$$;


-- ============================================================
-- 4. CONFIRM DELIVERY — Buyer confirms receipt, releases escrow
-- ============================================================
CREATE OR REPLACE FUNCTION public.confirm_delivery(
  p_order_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_escrow RECORD;
  v_seller_payout DECIMAL(10, 2);
BEGIN
  -- Verify buyer
  SELECT et.* INTO v_escrow
    FROM public.escrow_transactions et
    JOIN public.orders o ON o.id = et.order_id
    WHERE et.order_id = p_order_id
      AND o.buyer_id = auth.uid()
      AND et.status = 'held'
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow not found or not in held status';
  END IF;

  v_seller_payout := v_escrow.amount - v_escrow.platform_fee;

  -- Release escrow
  UPDATE public.escrow_transactions
    SET status = 'released', released_at = NOW()
    WHERE id = v_escrow.id;

  -- Complete order
  UPDATE public.orders
    SET status = 'completed', buyer_confirmed = TRUE
    WHERE id = p_order_id;

  -- Credit seller balance
  UPDATE public.profiles
    SET balance = balance + v_seller_payout,
        total_sales = total_sales + 1
    WHERE id = v_escrow.seller_id;

  -- Update buyer stats
  UPDATE public.profiles
    SET total_purchases = total_purchases + 1
    WHERE id = v_escrow.buyer_id;

  -- Update vendor revenue
  UPDATE public.vendor_details
    SET total_revenue = total_revenue + v_seller_payout,
        pending_payout = pending_payout + v_seller_payout
    WHERE user_id = v_escrow.seller_id;

  -- Notify seller
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    v_escrow.seller_id, 'escrow',
    'Escrow Released! 💰',
    'The buyer confirmed delivery. $' || v_seller_payout || ' has been added to your balance.',
    '/dashboard/seller/payouts'
  );
END;
$$;


-- ============================================================
-- 5. DISPUTE ORDER — Buyer or seller flags an issue
-- ============================================================
CREATE OR REPLACE FUNCTION public.dispute_order(
  p_order_id UUID,
  p_reason TEXT,
  p_description TEXT DEFAULT ''
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order RECORD;
  v_dispute_id UUID;
  v_against UUID;
BEGIN
  SELECT * INTO v_order
    FROM public.orders
    WHERE id = p_order_id
      AND (buyer_id = auth.uid() OR seller_id = auth.uid());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or unauthorized';
  END IF;

  -- Determine who the dispute is against
  IF auth.uid() = v_order.buyer_id THEN
    v_against := v_order.seller_id;
  ELSE
    v_against := v_order.buyer_id;
  END IF;

  -- Create dispute
  INSERT INTO public.disputes (
    order_id, initiated_by, against_user, reason, description, status
  ) VALUES (
    p_order_id, auth.uid(), v_against, p_reason, p_description, 'open'
  ) RETURNING id INTO v_dispute_id;

  -- Update order status
  UPDATE public.orders SET status = 'disputed' WHERE id = p_order_id;

  -- Update escrow status
  UPDATE public.escrow_transactions
    SET status = 'disputed'
    WHERE order_id = p_order_id AND status = 'held';

  -- Notify the other party
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    v_against, 'order',
    'Dispute Opened',
    'A dispute has been opened for one of your orders.',
    '/dashboard/seller/orders'
  );

  RETURN v_dispute_id;
END;
$$;


-- ============================================================
-- 6. REFUND ORDER — Admin refunds buyer (Security Definer)
-- ============================================================
CREATE OR REPLACE FUNCTION public.refund_order(
  p_order_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_escrow RECORD;
  v_caller_role TEXT;
BEGIN
  -- Verify caller is admin
  SELECT role INTO v_caller_role
    FROM public.profiles
    WHERE id = auth.uid();

  IF v_caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can process refunds';
  END IF;

  SELECT * INTO v_escrow
    FROM public.escrow_transactions
    WHERE order_id = p_order_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Escrow transaction not found';
  END IF;

  -- Refund escrow
  UPDATE public.escrow_transactions
    SET status = 'refunded', completed_at = NOW()
    WHERE id = v_escrow.id;

  -- Update order
  UPDATE public.orders SET status = 'refunded' WHERE id = p_order_id;

  -- Restore keys
  UPDATE public.listing_keys
    SET status = 'available', buyer_id = NULL, order_id = NULL, sold_at = NULL
    WHERE order_id = p_order_id;

  -- Restore stock
  UPDATE public.listings
    SET stock_count = stock_count + (
      SELECT quantity FROM public.orders WHERE id = p_order_id
    )
    WHERE id = (SELECT listing_id FROM public.orders WHERE id = p_order_id);

  -- Notify buyer
  INSERT INTO public.notifications (user_id, type, title, body, link)
  VALUES (
    v_escrow.buyer_id, 'payment',
    'Refund Processed',
    'Your refund of $' || v_escrow.amount || ' has been processed.',
    '/dashboard/buyer/orders'
  );
END;
$$;


-- ============================================================
-- 7. UPDATE SELLER RATING — Recalculate average rating
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.profiles
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE seller_id = NEW.seller_id
    )
    WHERE id = NEW.seller_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_seller_rating();


-- ============================================================
-- 8. ENABLE REALTIME — Subscribe to changes
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.escrow_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
