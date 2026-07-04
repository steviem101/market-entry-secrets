-- Migration 002: Add persona relevance tags to content tables
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS target_personas text[] DEFAULT '{}';

ALTER TABLE public.content_bodies
  ADD COLUMN IF NOT EXISTS target_personas text[] DEFAULT '{}';

ALTER TABLE public.user_reports
  ADD COLUMN IF NOT EXISTS target_personas text[] DEFAULT '{}';

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS target_personas text[] DEFAULT '{}';

ALTER TABLE public.content_company_profiles
  ADD COLUMN IF NOT EXISTS target_personas text[] DEFAULT '{}';

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS target_personas text[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_content_items_personas
  ON public.content_items USING GIN (target_personas);
CREATE INDEX IF NOT EXISTS idx_content_bodies_personas
  ON public.content_bodies USING GIN (target_personas);
CREATE INDEX IF NOT EXISTS idx_user_reports_personas
  ON public.user_reports USING GIN (target_personas);
CREATE INDEX IF NOT EXISTS idx_events_personas
  ON public.events USING GIN (target_personas);
CREATE INDEX IF NOT EXISTS idx_company_profiles_personas
  ON public.content_company_profiles USING GIN (target_personas);
CREATE INDEX IF NOT EXISTS idx_testimonials_personas
  ON public.testimonials USING GIN (target_personas);
