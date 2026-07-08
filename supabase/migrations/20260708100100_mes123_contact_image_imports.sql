-- MES-123 — Contact profile images (part 2/3): auditable staging table.
--
-- Proposal-before-write ingestion for the import-contact-images edge function. One row per
-- CSV line per batch. Admin-read only; all writes are service-role (the function). No client
-- writes, ever. Mirrors the directory-data-enrichment staged-workflow pattern.
--
-- Rollback: table is standalone and referenced by nothing; TRUNCATE or DROP is safe.

CREATE TABLE IF NOT EXISTS public.contact_image_imports (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id                 text NOT NULL,
  source                   text,                    -- 'lemlist' | 'phantombuster' | 'auto'
  photo_source             text,                    -- provenance for takedown, e.g. 'linkedin:lemlist'
  raw_row                  jsonb,                    -- verbatim CSV row (audit copy)
  full_name                text,
  email                    text,
  company                  text,
  linkedin_url             text,
  linkedin_url_normalized  text,                    -- canonical linkedin.com/in/<slug>
  image_url                text,                    -- source (LinkedIn CDN) URL — ingestion input only
  matched_table            text,
  matched_record_id        text,                    -- row id, or "<parent_id>:<contact_id>" for JSONB contacts
  match_method             text,                    -- 'linkedin' | 'email' | 'name_org'
  content_hash             text,
  storage_path             text,
  storage_url              text,                    -- permanent avatars-bucket URL written to the record
  -- needs_review: held pending a human decision — name-only matches (no LinkedIn/email key) and
  -- cold-scraped surfaces (agency/investor contacts) are NEVER auto-written; an admin re-runs with
  -- an explicit approval flag to apply them.
  status                   text NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','matched','needs_review','uploaded','failed','skipped')),
  error                    text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.contact_image_imports IS
  'MES-123 staging/audit trail for the import-contact-images pipeline. Admin-read, service-role-write only. One row per CSV line per batch; status drives resumable batch processing.';

CREATE INDEX IF NOT EXISTS idx_contact_image_imports_batch_status
  ON public.contact_image_imports (batch_id, status);
CREATE INDEX IF NOT EXISTS idx_contact_image_imports_linkedin_norm
  ON public.contact_image_imports (linkedin_url_normalized);

-- Lock down grants (SEC-01/02/03): no anon/authenticated writes; service-role does everything;
-- admins read via RLS below.
ALTER TABLE public.contact_image_imports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.contact_image_imports FROM anon, authenticated;
GRANT  SELECT ON public.contact_image_imports TO authenticated;   -- gated further by RLS (admin only)
GRANT  ALL    ON public.contact_image_imports TO service_role;

-- Admin-only read; no client INSERT/UPDATE/DELETE policy exists, so those are denied for
-- anon/authenticated regardless. Service-role bypasses RLS for the function's writes.
CREATE POLICY "Admins can read contact image imports"
  ON public.contact_image_imports
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
