-- Corrective fix for 20260621140000_add_japan_korea_france_country_faqs.sql.
-- That migration wrote FAQ answers inside dollar-quoted ($faq$...$faq$) strings but
-- doubled the apostrophes (Australia''s, Japan''s, France''s, d''Impot) as if they were
-- single-quoted literals - inside dollar quotes '' is two literal characters, so the
-- answers rendered with visible double apostrophes. It also stated the employer
-- Super Guarantee as "11.5%, rising to 12%", which is stale: the rate reached its
-- final 12% on 1 July 2025. This migration repairs both, plus restores the accents in
-- France's "Credit d'Impot Recherche".
--
-- Forward-only and idempotent (replace() is a no-op once the text is already clean);
-- already applied to prod via the equivalent hotfix. Scope: the three countries added
-- by the prior migration only. The original migration file is left unchanged (its
-- dollar-quoting bug is corrected forward here rather than by editing an applied file).

-- 1. Collapse the doubled apostrophes back to single.
UPDATE public.country_faqs SET answer = replace(answer, '''''', '''')
WHERE country_id IN (SELECT id FROM public.countries WHERE slug IN ('japan','south-korea','france'))
  AND answer LIKE '%''''%';

-- 2. Restore accents in France's R&D answer (after step 1 normalised the apostrophe).
UPDATE public.country_faqs SET answer = replace(answer, 'Credit d''Impot Recherche', 'Crédit d''Impôt Recherche')
WHERE country_id IN (SELECT id FROM public.countries WHERE slug='france')
  AND answer LIKE '%Credit d''Impot Recherche%';

-- 3. Refresh the stale Super Guarantee figure (12% since 1 July 2025).
UPDATE public.country_faqs SET answer = replace(answer, '11.5%, rising to 12%', '12%')
WHERE country_id IN (SELECT id FROM public.countries WHERE slug IN ('japan','south-korea','france'))
  AND answer LIKE '%11.5%, rising to 12%%';
