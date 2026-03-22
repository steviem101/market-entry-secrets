-- ============================================================================
-- GITHUB CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How GitHub Entered the Australian Market',
  subtitle = 'From 2+ million Australian developers to data residency for regulated enterprises: how GitHub leveraged Microsoft''s AU$5 billion infrastructure and Copilot AI to unlock the APAC market',
  read_time = 12,
  meta_description = 'Deep-dive case study on how GitHub launched Enterprise Cloud data residency in Australia in 2025, deployed Copilot to ANZ Bank''s 3,000 engineers, and grew to 2+ million Australian developers.',
  sector_tags = ARRAY['technology', 'software-development', 'ai', 'cloud-computing', 'developer-tools', 'saas'],
  updated_at = NOW()
WHERE slug = 'github-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'Software Development Platform and AI-Powered Developer Tools',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2025',
  outcome = 'successful',
  business_model = 'B2B SaaS / Subscription Platform (Freemium)'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');

-- 3. Delete existing sections
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'github-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub had been used by Australian developers since its founding in 2008, but its formal enterprise market entry came on February 5, 2025, when it launched GitHub Enterprise Cloud with data residency in Australia. This made Australia the first market in Asia Pacific — and only the second globally after the European Union — to receive this deployment option. CEO Thomas Dohmke announced the launch in Sydney, calling data residency "a vital strand to the DNA of digital transformation." The move directly addressed years of demand from regulated Australian enterprises in financial services, government, defence, and telecommunications that could not adopt cloud-based DevOps due to data sovereignty requirements, often limiting them to costly self-hosted GitHub Enterprise Server deployments.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub''s Australian entry is inseparable from Microsoft''s broader AU$5 billion investment in Australian AI and cloud infrastructure — announced in October 2024, the largest Microsoft investment in its 40-year Australian history. The investment expanded Azure data centre capacity from 20 to 29 sites across Sydney, Melbourne, and Canberra, increasing computing capacity by approximately 250%. GitHub Enterprise Cloud with data residency runs on this Azure infrastructure, with data encrypted in transit and at rest. Enterprises are hosted on a dedicated subdomain of GHE.com, separating open source and enterprise work. GitHub did not need to build its own infrastructure — the 2018 acquisition by Microsoft for US$7.5 billion gave it an enterprise distribution channel, compliance certifications (including IRAP for government), and a data centre footprint that an independent company could not have replicated.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://news.microsoft.com/en-au/features/microsoft-announces-a5-billion-investment-in-computing-capacity-and-capability-to-help-australia-seize-the-ai-era/" target="_blank" rel="noopener noreferrer">Microsoft News</a>, <a href="https://cfotech.com.au/story/github-launches-enterprise-cloud-with-data-residency-in-oz" target="_blank" rel="noopener noreferrer">CFOtech</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Regional leadership was established in February 2022 when Sharryn Napier was appointed VP of Sales for APAC (India, Japan, China, Asia Pacific), based in Sydney. Napier — previously Regional Managing Director and VP for ANZ at New Relic — brought deep local networks as a member of the Australian Institute of Company Directors and the National Board of the AIIA. GitHub built an Australian channel partner ecosystem including Arkahna (a GitHub Verified Partner specialising in DevSecOps), Versent/Telstra, Mantel Group, Arinco, Furo, and Galah Cyber — extending its reach without requiring a large direct sales team.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.arnnet.com.au/article/695576/github-nabs-new-relic-nz-head-drive-apac/" target="_blank" rel="noopener noreferrer">ARN</a>, <a href="https://arkahna.com.au/partners/github" target="_blank" rel="noopener noreferrer">Arkahna</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>GitHub localised its global event strategy for the Australian market. In November 2025, it hosted GitHub Universe ''25 Recap Sydney — a free, full-day event with sessions on AI, security, and developer experience — rather than expecting Australian customers to travel to San Francisco for the main Universe conference. Additional in-market activities included participation in the Microsoft AI Tour Sydney in April 2026 and informal GitHub Social Club developer gatherings. By May 2025, data residency was expanded to a self-service trial model, allowing mid-market organisations to initiate a 30-day free trial without requiring sales engagement — removing friction for companies that didn''t warrant a dedicated enterprise sales cycle.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://github.blog/changelog/2025-05-16-github-enterprise-cloud-with-data-residency-now-available-for-self-service-trial/" target="_blank" rel="noopener noreferrer">GitHub Changelog</a>, <a href="https://eventbrowse.com/event/github-universe25-recap-sydney/" target="_blank" rel="noopener noreferrer">EventBrowse</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>GitHub''s dominant position among individual developers created a powerful bottom-up adoption dynamic. With over 2 million Australian developers on the platform and 367,000 new accounts added in the past year alone — a record 21.6% year-over-year growth — GitHub was already the de facto standard for version control and collaboration. Australian developers contributed 10.7 million open-source contributions annually, ranking 19th globally by developer community size and 17th by AI-repository contributions. Developers were already using GitHub for open source, personal projects, and in many cases unauthorised work use, creating organic demand for an enterprise offering that formalised what was already happening.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://securitybrief.com.au/story/australian-developers-embrace-ai-boost-productivity-on-github" target="_blank" rel="noopener noreferrer">SecurityBrief</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>ANZ Bank became GitHub''s flagship Australian enterprise customer, deploying GitHub Copilot to 3,000 software developers and engineers. An internal trial of 100 engineers — published as an academic paper — found that tasks were completed 42.36% faster with Copilot. CTO Tim Hogarth led the adoption, and ANZ launched an AI Immersion Centre at its Melbourne headquarters in partnership with Microsoft — a first for banking in Australia. This published, peer-reviewed productivity data became a powerful proof point for the entire Australian market, far more persuasive than any marketing campaign.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.itnews.com.au/news/anz-targets-3000-engineers-to-use-github-copilot-601195" target="_blank" rel="noopener noreferrer">iTnews</a>, <a href="https://www.theregister.com/2024/02/10/anz_bank_github_copilot/" target="_blank" rel="noopener noreferrer">The Register</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>GitHub Copilot became the trojan horse for enterprise adoption across the Australian public sector. Over 60 APS (Australian Public Service) agencies participated in a Microsoft 365 Copilot trial involving 7,600 users between January and June 2024, and a whole-of-government Microsoft deal was announced in February 2026 with a $1.55 million training fund. The Australian Government''s $460 million National AI Plan (2025-2026) created additional tailwinds for AI developer tool adoption. GitHub positioned Copilot — with over 20 million users and 42% market share of the US$7.37 billion AI coding tools market by 2025 — as the centrepiece of this AI-powered government digital transformation.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://itbrief.com.au/story/github-tips-ai-agents-to-surge-in-australia-s-public-sector" target="_blank" rel="noopener noreferrer">IT Brief</a>, <a href="https://news.microsoft.com/source/asia/2026/02/26/enabling-the-next-phase-of-digital-government-in-australia/" target="_blank" rel="noopener noreferrer">Microsoft</a></em></p>', 3, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Australia hosts over 2 million GitHub developers — ranking 19th globally — with 367,000 new accounts created in the past year, representing a record 21.6% year-over-year growth. Australian developers made 10.7 million open-source contributions annually and ranked 17th globally for AI-repository contributions. Globally, GitHub hosts over 180 million developers and 420 million repositories and is used by over 90% of Fortune 100 companies. GitHub''s annual revenue crossed US$2 billion in 2024 as part of Microsoft''s Intelligent Cloud segment, with Copilot driving over 40% of revenue growth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://securitybrief.com.au/story/australian-developers-embrace-ai-boost-productivity-on-github" target="_blank" rel="noopener noreferrer">SecurityBrief</a>, <a href="https://getlatka.com/blog/github-revenue/" target="_blank" rel="noopener noreferrer">Latka</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>GitHub Copilot surpassed 20 million users globally by mid-2025, holding 42% market share of the AI coding tools market. ANZ Bank deployed Copilot to 3,000 engineers with a measured 42.36% productivity gain. The Australian Government''s Copilot trial reached 7,600 users across 60+ agencies. Microsoft''s AU$5 billion infrastructure investment — expanding Azure capacity by 250% across 29 data centre sites — underpins GitHub''s data residency offering. Data residency expanded to four global regions (EU, Australia, US, Japan) with self-service trials available from May 2025. Six Australian channel partners (Arkahna, Versent/Telstra, Mantel Group, Arinco, Furo, Galah Cyber) extend GitHub''s market reach.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://mlq.ai/news/github-copilot-surpasses-20-million-all-time-users-accelerates-enterprise-adoption/" target="_blank" rel="noopener noreferrer">MLQ</a>, <a href="https://www.microsoft.com/investor/reports/ar24/" target="_blank" rel="noopener noreferrer">Microsoft Annual Report</a></em></p>', 2, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>GitHub''s most significant competitive challenge in Australia comes from Atlassian — an Australian-founded company headquartered in Sydney since 2002. Atlassian''s Bitbucket, with over 10 million registered users and 60 of the Fortune 100, offers an integrated development lifecycle when combined with Jira and Confluence. Atlassian has deep relationships with Australian enterprises, government agencies, and the defence sector, and its products are deeply embedded in project management and documentation workflows. For many Australian organisations, switching from Bitbucket to GitHub involves migrating not just repositories but entire tool ecosystems. However, Bitbucket lacks equivalents to GitHub Copilot or Codespaces, giving GitHub a significant AI advantage that is shifting the competitive dynamic.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.upguard.com/blog/bitbucket-vs-github" target="_blank" rel="noopener noreferrer">UpGuard</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>GitLab — which leads in the Gartner Magic Quadrant for DevOps Platforms — has established a strong Australian presence, particularly among organisations preferring a single-application model with built-in CI/CD that reduces tool sprawl. Nearly 60% of ANZ organisations planned to adopt agile project management software, with over one-third investing in DevOps tools, creating a contested market. Azure DevOps, also owned by Microsoft, creates internal competitive tension — some Australian enterprises already use it for repositories and CI/CD, causing confusion about which Microsoft-owned platform to standardise on.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.computerweekly.com/news/252481620/GitLab-expands-into-Australia-as-DevOps-tooling-market-heats-up" target="_blank" rel="noopener noreferrer">Computer Weekly</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>In September 2025, Australia''s eSafety Commissioner investigated whether GitHub should be classified as an "age-restricted social media platform" under the Online Safety Amendment Act 2024, which bans social media for under-16s. The investigation drew global ridicule from the developer community. GitHub was ultimately exempted in December 2025, but the episode — with potential fines of AU$49.5 million for non-compliance — highlighted the regulatory risk of operating in a market where technology legislation can be unpredictably broad. The Australian Government''s own Copilot trial also identified cultural barriers to AI adoption including negative stigma around generative AI, lack of trust, and challenges integrating with non-Microsoft products.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.theregister.com/2025/09/25/australia_social_media_ban_github/" target="_blank" rel="noopener noreferrer">The Register</a>, <a href="https://www.digital.gov.au/initiatives/copilot-trial/microsoft-365-copilot-evaluation-report-full/whole-government-adoption-generative-ai" target="_blank" rel="noopener noreferrer">Digital.gov.au</a></em></p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Data sovereignty is the unlock for regulated markets, not a roadmap item.</strong> GitHub had over 2 million Australian users but could not penetrate regulated enterprise sectors — banking, government, defence, telecommunications — until it offered local data residency in February 2025. The launch immediately opened doors that had been closed for years. Companies targeting regulated industries in Australia should treat data residency as a market entry prerequisite, not a future enhancement.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Let flagship customers publish the proof.</strong> ANZ Bank''s peer-reviewed academic paper demonstrating 42.36% productivity gains with GitHub Copilot was more persuasive than any marketing campaign GitHub could have run. The published data gave CIOs and CTOs across Australian enterprises a credible, quantified business case to present to their boards. Companies entering Australia should invest in enabling early customers to publish measurable outcomes — third-party validation carries far more weight than vendor claims.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>AI features create competitive urgency that infrastructure products cannot.</strong> GitHub Copilot transformed the enterprise sales conversation from "should we standardise on GitHub?" to "we need GitHub to access the leading AI coding assistant before competitors do." The 42% market share in AI coding tools created time-sensitive pressure — organisations that delayed risked falling behind peers whose developers were shipping code faster. Companies entering Australia with developer tools should lead with AI-powered capabilities that create competitive urgency, not rely solely on infrastructure improvements.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Hire regional leadership with local credibility, not expatriates.</strong> Appointing Sharryn Napier — Sydney-based, AIIA board member, former New Relic ANZ head — as APAC VP gave GitHub executive presence with deep local networks and industry credibility. Combined with six Australian channel partners, this local leadership approach extended GitHub''s reach without requiring a large direct sales force. Companies entering Australia should prioritise hiring leaders who are already embedded in the local technology community.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'github-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Bottom-up developer adoption creates enterprise demand that top-down sales cannot replicate.</strong> With 2+ million Australian developers and 21.6% annual growth, GitHub''s community created internal demand within enterprises long before the sales team arrived. Developers who used GitHub personally pushed their organisations to adopt it formally. This bottom-up dynamic — amplified by 10.7 million annual open-source contributions — is far more powerful than traditional enterprise sales in developer tools. Companies entering Australia with developer-focused products should invest heavily in community and free tiers before attempting enterprise sales.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://github.com/newsroom/press-releases/data-residency-in-australia" target="_blank" rel="noopener noreferrer">GitHub Newsroom</a>, <a href="https://itwire.com/it-people-news/cio-trends/two-years-later-github-vp-sees-continued-growth-simplification-ai-explosion.html" target="_blank" rel="noopener noreferrer">iTWire</a></em></p>', 5, 'paragraph');
