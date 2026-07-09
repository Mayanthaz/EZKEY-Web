-- ============================================================
-- EZKEY Digital Marketplace - Didit Webhook Event Log
-- Migration 005: Idempotent webhook audit trail
-- ============================================================

CREATE TABLE public.didit_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idempotency_key TEXT NOT NULL UNIQUE,
  event_id TEXT,
  webhook_type TEXT NOT NULL,
  session_id TEXT,
  business_session_id TEXT,
  session_kind TEXT,
  status TEXT,
  signature_method TEXT NOT NULL,
  timestamp TIMESTAMPTZ,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_body TEXT NOT NULL,
  headers JSONB NOT NULL DEFAULT '{}'::jsonb,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processed', 'ignored', 'failed')),
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_didit_webhook_events_event_id
  ON public.didit_webhook_events(event_id);

CREATE INDEX idx_didit_webhook_events_session_id
  ON public.didit_webhook_events(session_id);

CREATE INDEX idx_didit_webhook_events_webhook_type
  ON public.didit_webhook_events(webhook_type);

CREATE INDEX idx_didit_webhook_events_received_at
  ON public.didit_webhook_events(received_at DESC);

ALTER TABLE public.didit_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.didit_webhook_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();