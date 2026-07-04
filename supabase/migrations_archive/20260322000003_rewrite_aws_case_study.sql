-- ============================================================================
-- AWS CASE STUDY DEEP REWRITE
-- Enriched with multi-source research, March 2026
-- ============================================================================

-- 1. Update content_items metadata
UPDATE public.content_items
SET
  title = 'How Amazon Web Services (AWS) Entered the Australian Market',
  subtitle = 'From the 2012 Sydney Region to a AU$20 billion infrastructure commitment: how AWS became Australia''s dominant cloud provider with 400,000+ people trained and Top Secret Cloud clearance',
  read_time = 12,
  meta_description = 'Deep-dive case study on how AWS entered Australia with the Sydney Region in 2012, expanded to Melbourne and Perth, secured a $2B Top Secret Cloud contract, and committed AU$20B in investment.',
  sector_tags = ARRAY['cloud-computing', 'technology', 'infrastructure', 'ai', 'enterprise-software', 'government'],
  updated_at = NOW()
WHERE slug = 'aws-australia-market-entry';

-- 2. Update company profile
UPDATE public.content_company_profiles
SET
  industry = 'Cloud Computing and AI Infrastructure',
  origin_country = 'United States',
  target_market = 'Australia',
  entry_date = '2012',
  outcome = 'successful',
  employee_count = 11000,
  business_model = 'B2B IaaS / PaaS / Consumption-based Cloud'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry');

-- 3. Delete existing sections (CASCADE deletes content_bodies)
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry');

-- 4. Delete any orphaned content_bodies
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry');

-- 5. Insert new sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'aws-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- 6. Insert enriched content bodies

-- ===================== ENTRY STRATEGY =====================
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>AWS launched the Asia Pacific (Sydney) Region in November 2012 with two Availability Zones — its first infrastructure in Australia and one of its most globally requested regions. The timing was strategic: both Australian companies and international firms wanted to serve the ANZ market without routing data through overseas hosting providers. AWS had identified Australia as a mature enterprise market with strong financial services, government, and resources sectors generating massive demand for scalable computing. The Sydney Region was headquartered at Level 37, 26 Park Street, Sydney.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://aws.amazon.com/about-aws/whats-new/2012/11/12/announcing-the-aws-asia-pacific-sydney-region/" target="_blank" rel="noopener noreferrer">AWS Announcement</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>AWS expanded progressively across Australia over the next decade: Direct Connect locations in Sydney (2014), Melbourne (2016), and Canberra and Perth (2017) extended low-latency connectivity. In January 2023, AWS launched two major milestones simultaneously — the Asia Pacific (Melbourne) Region with three Availability Zones and Australia''s first Local Zone in Perth. The Melbourne region represented an estimated A$6.8 billion investment through 2037. By 2026, AWS operates 10 Direct Connect locations across Sydney, Melbourne, Canberra, and Perth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://press.aboutamazon.com/2023/1/aws-launches-second-infrastructure-region-in-australia" target="_blank" rel="noopener noreferrer">Amazon Press</a>, <a href="https://aws.amazon.com/local/australia/" target="_blank" rel="noopener noreferrer">AWS Australia</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>The government cloud strategy became AWS''s most powerful competitive moat in Australia. AWS achieved PROTECTED-level IRAP assessment — the highest classification attainable for public cloud — now covering 164 services including the Melbourne Region. In July 2024, the Australian Government announced a landmark AU$2 billion strategic partnership with AWS to deliver a sovereign Top Secret Cloud, managed through ASD''s REDSPICE programme. This purpose-built capability mirrors the classified cloud AWS provides to the CIA and US Intelligence Community, serving Australia''s Defence and National Intelligence Community across 10 agencies and supporting AUKUS interoperability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://ia.acs.org.au/article/2024/govt-inks--2bn-deal-with-aws-for-top-secret-cloud.html" target="_blank" rel="noopener noreferrer">Information Age</a>, <a href="https://www.minister.defence.gov.au/media-releases/2024-07-04/australian-government-partners-amazon-web-services-bolster-national-defence-security" target="_blank" rel="noopener noreferrer">Defence Minister</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Leadership evolved as the market matured. Paul Migliorini served as the first ANZ Managing Director for approximately five years from the 2012 launch. Adam Beavis succeeded him, later moving to an APAC-wide ISV role before joining Databricks as ANZ VP. Rianne Van Veldhuizen is the current VP and Managing Director ANZ, previously spending 15 years at IBM as Asia Pacific chief digital officer. In June 2025, Amazon announced AU$20 billion in investment from 2025 to 2029 — the largest publicly announced global technology investment in Australia''s history.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.arnnet.com.au/article/690319/aws-appoints-rianne-van-veldhuizen-new-nz-leader/" target="_blank" rel="noopener noreferrer">ARN</a>, <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a></em></p>', 4, 'paragraph'),

-- ===================== SUCCESS FACTORS =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Data residency and sovereignty compliance have been the bedrock of AWS''s Australian success. With two full regions (Sydney and Melbourne) plus a Perth Local Zone, Australian data stays onshore. 164 services are assessed at PROTECTED level, and Strategic Hosting Provider certification under the government''s Hosting Certification Framework unlocked the entire public sector. For highly regulated industries — banking, healthcare, government — this compliance infrastructure made AWS the default choice, as competitors struggled to match the breadth of certified services.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://aws.amazon.com/compliance/australia-new-zealand/" target="_blank" rel="noopener noreferrer">AWS Compliance</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>AWS''s training programmes created a self-reinforcing cycle of adoption. Since 2017, AWS has trained more than 400,000 people across Australia in cloud and digital skills through programmes including AWS re/Start (a free 400-hour cohort programme), AWS Skills Guild, AWS Educate, and Work-Based Learning (a 12-month data centre operations training programme). NAB alone trained 7,000 employees through AWS Skills Guild, with 1,300 gaining certification — reducing staff attrition from 20% to 8%. More skilled workers meant more enterprises could adopt AWS, which drove more demand for training.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aboutamazon.com.au/bridging-the-cloud-skills-gap-across-australia-and-new-zealand" target="_blank" rel="noopener noreferrer">About Amazon AU</a>, <a href="https://aws.amazon.com/solutions/case-studies/national-australia-bank-digital-transformation-case-study/" target="_blank" rel="noopener noreferrer">AWS NAB Case Study</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Customer wins span every sector of the Australian economy. The Big Four banks are all on AWS: Commonwealth Bank has been on the platform since 2012, NAB since 2013 (migrating 65 contact centres to Amazon Connect). Born-on-cloud companies like Canva (160M+ monthly active users, reduced compute costs by 46%), Atlassian, Afterpay, Airtasker, PEXA, and SEEK built their businesses entirely on AWS. Enterprise customers include Telstra, Qantas, Kmart, Woodside Energy, Cochlear, Optus, Origin Energy, and Myer. In the public sector, the ABS, CSIRO, University of Melbourne, RMIT, and Swimming Australia all run on AWS.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://aws.amazon.com/solutions/case-studies/innovators/canva/" target="_blank" rel="noopener noreferrer">AWS Canva Case Study</a>, <a href="https://press.aboutamazon.com/2023/1/aws-launches-second-infrastructure-region-in-australia" target="_blank" rel="noopener noreferrer">Amazon Press</a></em></p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Renewable energy investment provided both environmental credibility and political cover. AWS has 11 solar and wind projects across NSW, Queensland, and Victoria, expected to generate over 1.4 million megawatt-hours of clean energy annually — enough to power nearly 290,000 Australian homes. The Hawkesdale Wind Farm in Victoria alone produces 337,000 MWh annually across 23 turbines. In 2024, Amazon ranked as the third-largest corporate buyer of renewable energy in Australia. Three new solar farms totalling 170+ MW were announced in 2025 with European Energy.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://international.austrade.gov.au/en/news-and-analysis/success-stories/aws-plans-to-invest-a20-billion-to-expand-digital-infrastructure-in-australia-by-2029" target="_blank" rel="noopener noreferrer">Austrade</a>, <a href="https://amazonau.gcs-web.com/news-releases/news-release-details/operations-begin-wind-farm-hawkesdale-victoria-backed-amazon" target="_blank" rel="noopener noreferrer">Amazon AU</a></em></p>', 4, 'paragraph'),

-- ===================== KEY METRICS & PERFORMANCE =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>The investment numbers tell the story of AWS''s deepening commitment. Total investment from 2012 to 2023 reached AU$9.1 billion. The AU$20 billion commitment for 2025-2029 — the largest publicly announced global technology investment in Australia — will fund new data centres in Sydney and Melbourne plus renewable energy projects. The Melbourne Region alone is estimated to contribute A$15.9 billion to Australia''s GDP by 2037. The AU$2 billion Top Secret Cloud contract extends over a decade and positions AWS as the sovereign cloud provider for national security.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a>, <a href="https://ia.acs.org.au/article/2024/govt-inks--2bn-deal-with-aws-for-top-secret-cloud.html" target="_blank" rel="noopener noreferrer">Information Age</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>The planned investment supports an estimated average of 11,000 full-time jobs nationally, including 2,500 direct roles in construction and operations with the remainder through supply chain and household income effects. The Top Secret Cloud partnership alone will generate up to 2,000 Australian jobs. The Melbourne Region supports over 2,500 full-time equivalent jobs annually at external businesses. Over 400,000 people have been trained in cloud and digital skills since 2017, creating a workforce pipeline that sustains adoption growth.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a>, <a href="https://www.minister.defence.gov.au/media-releases/2024-07-04/australian-government-partners-amazon-web-services-bolster-national-defence-security" target="_blank" rel="noopener noreferrer">Defence Minister</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>Globally, AWS holds approximately 28-31% of cloud infrastructure market share as of late 2025, slowly declining from approximately 33% in 2021 as Azure (20-25%) grows faster in absolute revenue terms driven by its OpenAI partnership. Google Cloud holds 11-13%. In Australia specifically, AWS''s dominance is more pronounced due to its early entry, two full regions, government certifications, and the depth of its enterprise customer base across financial services, resources, and the public sector.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://www.statista.com/chart/18819/worldwide-market-share-of-leading-cloud-infrastructure-service-providers/" target="_blank" rel="noopener noreferrer">Statista</a></em></p>', 3, 'paragraph'),

-- ===================== CHALLENGES FACED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Microsoft Azure''s growth, accelerated by its exclusive OpenAI partnership, represents the most significant competitive threat. Microsoft committed AU$5 billion in October 2023 to expand to 29 centres across Sydney, Melbourne, and Canberra. Azure''s growth rate has consistently exceeded AWS''s, narrowing the market share gap. Google Cloud, while smaller, is also expanding aggressively in Australia. The AI era has shifted the competitive dynamics — enterprises increasingly evaluate cloud providers based on their AI model partnerships, not just infrastructure reliability.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://stansberryresearch.com/stock-market-trends/azure-vs-aws-vs-google-cloud-whos-winning-the-cloud-ai-war-in-2025" target="_blank" rel="noopener noreferrer">Stansberry Research</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Community opposition to data centres has become a growing challenge. A Melbourne petition opposed new data centre construction, citing energy consumption, carbon emissions, and insufficient community consultation. Melbourne''s lord mayor warned data centres could "cook the planet." NSW parliament established a formal inquiry into data centre development. In Western Sydney, at least 89 data centres draw from public drinking water supply. AEMO estimates data centres will consume 6% of Australia''s grid-supplied electricity by 2030, with demand projected to surge from 3 TWh to 30 TWh by 2035.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://theconversation.com/power-hungry-data-centres-threaten-australias-energy-grid-here-are-3-steps-to-make-them-more-efficient-266992" target="_blank" rel="noopener noreferrer">The Conversation</a>, <a href="https://www.pv-tech.org/social-backlash-inevitable-industry-demands-data-centres-stop-freeloading-on-australias-clean-energy/" target="_blank" rel="noopener noreferrer">PV Tech</a></em></p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>The talent shortage has been persistent. AWS job postings in Australia increased 153% between 2014 and 2017, with postings consistently 6-12 times the supply of qualified job seekers. Over 54% of organisations reported challenges with AWS implementation due to internal skills gaps. Australia Post and RMIT developed new upskilling approaches as public sector cloud migration was slowed by the shortage. The Perth Local Zone also presented pricing challenges — up to 50% more expensive than Sydney with a limited service catalogue, mainly compute and block storage.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://itbrief.com.au/story/aws-skills-shortage-anz-opportunity-it-students-pros" target="_blank" rel="noopener noreferrer">IT Brief</a>, <a href="https://www.ac3.com.au/resources/the-user-experience-and-aws-local-zones-within-australia" target="_blank" rel="noopener noreferrer">AC3</a></em></p>', 3, 'paragraph'),

-- ===================== LESSONS LEARNED =====================
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Infrastructure first, then services.</strong> AWS planted a flag with the Sydney Region in 2012 before aggressively pursuing enterprise and government customers. Data residency was the prerequisite — without local infrastructure, government and regulated-industry customers in banking and healthcare could not adopt the platform. For any technology company entering Australia, demonstrating local infrastructure commitment unlocks the regulated sectors that drive enterprise adoption.</p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Government compliance creates an almost insurmountable moat.</strong> Achieving IRAP PROTECTED assessment across 164 services and Strategic Hosting Provider status unlocked the entire public sector. The AU$2 billion Top Secret Cloud contract cemented AWS as the sovereign cloud provider for national security — a position competitors will struggle to replicate. For companies entering regulated Australian markets, compliance certifications should be pursued early and broadly, as they compound into a durable competitive advantage.</p>', 2, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Train the ecosystem to create demand.</strong> Training 400,000+ Australians created a self-reinforcing cycle: more skilled workers meant more enterprises could adopt AWS, which drove more demand for training. NAB''s example — 7,000 trained, attrition dropping from 20% to 8% — shows that training programmes serve as both a market development tool and a customer retention mechanism. Companies entering Australia should view skills development as a go-to-market investment, not a philanthropic expense.</p>', 3, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Anchor tenants validate the market for everyone else.</strong> Early wins with the Big Four banks (CBA from 2012, NAB from 2013), plus born-on-cloud companies like Canva and Atlassian, created credibility that attracted the broader market. Australian enterprises look to their peers for technology validation — landing two or three blue-chip customers in the first year establishes trust that marketing alone cannot achieve.</p>', 4, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'aws-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p><strong>Address energy and sustainability proactively.</strong> With 11 renewable energy projects generating 1.4 million MWh annually, AWS pre-emptively addressed the energy criticism that now threatens data centre approvals across Australia. Being the third-largest corporate renewable energy buyer in the country provides political cover during planning approvals and community opposition. Companies planning large-scale infrastructure in Australia should lead with sustainability commitments, not treat them as afterthoughts.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Sources: <a href="https://www.aboutamazon.com/news/aws/amazon-data-center-investment-in-australia" target="_blank" rel="noopener noreferrer">About Amazon</a>, <a href="https://international.austrade.gov.au/en/news-and-analysis/success-stories/aws-plans-to-invest-a20-billion-to-expand-digital-infrastructure-in-australia-by-2029" target="_blank" rel="noopener noreferrer">Austrade</a></em></p>', 5, 'paragraph');
