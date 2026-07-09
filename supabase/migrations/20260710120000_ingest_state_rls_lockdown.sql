-- MES-111 P1 (AUD-003): lock down public.ingest_state.
--
-- The table has RLS DISABLED and anon/authenticated hold full
-- INSERT/UPDATE/DELETE/TRUNCATE grants — an out-of-band artifact present in no
-- prior migration. Anyone with the public anon key can read, corrupt, or
-- TRUNCATE the event-ingestion cursor (data-integrity / DoS). The ingest
-- pipeline (ingest-events / normalize-events) uses the service role, which
-- bypasses RLS and retains its own grants, so ingestion is unaffected.
--
-- Note: AUD-002 (investors) and the investors_public masking are already
-- handled by 20260706102500_mes56_pii_read_exposure_lockdown — deliberately not
-- repeated here. Applies via the PR/merge flow only; idempotent for replays.

ALTER TABLE public.ingest_state ENABLE ROW LEVEL SECURITY;

-- No policies are created → deny-all for anon/authenticated (service_role
-- bypasses RLS). Also revoke the leftover default grants so table privileges
-- and RLS agree.
REVOKE ALL ON TABLE public.ingest_state FROM anon;
REVOKE ALL ON TABLE public.ingest_state FROM authenticated;
