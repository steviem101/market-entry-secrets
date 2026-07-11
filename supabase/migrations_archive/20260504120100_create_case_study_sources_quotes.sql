-- =============================================================================
-- Create case_study_sources and case_study_quotes tables (Tier B).
--
-- - case_study_sources: numbered citation list rendered at the bottom of each
--   case study, plus inline [n] markers in body prose.
-- - case_study_quotes:  pull-quote callouts injected mid-body, anchored to a
--   section.
--
-- RLS pattern mirrors content_items / content_sections / content_bodies:
--   * `TO public USING (true|filter)` for SELECT.
--   * No INSERT/UPDATE/DELETE policies — service_role bypasses RLS for backfill.
--
-- Trigger pattern mirrors the same tables: handle_updated_at() (already
-- defined project-wide). The moddatetime extension is not installed.
-- =============================================================================

CREATE TABLE public.case_study_sources (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id   uuid NOT NULL
    REFERENCES public.content_items(id) ON DELETE CASCADE,
  section_id      uuid
    REFERENCES public.content_sections(id) ON DELETE SET NULL,
  label           text NOT NULL,
  url             text NOT NULL,
  accessed_at     date,
  source_type     text,
  citation_number int,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT case_study_sources_unique_url
    UNIQUE (case_study_id, url),
  CONSTRAINT case_study_sources_source_type_check
    CHECK (source_type IS NULL OR source_type IN (
      'news', 'company_blog', 'sec_filing', 'interview', 'linkedin',
      'podcast', 'press_release', 'government', 'academic', 'other'
    ))
);

CREATE INDEX case_study_sources_case_study_idx
  ON public.case_study_sources(case_study_id);

CREATE INDEX case_study_sources_section_idx
  ON public.case_study_sources(section_id);

CREATE TABLE public.case_study_quotes (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id uuid NOT NULL
    REFERENCES public.content_items(id) ON DELETE CASCADE,
  section_id    uuid
    REFERENCES public.content_sections(id) ON DELETE SET NULL,
  quote         text NOT NULL,
  attributed_to text NOT NULL,
  role          text,
  source_url    text,
  source_label  text,
  display_order int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT case_study_quotes_unique_position
    UNIQUE (case_study_id, attributed_to, display_order)
);

CREATE INDEX case_study_quotes_case_study_idx
  ON public.case_study_quotes(case_study_id);

CREATE INDEX case_study_quotes_section_idx
  ON public.case_study_quotes(section_id);

-- updated_at triggers (mirrors content_items / content_sections / content_bodies)
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.case_study_sources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.case_study_quotes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.case_study_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_study_quotes  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view case study sources"
  ON public.case_study_sources FOR SELECT
  TO public USING (true);

CREATE POLICY "Public can view case study quotes"
  ON public.case_study_quotes FOR SELECT
  TO public USING (true);

-- =============================================================================
-- Down-migration
-- =============================================================================
-- DROP TABLE public.case_study_quotes;
-- DROP TABLE public.case_study_sources;
