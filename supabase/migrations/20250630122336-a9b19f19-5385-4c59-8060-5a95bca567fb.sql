
-- Clear existing sample events data
DELETE FROM public.events;

-- Insert the 12 new B2B industry conferences with properly formatted UUIDs
INSERT INTO public.events (id, title, description, date, time, location, type, category, attendees, organizer) VALUES
('a1e6f3d2-7c4b-4a16-9d3a-2b1f0a1c2d3e', 'FinTech Innovation Summit Australia', 'Australia''s premier fintech conference bringing together industry leaders, startups and investors to explore innovation in financial services.', '2024-06-15', '9:00 AM - 5:00 PM', 'Sydney Convention Centre', 'Conference', 'Finance', 500, 'FinTech Australia'),

('b2d7e4f3-8d5c-5b27-0e4b-3c2d1e4f5a6b', 'International Mining and Resources Conference (IMARC)', 'The flagship mining event in Australia, showcasing the latest in exploration, technology and investment in mining and resources.', '2024-10-28', '8:00 AM - 6:00 PM', 'Melbourne Convention and Exhibition Centre', 'Conference', 'Mining', 5000, 'Emerging Technology Events'),

('c3f8a5b6-9e6d-6c38-1f5c-4d3e2f6b7c8d', 'Net Zero Live Australia', 'Australia''s biggest clean-energy expo, uniting energy professionals to deliver on net-zero targets through innovation and policy.', '2024-08-20', '9:00 AM - 5:00 PM', 'Melbourne Convention Centre', 'Expo', 'Energy', 3000, 'Clarion Events'),

('d4a9b6c7-0f7e-7d49-2a6d-5e4f3b7c8d9e', 'Big Data & AI Summit Australia', 'A deep-dive into data analytics, AI and machine learning for enterprise-level applications across sectors.', '2024-09-10', '9:00 AM - 4:30 PM', 'Doltone House, Jones Bay Wharf, Sydney', 'Summit', 'Technology', 1500, 'Terrapinn'),

('e5b0c7d8-1a8f-8e50-3b7e-6f5a4c8d9e0f', 'National Manufacturing Week (MFG Week)', 'Australia''s largest manufacturing expo showcasing advanced manufacturing, automation and Industry 4.0 solutions.', '2024-05-12', '10:00 AM - 5:00 PM', 'Melbourne Convention and Exhibition Centre', 'Expo', 'Manufacturing', 10000, 'Reed Exhibitions Australia'),

('f6c1d8e9-2b9a-9f61-4c8f-7a6b5d9e0f1a', 'Retail Global Conference & Expo', 'Bringing together top online retailers and service providers to share growth strategies, tech trends and networking opportunities.', '2024-03-05', '9:00 AM - 5:00 PM', 'Melbourne Convention and Exhibition Centre', 'Conference', 'Retail', 2000, 'Momentum Media'),

('a7d2e9f0-3c0b-0a72-5d9a-8b7c6e0f1a2b', 'AusFitness Expo & Summit', 'The Southern Hemisphere''s biggest fitness trade event for business professionals to discover the latest equipment, tech and trends.', '2024-07-15', '10:00 AM - 6:00 PM', 'International Convention Centre Sydney', 'Expo', 'Fitness', 1200, 'Informa Markets'),

('b8e3f0a1-4d1c-1b83-6e0b-9c8d7f1a2b3c', 'APAC Customer Engagement Conference & Expo', 'Dedicated to customer-experience and engagement strategies, featuring CX leaders, case studies and solution providers.', '2024-05-22', '9:00 AM - 5:00 PM', 'ICC Sydney', 'Conference', 'Marketing', 800, 'Diversified Communications'),

('c9f4a1b2-5e2d-2c94-7f1c-0d9e8a2b3c4d', 'Healthcare+ Expo Australia', 'Australia''s largest event for healthcare innovation, medical devices, digital health and hospital equipment.', '2024-06-26', '10:00 AM - 5:00 PM', 'ICC Sydney', 'Expo', 'Healthcare', 2500, 'Diversified Communications'),

('d0a5b2c3-6f3e-3d05-8a2d-1e0f9b3c4d5e', 'Supply Chain & Logistics Expo', 'A comprehensive showcase of supply-chain technologies, logistics solutions and networking for operations professionals.', '2024-11-07', '9:00 AM - 5:00 PM', 'Melbourne Convention and Exhibition Centre', 'Expo', 'Logistics', 5000, 'Qantas Events'),

('e1b6c3d4-7a4f-4e16-9b3e-2f1a0c4d5e6f', 'Cyber Security Summit Australia', 'An invitation-only gathering of CISOs, security architects and risk leaders to tackle emerging cyber-threats and best practices.', '2024-07-18', '8:30 AM - 4:30 PM', 'Sheraton on the Park, Sydney', 'Summit', 'Cybersecurity', 600, 'CyberRisk Alliance'),

('f2c7d4e5-8b5a-5f27-0c4f-3a2b1d5e6f7a', 'AgriFutures National Conference', 'Australia''s peak agribusiness conference focused on future-proofing agriculture through innovation and sustainability.', '2024-11-02', '9:00 AM - 5:00 PM', 'Brisbane Convention and Exhibition Centre', 'Conference', 'Agribusiness', 400, 'AgriFutures Australia'),

-- Insert the 10 new B2B meetup events with proper UUIDs
('12345678-1234-5678-9abc-123456789abc', 'Bridging Blockchains 2025', 'A Brisbane blockchain meetup focused on interoperability, crypto insights and enterprise use cases, with keynotes and panel discussions.', '2025-03-28', '5:00 PM - 9:00 PM', 'The Precinct, 315 Brunswick St, Fortitude Valley, Brisbane QLD', 'Meetup', 'Blockchain', 150, 'XDC Australia'),

('23456789-2345-6789-abcd-23456789abcd', 'SaaS Growth Meetup', 'An intimate breakfast with Australia''s leading SaaS founders sharing growth tactics to break the $5M revenue ceiling.', '2025-06-18', '7:30 AM - 9:00 AM', 'St Ali, 12-18 Yarra Pl, South Melbourne VIC', 'Meetup', 'SaaS', 50, 'Growth Forum'),

('3456789a-3456-789a-bcde-3456789abcde', 'All Things Blockchain Meetup', 'Expert panel on 2025 crypto trends—Bitcoin reserves, institutional adoption and Aussie regulation—plus networking over food and drinks.', '2025-02-04', '6:00 PM - 8:00 PM', 'Stair Stadium, The Precinct, Brisbane QLD', 'Meetup', 'Blockchain', 300, 'Binance Australia'),

('456789ab-4567-89ab-cdef-456789abcdef', 'Let''s Talk Shopify: Connect, Learn, Grow', 'An ecommerce meetup exploring Shopify apps, integrations and growth hacks, with peer networking over drinks.', '2025-06-04', '5:45 PM - 7:45 PM', 'The Oxford Scholar, 427 Swanston St, Melbourne VIC', 'Meetup', 'eCommerce', 100, 'Shopify Community Melbourne'),

('56789abc-5678-9abc-def0-56789abcdef0', 'AI and Cybersecurity', 'Deep dive on how AI is transforming cyber-defence—threat detection, automated response and human-centric security practices.', '2025-07-09', '5:00 PM - 8:00 PM', 'The Platform, 256 Adelaide Terrace, Perth WA', 'Meetup', 'Cybersecurity', 100, 'Perth AI Innovators'),

('6789abcd-6789-abcd-ef01-6789abcdef01', 'GDG Sydney Meetup July 2025', 'Monthly Google Developer Group gathering featuring talks on AI, Cloud, Data and recruitment pitches from tech companies.', '2025-07-02', '5:30 PM - 8:30 PM', 'Mantel Group, 580 George St, Sydney NSW', 'Meetup', 'Technology', 127, 'GDG Cloud Sydney'),

('789abcde-789a-bcde-f012-789abcdef012', 'Tech & Business Networking Sydney', 'Cocktail-style networking with startups, VCs and corporates—pitch sessions, industry insights and deal-flow conversations.', '2025-07-25', '6:00 PM - 9:00 PM', 'Humphrey''s Hotel, 1/288 Forest Rd, Hurstville NSW', 'Meetup', 'Startups', 80, 'Startup Valley Team'),

('89abcdef-89ab-cdef-0123-89abcdef0123', 'Data Science & Analytics Meetup', 'Peer-led discussions on data science, ML, AI tools and career-building, plus job-market networking over coffee.', '2025-12-19', '6:00 PM - 8:00 PM', 'Barracks On Barrack, 181 Barrack St, Sydney NSW', 'Meetup', 'Data & Analytics', 100, 'IT Social Sydney'),

('9abcdef0-9abc-def0-1234-9abcdef01234', 'Dealing with Complexity', 'An engineering-leadership meetup exploring systems complexity, CTO lessons and fault-tolerant design patterns.', '2025-07-03', '5:30 PM - 8:30 PM', 'Lvl 10/11, 101 York St, Sydney NSW', 'Meetup', 'Technology', 110, 'Sydney Technology Leaders'),

('abcdef01-abcd-ef01-2345-abcdef012345', 'Global Startup Forum Sydney 2025', 'Pitch night and networking with entrepreneurs and investors, plus strategy sessions for scaling ventures.', '2025-06-21', '9:30 AM - 11:30 AM', 'The Walrus Sydney CBD, Shop 1/276 Pitt St, Sydney NSW', 'Meetup', 'Startups', 200, 'Global Startups Club');
