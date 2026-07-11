-- Extends country-corridor coverage (setup_compliance report section + /countries pages)
-- to the three uncovered source countries that appear in intake demand: Japan (12
-- intakes), South Korea (4), France (1). Each gets a countries row + a 12-question FAQ
-- set mirroring the existing IE/SG/UK/US/CA template.
--
-- Australia-side facts (Pty Ltd resident director, Director ID 4-6 wks, 482 visa, GST
-- 10% / A$75k threshold, R&D 43.5% refundable under A$20M, super 11.5%->12%) are kept
-- consistent with the vetted Singapore answers. Country-specific facts (FTA status,
-- tax-treaty withholding, home export body, home VAT/consumption tax) were web-verified
-- (Jun 2026): JAEPA in force 2015; KAFTA in force 2014; FRANCE has NO bilateral FTA -
-- the EU-Australia FTA was concluded Mar 2026 but is not yet in force.
--
-- NOTE: AI-drafted from public sources for review; have an adviser confirm before
-- treating the tax/visa specifics as authoritative.
--
-- Pure data change: the generate-report function fetches countries + country_faqs by
-- country_id at runtime (no redeploy needed) and /countries is data-driven.
-- Idempotent (WHERE NOT EXISTS on slug / per-country FAQ presence).
-- Revert: DELETE FROM public.country_faqs WHERE country_id IN
--           (SELECT id FROM public.countries WHERE slug IN ('japan','south-korea','france'));
--         DELETE FROM public.countries WHERE slug IN ('japan','south-korea','france');

-- ============================== JAPAN ==============================
INSERT INTO public.countries
  (name, slug, description, hero_title, hero_description, trade_relationship_strength,
   economic_indicators, key_industries, keywords, content_keywords, service_keywords,
   event_keywords, lead_keywords, featured, sort_order)
SELECT 'Japan', 'japan',
  'Japan is one of Australia''s largest trading partners and a major source of investment. Japanese companies entering Australia benefit from the JAEPA free trade agreement, deep resources and energy ties, and support from JETRO (the Japan External Trade Organization).',
  'Japanese Companies in Australia',
  'How Japanese businesses leverage JAEPA, deep bilateral trade ties, and JETRO support to establish and scale in Australia.',
  'Strong',
  $json${"gdp":"$4.2T","population":"124M","major_exports":["Automobiles","Machinery","Electronics"],"trade_volume_aud":"$123B"}$json$::jsonb,
  ARRAY['Automotive','Manufacturing','Technology','Energy & Resources','Financial Services']::text[],
  ARRAY['japan','japanese','jetro','jaepa','asia pacific']::text[],
  ARRAY['japan','japanese','jetro']::text[],
  ARRAY['japan','japanese','jetro']::text[],
  ARRAY['japan','japanese','jetro']::text[],
  ARRAY['japan','japanese','jetro']::text[],
  true, 6
WHERE NOT EXISTS (SELECT 1 FROM public.countries WHERE slug='japan');

INSERT INTO public.country_faqs (country_id, sort_order, question, answer)
SELECT (SELECT id FROM public.countries WHERE slug='japan'), v.so, v.q, v.a
FROM (VALUES
  (1, $faq$Do I need an Australian director to incorporate a Pty Ltd?$faq$,
      $faq$Yes. ASIC requires at least one director who is ordinarily resident in Australia. A Japanese kabushiki kaisha (KK) parent cannot itself satisfy this, so most founders second a senior employee on a visa, hire a local country manager early, or appoint a trusted resident director through a corporate services firm.$faq$),
  (2, $faq$How does the JAEPA free trade agreement help my expansion?$faq$,
      $faq$The Japan-Australia Economic Partnership Agreement (in force since 15 January 2015) progressively eliminates tariffs on the large majority of goods trade, with further cuts phasing in toward 2034, alongside investment and services commitments. Japan and Australia are also both parties to the CPTPP and RCEP, which add regional rules of origin and services access useful for manufacturers and tech firms.$faq$),
  (3, $faq$Should I incorporate as a Pty Ltd or open an Australian branch?$faq$,
      $faq$For most operating businesses the default is an Australian Pty Ltd. A registered foreign-company branch exposes the Japanese parent directly to Australian tax and reporting on the Australian activity. The Pty Ltd ring-fences Australian liability and is what unlocks the R&D Tax Incentive.$faq$),
  (4, $faq$What is the ASIC Director ID and how do I get one as a Japanese founder?$faq$,
      $faq$The Director ID is a mandatory unique identifier ASIC issues to every company director. Non-resident directors verify identity through a paper-based process with certified documents, which typically takes 4 to 6 weeks. Start this before incorporation to avoid delays.$faq$),
  (5, $faq$What is the best visa route for the first employee I send from Japan?$faq$,
      $faq$The Subclass 482 Skills in Demand visa is the usual path for sending an existing Japanese team member to Australia for up to 4 years; the role must be on the relevant skilled occupation list and the Pty Ltd must be an approved sponsor. For short-term projects the Subclass 400 is faster.$faq$),
  (6, $faq$How does Australian GST compare to Japanese consumption tax?$faq$,
      $faq$Australian GST is 10%, broadly comparable to Japan''s 10% consumption tax, and you must register once Australian turnover exceeds A$75,000. Most B2B companies register voluntarily from day one to claim input credits.$faq$),
  (7, $faq$Can I claim the R&D Tax Incentive as a Japanese-founded Pty Ltd?$faq$,
      $faq$Yes, provided the R&D activity is conducted in Australia and the Pty Ltd owns the resulting IP or has a written agreement to do so. Companies with aggregated turnover under A$20 million receive a 43.5% refundable tax offset, often more generous than comparable Japanese support.$faq$),
  (8, $faq$How long does ABN and TFN registration take from Japan?$faq$,
      $faq$An ABN is typically issued within 1 to 14 days and a TFN can take up to 28 days. For non-resident directors the Director ID step adds 4 to 6 weeks, so begin with that.$faq$),
  (9, $faq$What lessons should I take from Japanese companies in Australia?$faq$,
      $faq$Japan has decades of successful investment in Australian resources, energy, and automotive distribution, but the 2017 closure of local car manufacturing (Toyota and others) showed that high operating and labour costs can make Australian production uncompetitive. The lesson: pressure-test your Australian cost base and pick the activities - sales, services, assembly - that genuinely fit the market.$faq$),
  (10, $faq$How do I open an Australian bank account from Japan?$faq$,
      $faq$CommBank, NAB, and Westpac support remote account opening for an incorporated Pty Ltd, though identity verification of overseas directors is slow. Multi-currency providers such as Wise Business or Airwallex are often faster to get operational while the main account is set up.$faq$),
  (11, $faq$What are the tax implications of paying dividends from the AU Pty Ltd back to Japan?$faq$,
      $faq$The Australia-Japan tax convention reduces withholding on dividends, interest (10%), and royalties (10%) below domestic rates, with reduced or nil rates available for qualifying inter-company dividends. Franking credits do not flow to Japanese shareholders. Get tax advice before declaring dividends.$faq$),
  (12, $faq$How do Fair Work obligations differ from Japanese employment law?$faq$,
      $faq$Australia''s National Employment Standards plus industry modern awards set minimum pay and conditions, and unfair-dismissal protections are strong. Mandatory employer superannuation (11.5%, rising to 12%) is an additional on-cost. The lifetime-employment and seniority norms common in Japan have no legal force in Australia - get local advice on contracts.$faq$)
) AS v(so, q, a)
WHERE NOT EXISTS (
  SELECT 1 FROM public.country_faqs f JOIN public.countries c ON c.id=f.country_id WHERE c.slug='japan'
);

-- ============================== SOUTH KOREA ==============================
INSERT INTO public.countries
  (name, slug, description, hero_title, hero_description, trade_relationship_strength,
   economic_indicators, key_industries, keywords, content_keywords, service_keywords,
   event_keywords, lead_keywords, featured, sort_order)
SELECT 'South Korea', 'south-korea',
  'South Korea is a major trade and investment partner for Australia, supported by the KAFTA free trade agreement and KOTRA (the Korea Trade-Investment Promotion Agency). Korean companies span electronics, automotive, steel, and increasingly clean energy and technology.',
  'South Korean Companies in Australia',
  'How Korean businesses use KAFTA, strong bilateral trade, and KOTRA support to enter and grow in the Australian market.',
  'Strong',
  $json${"gdp":"$1.7T","population":"51.7M","major_exports":["Electronics","Automobiles","Steel","Petrochemicals"],"trade_volume_aud":"$64B"}$json$::jsonb,
  ARRAY['Electronics','Automotive','Steel & Metals','Clean Energy','Technology']::text[],
  ARRAY['south korea','korea','korean','kotra','kafta','asia pacific']::text[],
  ARRAY['south korea','korea','korean','kotra']::text[],
  ARRAY['south korea','korea','korean','kotra']::text[],
  ARRAY['south korea','korea','korean','kotra']::text[],
  ARRAY['south korea','korea','korean','kotra']::text[],
  false, 7
WHERE NOT EXISTS (SELECT 1 FROM public.countries WHERE slug='south-korea');

INSERT INTO public.country_faqs (country_id, sort_order, question, answer)
SELECT (SELECT id FROM public.countries WHERE slug='south-korea'), v.so, v.q, v.a
FROM (VALUES
  (1, $faq$Do I need an Australian director to incorporate a Pty Ltd?$faq$,
      $faq$Yes. ASIC requires at least one director who is ordinarily resident in Australia. Korean parent companies typically second an employee on a visa, hire a local country manager early, or appoint a trusted resident director through a corporate services firm.$faq$),
  (2, $faq$How does the KAFTA free trade agreement help my expansion?$faq$,
      $faq$The Korea-Australia Free Trade Agreement (in force since 12 December 2014) eliminates or reduces tariffs across most goods and includes services, investment, and investor-protection commitments. Korea and Australia are also both parties to RCEP, which adds common regional rules of origin useful for manufacturers and electronics firms.$faq$),
  (3, $faq$Should I incorporate as a Pty Ltd or open an Australian branch?$faq$,
      $faq$For most operating businesses the default is an Australian Pty Ltd. A registered foreign-company branch exposes the Korean parent directly to Australian tax and reporting on the Australian activity. The Pty Ltd ring-fences Australian liability and is what unlocks the R&D Tax Incentive.$faq$),
  (4, $faq$What is the ASIC Director ID and how do I get one as a Korean founder?$faq$,
      $faq$The Director ID is a mandatory unique identifier ASIC issues to every company director. Non-resident directors verify identity through a paper-based process with certified documents, which typically takes 4 to 6 weeks. Start this before incorporation to avoid delays.$faq$),
  (5, $faq$What is the best visa route for the first employee I send from Korea?$faq$,
      $faq$The Subclass 482 Skills in Demand visa is the usual path for sending an existing Korean team member to Australia for up to 4 years; the role must be on the relevant skilled occupation list and the Pty Ltd must be an approved sponsor. For short-term projects the Subclass 400 is faster.$faq$),
  (6, $faq$How does Australian GST compare to Korean VAT?$faq$,
      $faq$Australian GST is 10%, the same headline rate as Korea''s VAT, and you must register once Australian turnover exceeds A$75,000. Most B2B companies register voluntarily from day one to claim input credits.$faq$),
  (7, $faq$Can I claim the R&D Tax Incentive as a Korean-founded Pty Ltd?$faq$,
      $faq$Yes, provided the R&D activity is conducted in Australia and the Pty Ltd owns the resulting IP or has a written agreement to do so. Companies with aggregated turnover under A$20 million receive a 43.5% refundable tax offset.$faq$),
  (8, $faq$How long does ABN and TFN registration take from Korea?$faq$,
      $faq$An ABN is typically issued within 1 to 14 days and a TFN can take up to 28 days. For non-resident directors the Director ID step adds 4 to 6 weeks, so begin with that.$faq$),
  (9, $faq$What lessons should I take from Korean companies in Australia?$faq$,
      $faq$Korean electronics, automotive, and steel firms have long, successful track records in Australia, usually built on patient localisation and local partnerships rather than rapid volume entry. Australia is a relatively small, concentrated market, so validate that your category is not already dominated by entrenched incumbents before committing significant capital.$faq$),
  (10, $faq$How do I open an Australian bank account from Korea?$faq$,
      $faq$CommBank, NAB, and Westpac support remote account opening for an incorporated Pty Ltd, though identity verification of overseas directors is slow. Multi-currency providers such as Wise Business or Airwallex are often faster to get operational while the main account is set up.$faq$),
  (11, $faq$What are the tax implications of paying dividends from the AU Pty Ltd back to Korea?$faq$,
      $faq$The Australia-Korea tax treaty caps withholding on dividends (15%, reduced to 5% for a qualifying corporate shareholder holding at least 10% of voting stock), interest, and royalties (10%). Fully franked dividends are generally free of withholding, and franking credits do not flow to Korean shareholders. Get tax advice before declaring dividends.$faq$),
  (12, $faq$How do Fair Work obligations differ from Korean employment law?$faq$,
      $faq$Australia''s National Employment Standards and modern awards set minimum pay and conditions, with strong unfair-dismissal protections. Mandatory employer superannuation (11.5%, rising to 12%) is an additional on-cost with no direct equivalent to the employer share of Korea''s National Pension. Get local advice on contracts.$faq$)
) AS v(so, q, a)
WHERE NOT EXISTS (
  SELECT 1 FROM public.country_faqs f JOIN public.countries c ON c.id=f.country_id WHERE c.slug='south-korea'
);

-- ============================== FRANCE ==============================
INSERT INTO public.countries
  (name, slug, description, hero_title, hero_description, trade_relationship_strength,
   economic_indicators, key_industries, keywords, content_keywords, service_keywords,
   event_keywords, lead_keywords, featured, sort_order)
SELECT 'France', 'france',
  'France is a significant European source of investment into Australia across aerospace, infrastructure, energy, luxury goods, and technology, supported by Business France and Bpifrance. There is no bilateral free trade agreement yet, but the EU-Australia FTA concluded in 2026 will benefit French exporters once it enters into force.',
  'French Companies in Australia',
  'How French businesses enter Australia across aerospace, energy, infrastructure, and tech - and what the forthcoming EU-Australia trade agreement means for them.',
  'Strong',
  $json${"gdp":"$3.0T","population":"68M","major_exports":["Aerospace","Luxury Goods","Pharmaceuticals","Wine"],"trade_volume_aud":"$11B"}$json$::jsonb,
  ARRAY['Aerospace & Defence','Energy','Infrastructure','Luxury & Consumer','Technology']::text[],
  ARRAY['france','french','business france','bpifrance','european union','eu']::text[],
  ARRAY['france','french','business france']::text[],
  ARRAY['france','french','business france']::text[],
  ARRAY['france','french','business france']::text[],
  ARRAY['france','french','business france']::text[],
  false, 8
WHERE NOT EXISTS (SELECT 1 FROM public.countries WHERE slug='france');

INSERT INTO public.country_faqs (country_id, sort_order, question, answer)
SELECT (SELECT id FROM public.countries WHERE slug='france'), v.so, v.q, v.a
FROM (VALUES
  (1, $faq$Do I need an Australian director to incorporate a Pty Ltd?$faq$,
      $faq$Yes. ASIC requires at least one director who is ordinarily resident in Australia. A French SAS or SARL parent cannot itself satisfy this, so most founders second an employee on a visa, hire a local country manager early, or appoint a trusted resident director through a corporate services firm.$faq$),
  (2, $faq$Is there a France-Australia free trade agreement?$faq$,
      $faq$There is no bilateral France-Australia FTA; France trades with Australia under EU arrangements. The EU-Australia Free Trade Agreement was concluded in March 2026 after eight years of talks and is expected to cut tariffs on around 98% of trade once both sides ratify it and it enters into force. Until then, standard WTO most-favoured-nation tariffs apply - check the latest ratification status, as this is changing.$faq$),
  (3, $faq$Should I incorporate as a Pty Ltd or open an Australian branch?$faq$,
      $faq$For most operating businesses the default is an Australian Pty Ltd. A registered foreign-company branch exposes the French parent directly to Australian tax and reporting on the Australian activity. The Pty Ltd ring-fences Australian liability and is what unlocks the R&D Tax Incentive.$faq$),
  (4, $faq$What is the ASIC Director ID and how do I get one as a French founder?$faq$,
      $faq$The Director ID is a mandatory unique identifier ASIC issues to every company director. Non-resident directors verify identity through a paper-based process with certified documents, which typically takes 4 to 6 weeks. Start this before incorporation to avoid delays.$faq$),
  (5, $faq$What is the best visa route for the first employee I send from France?$faq$,
      $faq$The Subclass 482 Skills in Demand visa is the usual path for sending an existing French team member to Australia for up to 4 years; the role must be on the relevant skilled occupation list and the Pty Ltd must be an approved sponsor. For short-term projects the Subclass 400 is faster.$faq$),
  (6, $faq$How does Australian GST compare to French VAT?$faq$,
      $faq$Australian GST is 10%, much lower than France''s 20% standard VAT, and you must register once Australian turnover exceeds A$75,000. The input-credit mechanics will feel familiar to a French finance team.$faq$),
  (7, $faq$Can I claim the R&D Tax Incentive as a French-founded Pty Ltd?$faq$,
      $faq$Yes. France''s Credit d''Impot Recherche does not apply to Australian activity; the Australian R&D Tax Incentive is the local equivalent. Companies with aggregated turnover under A$20 million receive a 43.5% refundable tax offset, provided the R&D is conducted in Australia and the Pty Ltd holds the IP or has a written agreement to do so.$faq$),
  (8, $faq$How long does ABN and TFN registration take from France?$faq$,
      $faq$An ABN is typically issued within 1 to 14 days and a TFN can take up to 28 days. For non-resident directors the Director ID step adds 4 to 6 weeks, so begin with that.$faq$),
  (9, $faq$What lessons should I take from French companies in Australia?$faq$,
      $faq$French firms have succeeded in Australia in capital-intensive sectors such as energy, infrastructure, defence, and transport, typically through local joint ventures and long sales cycles. The 2021 cancellation of the Naval Group submarine contract is a reminder that government and defence procurement carries real political risk - build local partnerships and do not assume a single large contract is secure.$faq$),
  (10, $faq$How do I open an Australian bank account from France?$faq$,
      $faq$CommBank, NAB, and Westpac support remote account opening for an incorporated Pty Ltd, though identity verification of overseas directors is slow. Multi-currency providers such as Wise Business or Airwallex are often faster to get operational while the main account is set up.$faq$),
  (11, $faq$What are the tax implications of paying dividends from the AU Pty Ltd back to France?$faq$,
      $faq$The Australia-France tax treaty (2006) reduces withholding on dividends, interest, and royalties, with reduced or nil rates for qualifying inter-company dividends where ownership thresholds are met. Franking credits do not flow to French shareholders. Get tax advice before declaring dividends.$faq$),
  (12, $faq$How do Fair Work obligations differ from French employment law?$faq$,
      $faq$Australia''s National Employment Standards and modern awards set minimum pay and conditions, but France''s labour protections (35-hour week, strong collective bargaining, high social charges) are generally more onerous, so the shift is usually toward a lighter framework. Mandatory employer superannuation is 11.5%, rising to 12%. Get local advice on contracts.$faq$)
) AS v(so, q, a)
WHERE NOT EXISTS (
  SELECT 1 FROM public.country_faqs f JOIN public.countries c ON c.id=f.country_id WHERE c.slug='france'
);
