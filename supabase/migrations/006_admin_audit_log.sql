-- ============================================================
-- EZKEY Digital Marketplace - Admin Audit Log
-- Migration 006: Records every state-changing action taken in the admin panel.
-- Written only by the Spring Boot backend (service role). RLS is enabled with
-- no policies, so regular users/anon can never read or write it.
-- ============================================================

CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_admin_audit_log_admin ON public.admin_audit_log(admin_id);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Creating the first admin (run manually in the Supabase SQL editor).
-- The user must already exist (sign up normally with email + password):
--
--   UPDATE public.profiles SET role = 'admin'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'you@example.com');
-- ------------------------------------------------------------
