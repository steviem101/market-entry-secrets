-- Content-library tidy (MES-182 follow-up, audit §8.4): remove the three
-- content_categories rows that have never had content. Guarded: a row is only
-- deleted while it still has zero content_items referencing it, so the delete
-- self-cancels if content lands in one of these categories before this applies.
-- Empty-preview-DB safe (0 rows). Owner-approved 2026-07-17.
--
-- Rollback (re-insert; ids will differ, nothing references them):
--   ('Video Tutorials','video-tutorials','Visual guides and walkthroughs for market entry','Play','text-orange-600',5)
--   ('E-commerce Giants','e-commerce-giants','Online retail success stories in the Australian market','TrendingUp','text-blue-600',8)
--   ('Healthcare Innovation','healthcare-innovation','Medical and health tech companies in Australia','TrendingUp','text-red-600',9)

DELETE FROM public.content_categories cc
WHERE cc.slug IN ('video-tutorials', 'e-commerce-giants', 'healthcare-innovation')
  AND NOT EXISTS (
    SELECT 1 FROM public.content_items ci WHERE ci.category_id = cc.id
  );
