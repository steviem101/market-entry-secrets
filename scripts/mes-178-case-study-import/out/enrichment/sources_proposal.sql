-- MES-178 follow-up (audit W2): STAGED sources_markdown -> case_study_sources.
-- NOT APPLIED. Review out/enrichment/sources-review.md first (labels for bare
-- URLs are domain placeholders; prose-only references without a URL are NOT
-- included and need an editorial URL). Apply via the reviewed service-role path.
-- Additive insert-only: skips URLs already present, numbers after the current
-- max; existing citations are never deleted (editorial removes stale ones).

-- netflix-streaming-australia-launch (fill: +7 URL-bearing sources, additive)
BEGIN;
INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)
SELECT (SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch' AND content_type = 'case_study'), v.label, v.url, v.source_type,
       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = (SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch' AND content_type = 'case_study')), 0) + v.ord
FROM (VALUES
      ('theguardian.com', 'https://www.theguardian.com/tv-and-radio/2015/jan/26/fairfax-and-nines-streaming-service-stan-launches-ahead-of-netflix-arrival', 'news', 1),
      ('smh.com.au', 'https://www.smh.com.au/entertainment/tv-and-radio/netflix-australian-launch-subscription-prices-reveal-plans-to-undercut-rivals-stan-presto-20150323-1m576r.html', 'news', 2),
      ('theguardian.com', 'https://www.theguardian.com/media/2014/nov/19/netflix-says-it-will-launch-in-australia-and-new-zealand-in-march-2015', 'news', 3),
      ('jtde.telsoc.org', 'https://jtde.telsoc.org/index.php/jtde/article/view/13', 'other', 4),
      ('theconversation.com', 'https://theconversation.com/how-netflix-has-shaped-and-shattered-our-content-landscape-over-the-past-decade-and-what-comes-next-251471', 'news', 5),
      ('smh.com.au', 'https://www.smh.com.au/business/companies/netflix-sets-up-australian-outpost-as-streaming-battle-intensifies-20190607-p51vfq.html', 'news', 6),
      ('mediaweek.com.au', 'https://www.mediaweek.com.au/netflix-celebrates-a-decade-of-aussie-storytelling-with-new-sydney-office/', 'other', 7)
) AS v(label, url, source_type, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = (SELECT id FROM public.content_items WHERE slug = 'netflix-streaming-australia-launch' AND content_type = 'case_study') AND cs.url = v.url);
COMMIT;

-- afterpay-buy-now-pay-later-revolution (fill: +2 URL-bearing sources, additive)
BEGIN;
INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)
SELECT (SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution' AND content_type = 'case_study'), v.label, v.url, v.source_type,
       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = (SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution' AND content_type = 'case_study')), 0) + v.ord
FROM (VALUES
      ('en.wikipedia.org', 'https://en.wikipedia.org/wiki/Afterpay', 'other', 1),
      ('Wikipedia, Nick Molnar (eBay jewellery, iceonline.com.au)', 'http://iceonline.com.au', 'other', 2)
) AS v(label, url, source_type, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = (SELECT id FROM public.content_items WHERE slug = 'afterpay-buy-now-pay-later-revolution' AND content_type = 'case_study') AND cs.url = v.url);
COMMIT;

-- secretlab-anz-market-entry (replace: +5 URL-bearing sources, additive)
BEGIN;
INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)
SELECT (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study'), v.label, v.url, v.source_type,
       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study')), 0) + v.ord
FROM (VALUES
      ('edb.gov.sg', 'https://www.edb.gov.sg/en/business-insights/insights/singapore-brands-going-overseas-levelling-the-playing-field.html', 'government', 1),
      ('secretlab.sg', 'https://secretlab.sg/pages/about-us', 'other', 2),
      ('enterprisesg.gov.sg', 'https://www.enterprisesg.gov.sg/resources/inspiring-stories/secretlab', 'government', 3),
      ('en.wikipedia.org', 'https://en.wikipedia.org/wiki/Secretlab', 'other', 4),
      ('businesstimes.com.sg', 'https://www.businesstimes.com.sg/garage/game-on-secretlab-goes-from-startup-to-global-brand-in-5-years', 'news', 5)
) AS v(label, url, source_type, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = (SELECT id FROM public.content_items WHERE slug = 'secretlab-anz-market-entry' AND content_type = 'case_study') AND cs.url = v.url);
COMMIT;

-- shopback-anz-market-entry (replace: +5 URL-bearing sources, additive)
BEGIN;
INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)
SELECT (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study'), v.label, v.url, v.source_type,
       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study')), 0) + v.ord
FROM (VALUES
      ('afr.com', 'https://www.afr.com/technology/asian-ecommerce-star-targets-australia-as-shopback-raises-32m-20171105-gzf781', 'news', 1),
      ('corporate.shopback.com', 'https://corporate.shopback.com/about', 'other', 2),
      ('en.wikipedia.org', 'https://en.wikipedia.org/wiki/ShopBack', 'other', 3),
      ('junction.cj.com', 'https://junction.cj.com/article/expand-your-reach-in-diverse-markets-with-shopback', 'other', 4),
      ('https://www.edb.gov.sg (ShopBack profile)', 'https://www.edb.gov.sg', 'government', 5)
) AS v(label, url, source_type, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = (SELECT id FROM public.content_items WHERE slug = 'shopback-anz-market-entry' AND content_type = 'case_study') AND cs.url = v.url);
COMMIT;

-- starbucks-australia-market-entry (replace: +1 URL-bearing sources, additive)
BEGIN;
INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)
SELECT (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study'), v.label, v.url, v.source_type,
       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study')), 0) + v.ord
FROM (VALUES
      ('sciencedirect.com', 'https://www.sciencedirect.com/science/article/abs/pii/S1441358209000949', 'other', 1)
) AS v(label, url, source_type, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = (SELECT id FROM public.content_items WHERE slug = 'starbucks-australia-market-entry' AND content_type = 'case_study') AND cs.url = v.url);
COMMIT;

-- masters-australia-market-entry (replace: +1 URL-bearing sources, additive)
BEGIN;
INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)
SELECT (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study'), v.label, v.url, v.source_type,
       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study')), 0) + v.ord
FROM (VALUES
      ('en.wikipedia.org', 'https://en.wikipedia.org/wiki/Masters_Home_Improvement', 'other', 1)
) AS v(label, url, source_type, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = (SELECT id FROM public.content_items WHERE slug = 'masters-australia-market-entry' AND content_type = 'case_study') AND cs.url = v.url);
COMMIT;

-- ola-australia-market-entry (replace: +0 URL-bearing sources, additive)
BEGIN;
  -- no URL-bearing references parsed; all need an editorial URL (see review doc)
COMMIT;

-- topshop-australia-market-entry (replace: +1 URL-bearing sources, additive)
BEGIN;
INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)
SELECT (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study'), v.label, v.url, v.source_type,
       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study')), 0) + v.ord
FROM (VALUES
      ('en.wikipedia.org', 'https://en.wikipedia.org/wiki/Topshop', 'other', 1)
) AS v(label, url, source_type, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = (SELECT id FROM public.content_items WHERE slug = 'topshop-australia-market-entry' AND content_type = 'case_study') AND cs.url = v.url);
COMMIT;

-- wework-australia-market-entry (replace: +4 URL-bearing sources, additive)
BEGIN;
INSERT INTO public.case_study_sources (case_study_id, label, url, source_type, citation_number)
SELECT (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study'), v.label, v.url, v.source_type,
       COALESCE((SELECT max(citation_number) FROM public.case_study_sources WHERE case_study_id = (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study')), 0) + v.ord
FROM (VALUES
      ('startupdaily.net', 'https://www.startupdaily.net/topic/wework-sydney-martin-place/', 'other', 1),
      ('content.knightfrank.com', 'https://content.knightfrank.com/research/1161/documents/en/resinsight161024-4197.pdf', 'other', 2),
      ('coworkingmag.com', 'https://coworkingmag.com/news/wework-is-coming-to-perth-at-central-park-tower-this-year/', 'other', 3),
      ('ework.com', 'https://www.wework.com/l/office-space/sydney--NSW', 'other', 4)
) AS v(label, url, source_type, ord)
WHERE NOT EXISTS (SELECT 1 FROM public.case_study_sources cs WHERE cs.case_study_id = (SELECT id FROM public.content_items WHERE slug = 'wework-australia-market-entry' AND content_type = 'case_study') AND cs.url = v.url);
COMMIT;
