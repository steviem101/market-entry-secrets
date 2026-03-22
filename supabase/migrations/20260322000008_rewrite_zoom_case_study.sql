-- ============================================================================
-- ZOOM CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

UPDATE public.content_items
SET
  title = 'How Zoom Entered the Australian Market',
  subtitle = 'From a Sydney sales office to 134% ANZ revenue growth: how the video communications platform capitalised on dispersed workforces and a pandemic-driven adoption surge',
  read_time = 10,
  meta_description = 'Deep-dive case study on how Zoom grew 134% in ANZ revenue, launched Zoom Phone and Contact Center, and built partnerships with Australian enterprises.',
  sector_tags = ARRAY['technology', 'communications', 'video-conferencing', 'saas', 'cloud-computing', 'remote-work'],
  updated_at = NOW()
WHERE slug = 'zoom-australia-market-entry';

UPDATE public.content_company_profiles
SET
  industry = 'Video Communications and Collaboration Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2019',
  outcome = 'successful',
  employee_count = 150,
  business_model = 'B2B/B2C SaaS / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'zoom-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Zoom established its Australian presence with a sales and support office in Sydney in 2019, complemented by a local data centre to ensure low-latency performance for Australian users. The timing — just months before COVID-19 — proved extraordinarily fortuitous. Zoom Phone launched alongside, offering native PSTN service in Australia with both Metered and Unlimited Calling Plans, plus a Bring Your Own Carrier (BYOC) option allowing organisations to retain existing SIP trunks while migrating to the Zoom platform.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/" target="_blank" rel="noopener noreferrer">Zoom Blog</a>, <a href="https://www.dclsearch.com/blog/2019/07/zoom-announces-zoom-phone-launch-in-australia-and-the-united-kingdom" target="_blank" rel="noopener noreferrer">DCL Search</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Michael Chetner was appointed to lead the Australia and New Zealand operation. The team grew to over 150 employees based in Sydney, serving as Zoom''s hub for the Asia-Pacific market. Zoom''s initial go-to-market strategy targeted organisations contending with Australia''s dispersed population and ongoing connectivity and bandwidth challenges — positioning video communications as a solution to geographic barriers that had long constrained collaboration across the country''s vast distances.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/" target="_blank" rel="noopener noreferrer">Zoom Blog</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Over 18 months, Zoom built strategic partnerships with Slack, Box, and Okta in Australia to provide integrated collaboration and security. Additional partnerships with Workplace by Facebook and Crestron expanded hardware integration for meeting rooms. Zoom subsequently launched Zoom Contact Center across ANZ, entering the contact centre as a service (CCaaS) market — a significant expansion beyond its core video conferencing product into enterprise customer experience infrastructure.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.zoom.com/en/blog/how-zoom-contact-center-will-change-cx-in-anz/" target="_blank" rel="noopener noreferrer">Zoom Blog</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>COVID-19 transformed Zoom from a business communications tool into essential infrastructure for work, education, and social connection across Australia. The pandemic-driven adoption surge meant virtually every Australian organisation — from government departments to schools to small businesses — became a Zoom user almost overnight. The platform''s reputation for being easy to deploy, straightforward to use, and reliable under extreme demand loads (during a period when competitors experienced outages) cemented its position as the default video conferencing platform.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Product reliability and breadth drove post-pandemic retention. Zoom rapidly expanded from pure video conferencing into a unified communications platform encompassing Zoom Phone, Zoom Rooms, Zoom Webinars, Zoom Contact Center, and Zoom IQ (AI-powered meeting intelligence). For Australian enterprises, the ability to consolidate multiple communication tools onto a single platform — replacing legacy PBX phone systems, separate webinar tools, and standalone contact centre software — created significant operational savings and simplicity.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Key Australian customers include Western Sydney University, REA Group, SEEK, The Movember Foundation, and Planet Innovation. Zoom''s flexible deployment options — native PSTN or bring your own carrier — reduced switching costs and allowed organisations to migrate incrementally rather than requiring a complete infrastructure replacement. The local data centre ensured Australian data sovereignty and low-latency performance, addressing a key concern for enterprise and government customers.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/" target="_blank" rel="noopener noreferrer">Zoom Blog</a></em></p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Zoom achieved 134% revenue growth and a 105% increase in its customer base across Australia and New Zealand in the period following its Australian launch. The Sydney office grew to over 150 employees. The company expanded from pure video conferencing to a full unified communications platform including Zoom Phone (native PSTN with metered and unlimited plans), Zoom Contact Center (CCaaS), Zoom Rooms (hardware integration), and Zoom IQ (AI-powered meeting intelligence). Australia became one of Zoom''s most important markets in the Asia-Pacific region.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://channellife.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz" target="_blank" rel="noopener noreferrer">ChannelLife</a></em></p>', 1, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Zoom entered an established communications market with incumbent telcos (Telstra, Optus) and enterprise providers (Cisco Webex, Microsoft Teams) with deep existing relationships. Microsoft Teams, bundled with Microsoft 365 at no additional cost, represented the most formidable competitive threat — many organisations defaulted to Teams simply because they already paid for it. Post-pandemic, "Zoom fatigue" and the partial return to office work reduced usage intensity, forcing Zoom to demonstrate value beyond basic video calls through platform expansion into phone, contact centre, and AI capabilities.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Security concerns emerged early in the pandemic when rapid adoption outpaced security controls, leading to "Zoombombing" incidents in Australian schools and organisations. Zoom responded with default meeting passwords, waiting rooms, and enhanced encryption, but the reputational damage required sustained effort to overcome in security-conscious enterprise and government accounts. Integrating with existing Australian telecommunications infrastructure and meeting local regulatory requirements for voice services also presented technical complexity.</p>', 2, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Product simplicity wins during rapid adoption.</strong> Zoom''s core advantage — being genuinely easy to use without training — enabled viral adoption during COVID-19 that competitors with more complex products could not match. For companies entering Australia, optimising for immediate usability creates adoption velocity that feature breadth cannot replicate.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Expand the platform before growth plateaus.</strong> Zoom''s expansion into Phone, Contact Center, and AI capabilities ensured that pandemic-driven customers had reasons to stay and spend more as the initial video conferencing demand normalised. Companies entering Australia should plan their product expansion roadmap before the initial growth wave crests.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'zoom-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Flexible deployment reduces switching costs.</strong> Zoom''s BYOC option — allowing organisations to retain existing SIP trunks while adopting the platform — removed the biggest barrier to migration. For communications and infrastructure companies entering Australia, offering a gradual migration path rather than requiring a rip-and-replace approach dramatically accelerates adoption in risk-averse enterprise environments.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/" target="_blank" rel="noopener noreferrer">Zoom Blog</a>, <a href="https://www.zoom.com/en/blog/how-zoom-contact-center-will-change-cx-in-anz/" target="_blank" rel="noopener noreferrer">Zoom Blog</a></em></p>', 3, 'paragraph');
