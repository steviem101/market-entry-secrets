-- PERF-01a: index the 10 unindexed foreign keys flagged by the performance advisor,
-- and drop the duplicate index on agency_contacts (idx_agency_contacts_agency is
-- identical to idx_agency_contacts_agency_id).
--
-- Some of these tables are created outside the repo migrations in production (absent on
-- fresh databases / preview branches), and some repo-created tables have drifted column
-- names vs production. Each index is therefore guarded on BOTH table and column
-- existence, so the migration is a safe no-op wherever the target doesn't match. Idempotent.

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT * FROM (VALUES
      ('idx_ai_chat_conversations_user_id', 'ai_chat_conversations', 'user_id'),
      ('idx_ai_chat_messages_conversation_id', 'ai_chat_messages', 'conversation_id'),
      ('idx_country_case_studies_content_item_id', 'country_case_studies', 'content_item_id'),
      ('idx_ii_experiment_outputs_content_id', 'ii_experiment_outputs', 'content_id'),
      ('idx_intake_form_events_user_id', 'intake_form_events', 'user_id'),
      ('idx_service_provider_contacts_service_provider_id', 'service_provider_contacts', 'service_provider_id'),
      ('idx_service_provider_reviews_service_provider_id', 'service_provider_reviews', 'service_provider_id'),
      ('idx_user_intake_forms_user_id', 'user_intake_forms', 'user_id'),
      ('idx_user_reports_intake_form_id', 'user_reports', 'intake_form_id'),
      ('idx_user_reports_user_id', 'user_reports', 'user_id')
    ) AS t(idx, tbl, col)
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = r.tbl AND column_name = r.col
    ) THEN
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(%I)', r.idx, r.tbl, r.col);
    END IF;
  END LOOP;
END $$;

DROP INDEX IF EXISTS public.idx_agency_contacts_agency;
