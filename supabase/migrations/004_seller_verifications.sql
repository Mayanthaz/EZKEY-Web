-- ============================================================
-- EZKEY Digital Marketplace - Seller Verification Sessions
-- Migration 004: Didit KYC audit trail
-- ============================================================

CREATE TABLE public.seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  didit_session_id TEXT NOT NULL UNIQUE,
  session_number INTEGER,
  workflow_id TEXT,
  workflow_version INTEGER,
  vendor_data TEXT,
  status TEXT NOT NULL DEFAULT 'Not Started',
  application_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (application_status IN ('pending', 'submitted', 'verified', 'rejected')),
  verification_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  provider_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  webhook_payload JSONB,
  raw_decision JSONB,
  last_webhook_event_id TEXT,
  last_webhook_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seller_verifications_user
  ON public.seller_verifications(user_id);

CREATE INDEX idx_seller_verifications_status
  ON public.seller_verifications(application_status);

CREATE INDEX idx_seller_verifications_created
  ON public.seller_verifications(user_id, created_at DESC);

ALTER TABLE public.seller_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own seller verifications"
  ON public.seller_verifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.seller_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
