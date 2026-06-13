-- ============================================================
-- Seed: vetted events from the 2026-06-13 Apify "Events Finder" run
-- Target: MES Platform (xhziwveaiuhzdoutpgrh) ONLY
-- Lands the 9 already-vetted events that have REAL Eventbrite URLs so the
-- unified page has content before the live pipeline is wired. The 3 rows
-- whose URLs were truncated to placeholder ticket ids (StartupHaus,
-- AI & Tech Networking, Venture & Capital) are intentionally omitted; they
-- arrive cleanly via the live pipeline using their real URLs.
-- Idempotent: ON CONFLICT (source_url) DO NOTHING means a later re-scrape
-- of these URLs updates the existing rows rather than duplicating them.
-- ============================================================

INSERT INTO events
  (title, description, event_date, date, location, venue, city, country, event_format,
   source_url, source, source_platform, image_url, relevance_score, match_reasons, tags,
   type, category, slug, persona, date_precision, status)
VALUES
  ('Investor Connect: Pitch & Deal Flow Night | Sydney',
   'Investor pitch and deal flow night at the Harbour View Hotel, The Rocks.',
   '2026-06-19 19:20:00+10', '2026-06-19', 'Harbour View Hotel, The Rocks, Sydney', 'Harbour View Hotel', 'Sydney', 'AU', 'in_person',
   'https://www.eventbrite.com/e/investor-connect-pitch-deal-flow-night-sydney-tickets-1990354068598',
   'apify_events_finder', 'eventbrite',
   'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1185393354%2F2985960207467%2F1%2Foriginal.20260525-230045?w=640&auto=format%2Ccompress&q=75&sharp=10&s=002b3ad6c6bbc886a024a5e8923d63a0',
   90, ARRAY['Pitch night supports fundraising','Investors and founders audience','In-person Sydney crowd'],
   ARRAY['Founders/Startup','Investing','Networking'],
   'Pitch Night', 'Founders & Startups', 'investor-connect-pitch-deal-flow-night-sydney', 'both', 'exact', 'pending'),

  ('Velocity AI Summit: Raising Capital & Automating Your Business with AI',
   'Summit on raising capital and automating a business with AI, at Rydges World Square Hotel.',
   '2026-06-23 08:30:00+10', '2026-06-23', 'Rydges World Square Hotel, Sydney', 'Rydges World Square Hotel', 'Sydney', 'AU', 'in_person',
   'https://www.eventbrite.com.au/e/velocity-ai-summit-raising-capital-automating-your-business-with-ai-tickets-1986185238515',
   'apify_events_finder', 'eventbrite',
   'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1186643864%2F54901145563%2F1%2Foriginal.20260611-002834?crop=focalpoint&fit=crop&w=640&auto=format%2Ccompress&q=75&sharp=10&fp-x=1.0&fp-y=0.491&s=a4c10364e0c7f98a36a41c95d45372cb',
   90, ARRAY['Capital raising and AI automation focus','Relevant for founders and investors'],
   ARRAY['AI/ML','Founders/Startup'],
   'Summit', 'Technology & Innovation', 'velocity-ai-summit-raising-capital-automating-business-ai', 'both', 'exact', 'pending'),

  ('Startups & Investors Pitch Night Melbourne',
   'Pitch night connecting startups and investors at The National Hotel, Richmond.',
   '2026-06-19 18:00:00+10', '2026-06-19', 'The National Hotel, Richmond, Melbourne', 'The National Hotel', 'Melbourne', 'AU', 'in_person',
   'https://www.eventbrite.com/e/startups-investors-pitch-night-melbourne-tickets-1989395538609',
   'apify_events_finder', 'eventbrite',
   'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1181220277%2F2735356920661%2F1%2Foriginal.20260401-175755?crop=focalpoint&fit=crop&w=640&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.015&fp-y=0.047&s=32e425028ec7f3fedca5153fe567231e',
   90, ARRAY['Targets startups and investors','In-person networking','Investment and scaling focus'],
   ARRAY['Founders/Startup','Investing'],
   'Pitch Night', 'Founders & Startups', 'startups-investors-pitch-night-melbourne', 'both', 'exact', 'pending'),

  ('Founders Pitch & Networking Night in Melbourne',
   'Founders pitch and networking evening at The National Hotel, Richmond.',
   '2026-06-19 18:00:00+10', '2026-06-19', 'The National Hotel, Richmond, Melbourne', 'The National Hotel', 'Melbourne', 'AU', 'in_person',
   'https://www.eventbrite.com/e/founders-pitch-networking-night-in-melbourne-tickets-1989395542621',
   'apify_events_finder', 'eventbrite',
   'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1184513645%2F2735356920661%2F1%2Foriginal.20260513-160159?w=640&auto=format%2Ccompress&q=75&sharp=10&s=038b583e4bab4d99379da80950e57a64',
   90, ARRAY['Targets founders with pitch opportunities'],
   ARRAY['Founders/Startup'],
   'Networking', 'Founders & Startups', 'founders-pitch-networking-night-melbourne', 'local_founder', 'exact', 'pending'),

  ('Impact Pitch Night',
   'Impact-focused investor pitch night in Melbourne.',
   '2026-06-30 18:00:00+10', '2026-06-30', 'Melbourne', NULL, 'Melbourne', 'AU', 'in_person',
   'https://www.eventbrite.com/e/impact-pitch-night-tickets-1285974873009',
   'apify_events_finder', 'eventbrite', NULL,
   90, ARRAY['Impact-focused investor pitch event'],
   ARRAY['Founders/Startup','Investing'],
   'Pitch Night', 'Founders & Startups', 'impact-pitch-night-melbourne', 'both', 'exact', 'pending'),

  ('Startup Networking Melbourne: Founders, Investors & Talent Mixer',
   'Startup networking mixer for founders, investors and talent at Public House, Richmond.',
   '2026-07-17 18:00:00+10', '2026-07-17', 'Public House, Richmond, Melbourne', 'Public House', 'Melbourne', 'AU', 'in_person',
   'https://www.eventbrite.com/e/startup-networking-melbourne-founders-investors-talent-mixer-tickets-1987629760118',
   'apify_events_finder', 'eventbrite',
   'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F1184458324%2F2985960207467%2F1%2Foriginal.20260513-004938?crop=focalpoint&fit=crop&w=640&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=195d123996bf1a64549421d4fc9b236c',
   90, ARRAY['Strong networking','Founders and investors present','Business growth focus'],
   ARRAY['Founders/Startup','Networking'],
   'Networking', 'Founders & Startups', 'startup-networking-melbourne-founders-investors-talent-mixer', 'both', 'exact', 'pending'),

  ('Startups Demos & Networking Melbourne',
   'Startup demos and networking at The National Hotel, Richmond.',
   '2026-06-19 18:00:00+10', '2026-06-19', 'The National Hotel, Richmond, Melbourne', 'The National Hotel', 'Melbourne', 'AU', 'in_person',
   'https://www.eventbrite.com/e/startups-demos-networking-melbourne-tickets-1989395535601',
   'apify_events_finder', 'eventbrite', NULL,
   85, ARRAY['Demo and networking format'],
   ARRAY['Founders/Startup'],
   'Networking', 'Founders & Startups', 'startups-demos-networking-melbourne', 'local_founder', 'exact', 'pending'),

  ('Startup Pitch & Networking Melbourne',
   'Startup pitch and networking evening at The National Hotel, Richmond.',
   '2026-06-19 18:00:00+10', '2026-06-19', 'The National Hotel, Richmond, Melbourne', 'The National Hotel', 'Melbourne', 'AU', 'in_person',
   'https://www.eventbrite.com/e/startup-pitch-networking-melbourne-tickets-1989395530579',
   'apify_events_finder', 'eventbrite', NULL,
   85, ARRAY['Pitch and networking for startups'],
   ARRAY['Founders/Startup'],
   'Pitch Night', 'Founders & Startups', 'startup-pitch-networking-melbourne', 'local_founder', 'exact', 'pending'),

  ('Investor Connect: Pitch & Deal Flow Night | Melbourne',
   'Investor pitch and deal flow night in Melbourne.',
   '2026-07-17 19:20:00+10', '2026-07-17', 'Melbourne', NULL, 'Melbourne', 'AU', 'in_person',
   'https://www.eventbrite.com/e/investor-connect-pitch-deal-flow-night-melbourne-tickets-1990354070638',
   'apify_events_finder', 'eventbrite', NULL,
   85, ARRAY['Deal flow and pitch night for investors'],
   ARRAY['Investing','Founders/Startup'],
   'Pitch Night', 'Investing & Capital', 'investor-connect-pitch-deal-flow-night-melbourne', 'both', 'exact', 'pending')
ON CONFLICT (source_url) WHERE source_url IS NOT NULL DO NOTHING;

-- Approve the freshly-seeded pilot rows (all score 85+). Scoped to pending so a
-- fresh replay never overrides a later human decision on the same rows.
UPDATE events SET status = 'approved'
WHERE source = 'apify_events_finder' AND status = 'pending' AND relevance_score >= 85;
