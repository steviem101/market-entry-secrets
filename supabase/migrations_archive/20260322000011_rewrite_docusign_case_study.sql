-- ============================================================================
-- DOCUSIGN CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

UPDATE public.content_items
SET
  title = 'How DocuSign Entered the Australian Market',
  subtitle = 'From Telstra partnership to APAC headquarters in Sydney: how DocuSign built three data centres, won government contracts, and launched AI contract agents for Australian businesses',
  read_time = 10,
  meta_description = 'Deep-dive case study on how DocuSign established Sydney as its APAC HQ, launched Australian data centres, partnered with Telstra, and targeted public sector digitisation.',
  sector_tags = ARRAY['technology', 'digital-signature', 'enterprise-software', 'saas', 'public-sector', 'legaltech'],
  updated_at = NOW()
WHERE slug = 'docusign-australia-market-entry';

UPDATE public.content_company_profiles
SET
  industry = 'Digital Agreement and Contract Management',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2018',
  outcome = 'successful',
  business_model = 'B2B SaaS / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>DocuSign deepened its Australian commitment in 2018 by launching three data centre locations across Sydney, Melbourne, and Canberra, operating as one region servicing the wider APAC area. Microsoft Azure was selected as the data centre provider. The company simultaneously named Sydney as the location for its Asia Pacific headquarters. Brad Newton, then DocuSign''s regional head, explained the move was driven by "the commitment of the Federal Government to digital transformation, and the work that the Digital Transformation Agency has been doing in digitising the citizen experience."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a>, <a href="http://telecomtimes.com.au/files/2018/06/17/docusign-steps-up-australian-market-play-flags-first-local-dcs-confirms-sydney-as-apac-hq/" target="_blank" rel="noopener noreferrer">Telecom Times</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The Telstra partnership was central to DocuSign''s Australian strategy. Telstra acted as partner, customer, and strategic investor through Telstra Ventures, which had invested in DocuSign in 2014. Telstra planned to use DocuSign''s expanded presence to provide customised digital solutions incorporating DocuSign to help federal government departments replace paperwork with secure digital documents. Matthew Koertge, Managing Director at Telstra Ventures, highlighted "strong potential for collaboration between DocuSign and our other portfolio companies such as Whispir, especially in the Government sector."</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>In August 2025, DocuSign announced a new local data centre for Q4 2025, expanding capacity to host its Intelligent Agreement Management (IAM) platform. This enables Australian customers to store and process agreement data within Australia under local privacy laws. DocuSign also unveiled AI contract agents — described as the industry''s first purpose-built AI contract agent — designed to accelerate workflows, reduce risk, and improve outcomes across the entire agreement lifecycle. The continued investment reflects DocuSign''s evolution from e-signature tool to comprehensive agreement intelligence platform.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.prnewswire.com/apac/news-releases/docusign-plans-australian-data-centre-answering-national-push-for-digital-sovereignty-and-data-security-302528681.html" target="_blank" rel="noopener noreferrer">PR Newswire</a>, <a href="https://finance.yahoo.com/news/docusign-plans-australian-data-centre-055300321.html" target="_blank" rel="noopener noreferrer">Yahoo Finance</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>DocuSign achieved compliance with rigorous security standards and government frameworks including ISO 27001 and FedRAMP Certification, aligned with the Australian Digital Transformation Agency''s Secure Cloud Strategy. This compliance positioning was critical for government adoption. Federal Government Minister Michael Keenan confirmed trials were already in place, noting that "the Defence Department has a keen interest in this technology as well." For public sector customers, DocuSign''s local data centres addressed data sovereignty requirements that had previously blocked cloud adoption.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.govtechreview.com.au/content/gov-datacentre/news/docusign-launches-australian-data-centres-730674429" target="_blank" rel="noopener noreferrer">GovTech Review</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The Telstra relationship created a triple advantage: distribution (Telstra selling DocuSign to its enterprise customers), validation (Telstra as a customer using the product internally), and investment (Telstra Ventures as a strategic investor providing capital and market intelligence). This partner-customer-investor model gave DocuSign immediate scale and credibility that would have taken years to build through direct sales alone. Having Australia''s largest telco endorse your product eliminates the "unknown American vendor" risk perception that many international companies face.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The public sector digitisation opportunity in Australia was immense. At the time of launch, 61% of Australian citizens still printed or scanned documents to transact with government. DocuSign''s automation allowed organisations to measure turnaround time in minutes rather than days. The COVID-19 pandemic subsequently accelerated digital agreement adoption across both public and private sectors, as remote work made physical document signing impractical. DocuSign was perfectly positioned to capture this demand with local infrastructure already in place.</p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>DocuSign operates three data centre locations across Sydney, Melbourne, and Canberra (with a fourth planned for Q4 2025). Sydney serves as the APAC headquarters. The platform has hundreds of millions of users globally and achieved compliance with ISO 27001, FedRAMP, and alignment with the DTA''s Secure Cloud Strategy. Key Australian customers include government departments, Telstra, and enterprises across financial services, legal, and real estate. The 2025 expansion includes the Intelligent Agreement Management (IAM) platform and AI contract agents, representing DocuSign''s evolution beyond e-signatures.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://itbrief.com.au/story/docusign-launches-three-new-data-centre-locations-australia" target="_blank" rel="noopener noreferrer">IT Brief</a>, <a href="https://www.prnewswire.com/apac/news-releases/docusign-plans-australian-data-centre-answering-national-push-for-digital-sovereignty-and-data-security-302528681.html" target="_blank" rel="noopener noreferrer">PR Newswire</a></em></p>', 1, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Overcoming public sector resistance to cloud-based solutions was DocuSign''s primary challenge. Government agencies had deeply embedded paper-based processes and a cultural reluctance to adopt digital agreements — particularly for legally binding documents. Building trust required not just technical compliance certifications but extensive stakeholder engagement, proof-of-concept trials, and patience with lengthy government procurement cycles. The Defence Department''s interest demonstrated demand but also highlighted the stringent security requirements that had to be met.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition from Adobe Sign (integrated with the Adobe Creative Cloud ecosystem), local competitors, and free alternatives like HelloSign created pricing pressure, particularly for small and medium businesses. The evolution from e-signatures to agreement management (IAM) represented both an opportunity and a risk — existing customers needed to be convinced that the expanded platform was worth higher licensing costs, while new competitors emerged in the AI-powered contract analysis space.</p>', 2, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>A partner who is also a customer and investor creates unmatched market access.</strong> Telstra''s triple role — distribution partner, product customer, and strategic investor through Telstra Ventures — gave DocuSign immediate scale, credibility, and market intelligence. Companies entering Australia should seek partners who can serve multiple roles simultaneously, as this alignment of incentives accelerates market penetration far faster than any single relationship type.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Public sector digital transformation creates massive opportunity for prepared entrants.</strong> Australia''s government digitisation agenda created demand for cloud-based solutions, but only vendors with local data centres, security certifications, and patience for procurement cycles could capture it. Companies targeting Australian government contracts should invest in compliance infrastructure well before bidding on contracts.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Using Sydney as an APAC headquarters enables regional expansion.</strong> DocuSign''s decision to base its Asia Pacific headquarters in Sydney — rather than Singapore or Tokyo — reflected the strength of Australia''s regulatory environment, timezone advantages for APAC coverage, and the presence of Telstra as a strategic partner. For companies seeking an APAC hub, Sydney offers a mature market, strong rule of law, and cultural alignment with Western business practices that simplifies regional operations.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a>, <a href="http://telecomtimes.com.au/files/2018/06/17/docusign-steps-up-australian-market-play-flags-first-local-dcs-confirms-sydney-as-apac-hq/" target="_blank" rel="noopener noreferrer">Telecom Times</a></em></p>', 3, 'paragraph');
