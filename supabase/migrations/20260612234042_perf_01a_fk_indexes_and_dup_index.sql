-- PERF-01a: index the 10 unindexed foreign keys flagged by the performance advisor,
-- and drop the duplicate index on agency_contacts (idx_agency_contacts_agency is
-- identical to idx_agency_contacts_agency_id). Idempotent.

CREATE INDEX IF NOT EXISTS idx_ai_chat_conversations_user_id ON public.ai_chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_conversation_id ON public.ai_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_country_case_studies_content_item_id ON public.country_case_studies(content_item_id);
CREATE INDEX IF NOT EXISTS idx_ii_experiment_outputs_content_id ON public.ii_experiment_outputs(content_id);
CREATE INDEX IF NOT EXISTS idx_intake_form_events_user_id ON public.intake_form_events(user_id);
CREATE INDEX IF NOT EXISTS idx_service_provider_contacts_service_provider_id ON public.service_provider_contacts(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_service_provider_reviews_service_provider_id ON public.service_provider_reviews(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_user_intake_forms_user_id ON public.user_intake_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_intake_form_id ON public.user_reports(intake_form_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON public.user_reports(user_id);

DROP INDEX IF EXISTS public.idx_agency_contacts_agency;
