-- ============================================================================
-- CASE STUDIES MIGRATION PART 1: Preamble, legacy fixes, Airbnb update
-- ============================================================================

-- 1. Add "Technology Market Entry" content category
INSERT INTO public.content_categories (name, description, icon, color, sort_order)
VALUES ('Technology Market Entry', 'International technology companies entering the Australian market', 'Globe', 'text-violet-600', 10)
ON CONFLICT DO NOTHING;

-- 2. Fix legacy content_type: success_story → case_study
UPDATE public.content_items
SET content_type = 'case_study'
WHERE content_type = 'success_story';

-- 3. Set outcome = 'successful' on existing company profiles that lack it
UPDATE public.content_company_profiles
SET outcome = 'successful'
WHERE outcome IS NULL
  AND content_id IN (SELECT id FROM public.content_items WHERE content_type = 'case_study');

-- 4. Update existing Airbnb record with new citation-backed data
UPDATE public.content_items
SET title = 'How Airbnb Entered the Australian Market',
    subtitle = 'Peer-to-peer sharing economy platform connecting hosts and guests, creating significant economic value across Australia',
    meta_description = 'Discover how Airbnb entered Australia in 2012 with its sharing economy platform, contributing $1.6 billion to GDP and supporting over 14,000 jobs.',
    sector_tags = ARRAY['sharing-economy', 'travel', 'technology', 'marketplace', 'hospitality'],
    category_id = (SELECT id FROM public.content_categories WHERE name = 'Technology Market Entry')
WHERE slug = 'airbnb-australia-market-entry';

-- Update Airbnb company profile
UPDATE public.content_company_profiles
SET industry = 'Technology / Sharing Economy Platform',
    entry_date = '2012',
    outcome = 'successful',
    origin_country = 'United States',
    target_market = 'Australia'
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry');

-- Delete old Airbnb sections (CASCADE deletes associated content_bodies)
DELETE FROM public.content_sections
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry');

-- Delete any Airbnb content_bodies linked directly to content_id (not via sections)
DELETE FROM public.content_bodies
WHERE content_id = (SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry');

-- Insert new Airbnb sections
INSERT INTO public.content_sections (content_id, title, slug, sort_order, is_active) VALUES
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Entry Strategy', 'entry-strategy', 1, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Success Factors', 'success-factors', 2, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Key Metrics & Performance', 'key-metrics', 3, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Challenges Faced', 'challenges-faced', 4, true),
((SELECT id FROM public.content_items WHERE slug = 'airbnb-australia-market-entry'), 'Lessons Learned', 'lessons-learned', 5, true);

-- Insert new Airbnb content bodies
INSERT INTO public.content_bodies (section_id, body_text, sort_order, content_type) VALUES
((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'entry-strategy'),
'<p>Airbnb entered Australia in 2012 with a peer-to-peer sharing economy platform connecting hosts and guests without owning property. Their innovative market offering allowed ordinary people to host tourists, focusing on adding volume and variety to guest accommodation outside the traditional hotel sector.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'success-factors'),
'<p>Airbnb''s success in Australia was driven by lower cost options (rooms on average $88 cheaper per night compared to traditional accommodation in central Sydney), unique locations (three-quarters of properties in major markets located outside traditional tourist areas), home-like facilities (kitchens and laundries), and a bidirectional ratings system ensuring quality (average rating 4.7 out of 5).</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'key-metrics'),
'<p>In 2015-16: 2.1 million guests for 3.7 million nights; guest spending totaled over $2 billion; contributed $1.6 billion to Australia''s GDP; supported 14,409 full-time equivalent jobs; Australian hosts earned median income of $4,920. 51% of bookings in Australia made by domestic guests.</p>
<p>Since the 2012 launch, Airbnb facilitated over 1.3 million short stays in Australia. In 2015-16 alone, 800,000 stays were booked, demonstrating rapid growth from the early launch period.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'challenges-faced'),
'<p>Airbnb faced community issues relating to noise levels and strata issues. Amenity issues associated with short-term letting included anti-social behaviour, increases in building wear and tear, and degrading of amenities. There were also potential impacts on existing operators in the traditional hotel market due to increased competition.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph'),

((SELECT cs.id FROM public.content_sections cs JOIN public.content_items ci ON cs.content_id = ci.id WHERE ci.slug = 'airbnb-australia-market-entry' AND cs.slug = 'lessons-learned'),
'<p>Platform business models can create significant economic value without owning physical assets. Balancing rapid growth with community concerns and regulatory compliance is critical. Domestic market adoption (51% of bookings) demonstrates the importance of building a local user base alongside international visitors.</p>
<p class="text-sm text-muted-foreground mt-4"><em>Source: <a href="https://news.airbnb.com/wp-content/uploads/sites/4/2017/07/Economic-effects-of-Airbnb_Australia_Web.pdf" target="_blank" rel="noopener noreferrer">Airbnb Economic Report</a></em></p>', 1, 'paragraph');
