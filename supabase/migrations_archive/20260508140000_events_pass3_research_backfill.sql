-- Pass 3 research backfill: 27 fresh events ranked roughly 61-90 by attendees, again
-- driven by 5 parallel research agents querying official websites on 2026-05-08.

-- Batch 11
UPDATE public.events SET registration_url='https://luma.com/rddem8i7', organizer_email='vc@fivevcapital.com', image_url='https://cdn.prod.website-files.com/65a3939fb6da371e2a36c8bc/692636ba6e3decd1d243c6c0_3.jpg', date='2026-05-13', date_precision='exact'
WHERE id='46ee9868-46a5-4c7f-af19-ee885d517283'; -- SaaS Summit Australia

UPDATE public.events SET registration_url='https://www.legalinnovationsea.com/upcoming-legal-events-register-interest', date='2027-04-28', date_precision='exact'
WHERE id='831c64c6-28dd-4f62-bd28-ac58c76c2292'; -- Legal Innovation & Tech Fest

-- AusMine, Mining Indaba AusMine, Agribusiness Australia, SHRM Australia: sites unreachable

-- Batch 12
UPDATE public.events SET registration_url='https://www.gevme.com/futureofmining-2026-registration', organizer_email='eventoperations@aspermont.com', date='2026-06-16', date_precision='exact'
WHERE id='a3ff530d-743e-433f-b442-4021cc212d5a'; -- Future of Mining Australia

UPDATE public.events SET registration_url='https://www.propertycouncil.com.au/event/national-retirement-living-summit-2026', date='2026-06-15', date_precision='exact'
WHERE id='a0dd8f9e-603d-4df4-a92a-13dc126e054e'; -- National Retirement Living Summit

UPDATE public.events SET image_url='https://www.apcsummit.org/sites/default/files/2025-12/SB-22.jpg', date='2027-09-15', date_precision='exact'
WHERE id='4da0007e-8829-441f-ba63-40e6ebff29f6'; -- Asia Pacific Cities Summit

UPDATE public.events SET registration_url='https://events.humanitix.com/cicada-x-tech23-2026-australias-biggest-deep-tech-festival?c=website', organizer_email='hello@tech23.com.au', image_url='https://images.humanitix.com/i/Z105NIFORhCUcJgn8sNH@responsive-1600.webp', exhibitors=23, date='2026-09-09', date_precision='exact'
WHERE id='fc3fe119-5453-4263-b352-8a996f794ca3'; -- Cicada x Tech23

-- Australian Venture Summit, Mental Health Congress Australia: sites unreachable

-- Batch 13
UPDATE public.events SET registration_url='https://www.nationalpropertyconference.com.au/register', organizer_email='events@api.org.au'
WHERE id='d4b5a3cd-1b8f-4699-ba10-5884b55336e4'; -- API National Property Conference (May 4-6 2026 just past, no 2027 yet)

UPDATE public.events SET registration_url='https://futureplace.swoogo.com/LSS/register', image_url='https://livingsectorssummit.com/wp-content/uploads/54920560398_b271e89530_k.jpg', exhibitors=40, date='2026-11-11', date_precision='exact'
WHERE id='b2465003-472b-4658-90a9-373adf74f961'; -- Living Sectors Summit

-- AIIA National Conference, RMITx Digital Innovation Summit, AgriFutures National Forum: nothing actionable

-- Batch 14
UPDATE public.events SET registration_url='https://procureconaustralia.wbresearch.com/srspricing', image_url='https://eco-cdn.iqpc.com/eco/images/uploaded_images/0g878J6wkICFt4yQs9CKdXnfukzdwlsUbPTO9cLG.jpg', date='2026-05-19', date_precision='exact'
WHERE id='8552effb-9fc2-4194-9d3c-0e5bddb18676'; -- Procurement Australia Conference

UPDATE public.events SET organizer_email='events@weldaustralia.com.au', image_url='https://manufacturingsummit.com.au/wp-content/uploads/2026/02/nms2026-banner.png'
WHERE id='46238f44-7a03-4094-bbd3-c442ad782c0b'; -- National Manufacturing Summit (postponed)

UPDATE public.events SET registration_url='https://hrsummit.com.au/register-now', image_url='https://hrsummit.com.au/hs-fs/hubfs/HRD_084_email.jpg'
WHERE id='21c0bcc2-256d-4856-9833-401a6ebc28e3'; -- National HR Summit

UPDATE public.events SET registration_url='https://www.qac2026.com/registration', image_url='https://images.squarespace-cdn.com/content/v1/684e9e79e0d97b3dabd6959b/7658b464-788e-4d51-bf81-43df874a2ca7/Untitled+design+%286%29.png'
WHERE id='cb34a5f1-2b4d-4b04-ad59-5625f2ee1d65'; -- Quantum Australia (2026 past, 2027 TBA)

-- DMWF Australia: no AU instance announced

-- Batch 15
UPDATE public.events SET registration_url='https://vcworldsummit.com/tickets/sydney-2027/', date='2027-02-23', date_precision='exact'
WHERE id='89631055-2de9-44e5-b527-ec50705d7b62'; -- VC World Summit Sydney

UPDATE public.events SET registration_url='https://events.humanitix.com/startup-to-scaleup-summit-2025', organizer_email='hello@s2ssummit.com', date='2026-09-01', date_precision='exact'
WHERE id='0c6fb160-2a2e-4c5c-b6e3-e27151911c3f'; -- S2S Summit

UPDATE public.events SET registration_url='https://anz.datainnovationsummit.com/tickets', organizer_email='apac@datainnovationsummit.com', image_url='https://anz.datainnovationsummit.com/wp-content/uploads/2026/03/Welcome-to-Data-Innovation-Summit-2025.webp', date='2026-09-17', date_precision='exact'
WHERE id='19d4569d-1c90-4725-9a31-237fdabb3c15'; -- Data Innovation Summit ANZ

-- HR Leaders Summit, National Safety Summit WHS Leaders: sites unreachable
