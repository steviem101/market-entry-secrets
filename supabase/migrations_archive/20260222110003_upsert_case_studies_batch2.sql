-- ============================================================================
-- IDEMPOTENT CASE STUDIES UPSERT PART 3: GitHub, Zoom, Tesla, Twilio, DocuSign
-- ============================================================================

-- ===================== GITHUB =====================
DELETE FROM public.content_items WHERE slug = 'github-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'github-australia-market-entry',
  'How GitHub Entered the Australian Market',
  'First Asia Pacific market for Enterprise Cloud data residency, targeting highly regulated industries requiring local data storage',
  'case_study', 'published', false, 8,
  'Learn how GitHub launched Enterprise Cloud with data residency in Australia in 2025, becoming the first APAC market for this offering.',
  ARRAY['technology', 'software-development', 'developer-tools', 'cloud-computing'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'GitHub', 'Technology / Software Development Platform', 'United States', 'Australia', '2025', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Thomas Dohmke', 'CEO, GitHub', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub launched Enterprise Cloud with data residency leveraging Microsoft Azure''s infrastructure and security to provide a reliable cloud-based solution. Australia was the first market in Asia Pacific and second globally to receive this deployment option, targeting highly regulated industries requiring local data storage.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>GitHub succeeded by providing greater transparency, control, and security while removing complexities of self-hosted infrastructure. Their offering included access to familiar GitHub Enterprise functionality including GitHub Copilot and GitHub Advanced Security, meeting compliance requirements for highly regulated sectors.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Australia became the first market in Asia Pacific and second globally for this offering. IDC predicts 70% of developers will leverage cloud-native developer portals and cloud developer environments to improve work efficiency by 2027.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Organizations in highly regulated sectors in Australia were previously unable to use cloud-based DevOps due to data control needs, often limiting them to costly and complex self-hosted solutions. Meeting compliance requirements became increasingly challenging for enterprises with a global presence.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Data sovereignty and local storage requirements are critical for market entry in regulated industries. Combining cloud benefits with local data residency addresses the key barrier to adoption. Being first-to-market in a region creates a significant competitive advantage.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph');


-- ===================== ZOOM =====================
DELETE FROM public.content_items WHERE slug = 'zoom-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'zoom-australia-market-entry',
  'How Zoom Entered the Australian Market',
  'Cloud phone system launch with native PSTN service and flexible deployment options for Australian businesses',
  'case_study', 'published', false, 7,
  'Discover how Zoom launched Zoom Phone in Australia in 2019 with native PSTN and bring-your-own-carrier options.',
  ARRAY['technology', 'communications', 'video-conferencing', 'saas', 'cloud-computing'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Zoom Video Communications', 'Technology / Video Communications', 'United States', 'Australia', '2019', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Eric Yuan', 'CEO & Founder, Zoom', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Zoom launched Zoom Phone as a cloud phone system available as an add-on to its platform in Australia. The strategy included native Zoom Phone PSTN service with Metered and Unlimited Calling Plans, plus a Bring Your Own Carrier option allowing customers to bring existing PSTN SIP trunks to the Zoom platform.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Zoom''s success was attributed to product reliability and integration. The platform was described as easy to deploy, straightforward to use, and rock-solid from a reliability standpoint. Success came through rapid launch of important new features, deep integrations, and flexible deployment options.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Australia was among the first international markets to receive Zoom Phone with native PSTN service. The platform offered both Metered and Unlimited Calling Plans alongside a BYOC option, providing multiple adoption pathways for Australian businesses of all sizes.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Zoom needed to compete in an established communications market with incumbent telcos and enterprise providers. Integrating with existing Australian telecommunications infrastructure and meeting local regulatory requirements for voice services presented additional complexities.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Flexibility in deployment options (native PSTN or bring your own carrier) enables broader market adoption by reducing switching costs. Product reliability and ease of use are critical success factors in the communications technology market, often outweighing feature breadth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph');


-- ===================== TESLA =====================
DELETE FROM public.content_items WHERE slug = 'tesla-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'tesla-australia-market-entry',
  'How Tesla Entered the Australian Market',
  'Premium market entry with first showroom in Sydney and proprietary supercharger network to address range anxiety',
  'case_study', 'published', false, 8,
  'Learn how Tesla entered Australia in 2014 with its first showroom, supercharger network, and premium Model S starting at $117,000.',
  ARRAY['electric-vehicles', 'clean-technology', 'automotive', 'energy', 'sustainability'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Tesla', 'Electric Vehicles / Clean Technology', 'United States', 'Australia', '2014', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Elon Musk', 'CEO, Tesla', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'tesla-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Tesla opened its first Australian showroom in north Sydney with plans to expand to Melbourne the following year. They launched the Model S four-door sedan with simultaneous unveiling of the first two supercharger stations to establish dedicated charging infrastructure. The strategy focused on the premium market segment initially with plans for more affordable models later.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Tesla positioned itself as an aspirational vehicle and lifestyle statement. High-performance metrics rivaled similarly priced high-performance vehicles (the fastest accelerating four-door sedan ever built). Their proprietary supercharger network was capable of half-charge in 20 minutes, and the 500km range effectively addressed range anxiety.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Price range from about $117,000 for the standard model to more than $200,000 for premium versions. 500km range. Acceleration: zero to 100km/h in 3.4 seconds. Superchargers fill entire battery in about one hour. Plans for eight superchargers between Melbourne, Canberra and Sydney in 2015.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Tesla faced the fundamental challenge of establishing a new vehicle category in a market with limited EV infrastructure. High initial pricing limited the addressable market, and the lack of an existing charging network required significant upfront investment before vehicles could be practically used for long-distance travel.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'tesla-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Infrastructure development (charging network) is a critical enabler for electric vehicle adoption. Premium market entry allows establishment of a brand before a mass market push. Proprietary infrastructure creates competitive advantage and customer lock-in that is difficult for competitors to replicate.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.theguardian.com/environment/2014/dec/10/tesla-begins-selling-electric-vehicles-in-australia-and-plans-charging-network" target="_blank" rel="noopener noreferrer">The Guardian</a></em></p>', 1, 'paragraph');


-- ===================== TWILIO =====================
DELETE FROM public.content_items WHERE slug = 'twilio-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'twilio-australia-market-entry',
  'How Twilio Entered the Australian Market',
  'Developer-first company transitioning to go-to-market with local sales teams in Sydney and Melbourne',
  'case_study', 'published', false, 7,
  'Discover how Twilio opened offices in Sydney and Melbourne in 2018, leveraging an existing developer community to plan 100%+ growth.',
  ARRAY['cloud-computing', 'communications', 'developer-tools', 'technology', 'saas'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Twilio', 'Cloud Communications Technology', 'United States', 'Australia', '2018', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Jeff Lawson', 'Co-founder, Twilio', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'twilio-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Twilio opened offices in Sydney and Melbourne in 2018, transitioning from a developer-first company to implementing a specific go-to-market strategy with a local sales team. Australia was identified as one of six global growth focus markets for 2018. They hired experienced leadership to meet inbound demand.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Twilio already had strong developer and partner communities in the region prior to formal entry. Having feet on the ground helped businesses improve consumer communications. Hiring experienced local leadership including a country director with regional expertise was crucial to success.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Planned to grow by more than 100% in region in 2018. 100 local customers at launch including Atlassian, zipMoney, Dominos, and Airtasker. Australia was the 11th country outside the US for business. Started with eight people employed in region. Global company valued at US$3.49 billion with more than two million developers.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Twilio needed to transition from a self-serve, developer-driven model to a structured enterprise go-to-market approach suitable for the Australian market. Scaling from eight employees while managing rapid growth targets of 100%+ required careful hiring and operational planning.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'twilio-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>A developer community can be established remotely before formal market entry. Local presence accelerates growth when a strong developer base already exists. Australia is well positioned as a hub for broader APAC region expansion. Twilio''s goal for Australia to become the fastest growing region outside North America demonstrates the strategic importance of the market.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.afr.com/technology/twilio-opens-melbourne-and-sydney-office-in-aggressive-expansion-20180406-h0yet0" target="_blank" rel="noopener noreferrer">Australian Financial Review</a></em></p>', 1, 'paragraph');


-- ===================== DOCUSIGN =====================
DELETE FROM public.content_items WHERE slug = 'docusign-australia-market-entry';

INSERT INTO public.content_items (slug, title, subtitle, content_type, status, featured, read_time, meta_description, sector_tags, category_id)
VALUES (
  'docusign-australia-market-entry',
  'How DocuSign Entered the Australian Market',
  'Supporting public sector digital transformation with local data centres and strategic Telstra partnership',
  'case_study', 'published', false, 7,
  'Learn how DocuSign launched Australian data centres in 2018, partnered with Telstra, and established Sydney as its Asia Pacific HQ.',
  ARRAY['technology', 'digital-signature', 'enterprise-software', 'saas', 'public-sector'],
  (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
);

INSERT INTO public.content_company_profiles (content_id, company_name, industry, origin_country, target_market, entry_date, outcome)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'DocuSign', 'Digital Signature Technology', 'United States', 'Australia', '2018', 'successful');

INSERT INTO public.content_founders (content_id, name, title, is_primary)
VALUES ((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Allan Thygesen', 'CEO, DocuSign', true);

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'docusign-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>DocuSign focused on supporting public sector digital transformation by launching two data centres across Australia to offer data residency and privacy. They established Sydney as their Asia Pacific headquarters. A strategic partnership with Telstra, which acted as partner, customer, and strategic investor through Telstra Ventures, was central to their approach.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>DocuSign achieved compliance with rigorous security standards and government frameworks including ISO27001 and FedRAMP Certification. Their alignment with the Australian Digital Transformation Agency''s Secure Cloud Strategy and strong partnership with Telstra for local presence and market access were critical success factors.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>61% of Australian citizens still print or scan to transact with government, revealing a massive digitization opportunity. Automation allows organizations to measure turnaround time in minutes rather than days. Hundreds of millions of users leverage the cloud platform globally.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>DocuSign needed to overcome public sector resistance to cloud-based solutions and meet stringent government security and data residency requirements. Convincing government agencies to shift from traditional paper-based processes to digital solutions required significant trust-building and compliance work.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph'),
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'docusign-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Public sector digital transformation creates significant market opportunity. Data sovereignty and local infrastructure are critical for government adoption. Strategic local partnerships (Telstra) accelerate market penetration. Using Sydney as a regional headquarters enables broader Asia Pacific expansion.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.docusign.com/en-au/blog/docusign-launches-australian-data-centres-fast-track-public-sector-digitisation" target="_blank" rel="noopener noreferrer">DocuSign Blog</a></em></p>', 1, 'paragraph');
