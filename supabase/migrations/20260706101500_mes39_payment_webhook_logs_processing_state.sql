-- MES-39 (audit R2/R7 / backlog T2): Stripe webhook reliability.
--
-- payment_webhook_logs previously recorded only that an event was RECEIVED,
-- and stripe-webhook wrote that row before processing — so any first-attempt
-- failure short-circuited Stripe's retry (the retry hit the dedup check and
-- no-oped) and a paying user could end up charged but never upgraded.
--
-- This adds explicit processing state so:
--   * only 'processed'/'ignored' rows dedup retries,
--   * 'received'/'failed' rows are replayed by stripe-webhook-reconcile,
--   * 'needs_attention' rows (missing/invalid metadata — unfixable by retry)
--     are kept for manual replay and alerted to Slack.
--
-- APPROVAL-GATED (prod migration): prepared in the MES-39 PR; a human applies
-- it per docs/migrations.md. The new stripe-webhook code runs correctly both
-- before (legacy fallback: log-after-success) and after this is applied.

ALTER TABLE public.payment_webhook_logs
  ADD COLUMN IF NOT EXISTS event_type text,
  ADD COLUMN IF NOT EXISTS processing_status text NOT NULL DEFAULT 'received',
  ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS processed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_error text,
  -- Guards against duplicate confirmation emails: set once the confirmation
  -- email is sent; a reprocess/reconcile replay reads it and suppresses the
  -- resend (MES-39 review #6).
  ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false;

ALTER TABLE public.payment_webhook_logs
  DROP CONSTRAINT IF EXISTS payment_webhook_logs_processing_status_check;
ALTER TABLE public.payment_webhook_logs
  ADD CONSTRAINT payment_webhook_logs_processing_status_check
  CHECK (processing_status IN ('received', 'processed', 'failed', 'needs_attention', 'ignored'));

-- Historical rows predate state tracking. Every row that exists when this
-- migration applies was written by the OLD log-first flow, which inserted the
-- row only AFTER processing succeeded — so all pre-existing rows are genuinely
-- processed. Flip them all so the reconcile loop doesn't replay months of
-- history (and re-send confirmation emails). This runs once at apply; migrations
-- are not re-run, and the new webhook only starts writing genuine 'received'
-- rows AFTER this migration is live, so there is no in-flight 'received' row to
-- clobber here. (An earlier revision scoped this by a hardcoded timestamp, which
-- left old-flow rows written between that literal and the real apply time stuck
-- as 'received' — a concrete duplicate-email bug; hence the unconditional flip.)
UPDATE public.payment_webhook_logs
   SET processing_status = 'processed',
       processed_at = COALESCE(processed_at, created_at),
       email_sent = true
 WHERE processing_status = 'received';

-- Backfill event_type from the parsed payload where available.
UPDATE public.payment_webhook_logs
   SET event_type = parsed ->> 'eventType'
 WHERE event_type IS NULL
   AND parsed ? 'eventType';

-- The reconcile loop scans for unprocessed rows by age.
CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_unprocessed
  ON public.payment_webhook_logs (created_at)
  WHERE processing_status <> 'processed';

-- NOTE (not executed here): schedule the reconcile loop once this is applied,
-- e.g. via pg_cron + pg_net with the internal secret stored in Vault, mirroring
-- the kb-sync cron pattern:
--   select cron.schedule('stripe-webhook-reconcile', '*/15 * * * *', $$ ... $$);
-- See the MES-39 PR description for the full snippet and secret plumbing.
