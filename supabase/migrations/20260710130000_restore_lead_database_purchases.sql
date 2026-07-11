-- MES-111 P1: restore lead-purchase entitlement (AUD-006) + close the
-- over-permissive lead_database_records read (AUD-001).
--
-- The lead_database_purchases table and the purchase-scoped RLS on
-- lead_database_records existed only in migrations_archive/20260228000001 and
-- were dropped by the 2026-07-04 re-baseline — they are absent from prod. As a
-- result the stripe-webhook upserts a non-existent table (error swallowed →
-- buyers charged, entitlement lost) and every authenticated user can read all
-- lead_database_records via a `USING (true)` policy.
--
-- This migration recreates the entitlement table + policies and replaces the
-- permissive records policy with preview-only + buyer-scoped reads. It does NOT
-- re-seed lead_databases (those rows already exist in prod). Applies via the
-- PR/merge flow only; idempotent for preview-branch replays.

----------------------------------------------------------------------
-- 1. Entitlement table (records completed Stripe lead-database purchases)
----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.lead_database_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  lead_database_id uuid NOT NULL REFERENCES public.lead_databases(id),
  stripe_session_id text,
  purchased_at timestamptz DEFAULT now(),
  UNIQUE (user_id, lead_database_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_database_purchases_user
  ON public.lead_database_purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_lead_database_purchases_user_db
  ON public.lead_database_purchases (user_id, lead_database_id);

ALTER TABLE public.lead_database_purchases ENABLE ROW LEVEL SECURITY;

-- Writes are service-role only (the stripe-webhook records purchases). No anon/
-- authenticated write grants are added; buyers only read their own rows.
DO $$ BEGIN
  CREATE POLICY "Users view own purchases"
    ON public.lead_database_purchases
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admins manage purchases"
    ON public.lead_database_purchases
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'::app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

----------------------------------------------------------------------
-- 2. lead_database_records: replace the `USING (true)` read (AUD-001) with
--    preview-only public reads + buyer-scoped reads for purchased records.
----------------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated can view lead database records"
  ON public.lead_database_records;

DO $$ BEGIN
  CREATE POLICY "Anyone can view preview lead database records"
    ON public.lead_database_records
    FOR SELECT
    USING (is_preview = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Buyers can view purchased lead database records"
    ON public.lead_database_records
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1
        FROM public.lead_database_purchases p
        WHERE p.user_id = (SELECT auth.uid())
          AND p.lead_database_id = lead_database_records.lead_database_id
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
