-- ============================================================================
-- GITHUB CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

UPDATE public.content_items
SET
  title = 'How GitHub Entered the Australian Market',
  subtitle = 'First Asia Pacific market for Enterprise Cloud data residency: how GitHub unlocked regulated industries by storing code locally on Microsoft Azure',
  read_time = 10,
  meta_description = 'Deep-dive case study on how GitHub launched Enterprise Cloud with data residency in Australia in 2025, becoming the first APAC market for local code storage.',
  sector_tags = ARRAY['technology', 'software-development', 'developer-tools', 'cloud-computing', 'enterprise-software'],
  updated_at = NOW()
WHERE slug = 'github-australia-market-entry';

UPDATE public.content_company_profiles
SET
  industry = 'Software Development Platform',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2025',
  outcome = 'successful',
  business_model = 'B2B SaaS / Subscription Platform'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');

DELETE FROM public.content_sections WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');
DELETE FROM public.content_bodies WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');

INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub Enterprise Cloud with data residency in Australia became generally available in February 2025, making Australia the first market in Asia Pacific and the second globally (after the European Union) to receive this deployment option. CEO Thomas Dohmke stated: "Data residency is a vital strand to the DNA of digital transformation — creating a localised pathway for organisations in highly regulated industries to store their code in region and move to the cloud." The offering leverages Microsoft Azure''s Australian infrastructure and security frameworks to provide a reliable, locally hosted cloud-based solution.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a>, <a href="https://github.blog/changelog/2025-02-04-github-enterprise-cloud-data-residency-in-australia-is-generally-available/" target="_blank" rel="noopener noreferrer">GitHub Blog</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The launch was accompanied by exclusive events in Melbourne, Canberra, and Brisbane — targeting the government, defence, and financial services sectors where data sovereignty is a procurement prerequisite. The Canberra event specifically explored how data residency empowers Australian government agencies to navigate compliance requirements. GitHub Enterprise Cloud with data residency uses an Enterprise Managed Users (EMU) model requiring all identities to be corporate managed through the customer''s own Identity Provider, with subdomain isolation under GHE.com ensuring separation from GitHub.com.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://resources.github.com/data-residency-canberra/" target="_blank" rel="noopener noreferrer">GitHub Resources</a>, <a href="https://resources.github.com/data-residency-australia/" target="_blank" rel="noopener noreferrer">GitHub Resources</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The strategic decision to launch in Australia first within APAC reflected the market''s unique combination of factors: a large, sophisticated developer community, stringent government data sovereignty requirements, a mature financial services sector with strict regulatory compliance needs, and Microsoft Azure''s existing Australian infrastructure investment of AU$5 billion. Since the Australian launch, data residency has expanded to the US and Japan, with more regions planned.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/enterprise/data-residency" target="_blank" rel="noopener noreferrer">GitHub Enterprise</a></em></p>', 3, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>GitHub succeeded by solving a specific pain point: organisations in highly regulated sectors — finance, government, telecommunications, defence — could not use cloud-based DevOps platforms because of data control requirements. They were limited to costly and complex self-hosted GitHub Enterprise Server installations. Data residency removed this barrier by providing the full GitHub Enterprise Cloud experience — including GitHub Copilot and GitHub Advanced Security — while keeping code and repository data within Australian borders.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>The Microsoft Azure foundation gave GitHub immediate infrastructure credibility. Azure''s existing Australian compliance certifications — including IRAP PROTECTED assessment and hosting certification — meant GitHub data residency inherited a proven security posture. This allowed GitHub to bypass years of independent compliance work. The integration with GitHub Copilot — the AI-powered coding assistant used by millions of developers globally — added a compelling productivity layer that self-hosted alternatives could not match.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Being first-to-market in APAC for data-residency-enabled cloud DevOps created a significant competitive advantage. Competitors like GitLab and Bitbucket had to play catch-up on local data storage guarantees. According to IDC, 70% of developers will leverage cloud-native developer portals and cloud developer environments to improve work efficiency by 2027 — positioning GitHub''s early move as aligned with a major industry shift.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://cfotech.com.au/story/github-launches-enterprise-cloud-with-data-residency-in-oz" target="_blank" rel="noopener noreferrer">CFOtech</a></em></p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>GitHub hosts over 100 million developers globally, with Australia home to one of the most active developer communities in the APAC region. Australia became the first APAC market and second globally for Enterprise Cloud data residency. The platform is available across four data residency regions as of 2026: EU, Australia, US, and Japan. GitHub Copilot — available to data residency customers — has been adopted by over 77,000 organisations and is used by millions of developers, with studies showing a 55% increase in coding speed.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://github.com/enterprise/data-residency" target="_blank" rel="noopener noreferrer">GitHub Enterprise</a>, <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>The primary challenge was convincing organisations already running self-hosted GitHub Enterprise Server to migrate to the cloud variant, even with data residency guarantees. Security teams accustomed to on-premises control required assurance that cloud-hosted code was equally protected. The Enterprise Managed Users requirement — mandating corporate identity management — added migration complexity for organisations with diverse identity infrastructure. Government procurement cycles, particularly in defence and national security, are inherently slow and risk-averse.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Competition from Atlassian — an Australian-founded company with deep local relationships — presents an ongoing challenge. Bitbucket, integrated into the Atlassian suite used widely across Australian enterprises, benefits from home-market loyalty and existing procurement relationships. GitLab''s self-hosted and SaaS offerings also compete for the same regulated-industry customers. GitHub must continually demonstrate that its AI-powered developer experience (Copilot, Advanced Security) justifies the platform shift.</p>', 2, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Data sovereignty unlocks entire market segments.</strong> By offering local data storage, GitHub converted organisations that were categorically unable to use cloud DevOps into addressable customers. For any technology company entering Australia, data residency is not a nice-to-have — it is a prerequisite for government, financial services, and defence sectors that represent billions in potential spending.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Leverage existing infrastructure investments.</strong> GitHub inherited Microsoft Azure''s Australian compliance certifications and data centre infrastructure, bypassing years of independent investment. Companies entering Australia through a parent company or strategic partner with existing local infrastructure gain an enormous speed advantage over building from scratch.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>First-mover advantage in compliance creates lasting differentiation.</strong> Being the first APAC cloud DevOps platform with data residency gave GitHub a window to sign regulated-industry customers before competitors could match the offering. In markets where compliance is a procurement gate, speed to certification matters more than feature breadth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a>, <a href="https://resources.github.com/data-residency-australia/" target="_blank" rel="noopener noreferrer">GitHub Resources</a></em></p>', 3, 'paragraph');
