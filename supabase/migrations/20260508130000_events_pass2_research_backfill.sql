-- Pass 2 research backfill: next 30 events by attendees, again driven by 5 parallel research
-- agents querying official websites on 2026-05-08. As before, where a confirmed_date was
-- found we flip date_precision back to 'exact'.

-- Batch 6
UPDATE public.events SET registration_url='https://secure.terrapinn.com/V5/step1.aspx?E=11072&p=1', organizer_email='meg.obrien@terrapinn.com', image_url='https://www.terrapinn-cdn.com/conference/technology-in-government/img/TIG242.png', exhibitors=150, date='2026-08-04', date_precision='exact'
WHERE id='65c60628-bef2-4738-84b0-04e6aeee5a87'; -- Tech in Gov

UPDATE public.events SET registration_url='https://summit.companydirectors.com.au/', organizer_email='nationalevents@aicd.com.au', date='2027-03-09', date_precision='exact'
WHERE id='de994bbd-35a0-4502-9715-d735388bc14e'; -- AICD Australian Governance Summit

UPDATE public.events SET registration_url='https://www.smallbizweek.com.au/2026/tickets-enquiry', organizer_email='info@abfgroup.com.au', date='2026-07-29', date_precision='exact'
WHERE id='916a504c-d43a-4316-b8a2-be63d55da21d'; -- Small Business Expo Australia

-- Build Brisbane Expo, Naturally Good (no future date), Pause Fest (no future date): no actionable updates.

-- Batch 7
UPDATE public.events SET image_url='https://res.cloudinary.com/startup-grind/image/upload/c_scale,w_2560/c_crop,h_640,w_2560,y_0.0_mul_h_sub_0.0_mul_640/c_crop,h_640,w_2560/c_fill,dpr_2.0,f_auto,g_center,q_auto:good/v1/gcs/platform-data-startupgrind/event_banners/apacArtboard%204_MSZ9Dky.png'
WHERE id='f78fb20b-3105-4340-ae38-0cc172c8c513'; -- Startup Grind APAC

UPDATE public.events SET registration_url='https://conference.ageingaustralia.asn.au/ageing-australia-nc-2026/', image_url='https://conference.ageingaustralia.asn.au/wp-content/uploads/2025/12/national-conference-banner-1320x175-1-scaled.jpg', exhibitors=220, date='2026-11-24', date_precision='exact'
WHERE id='4908dbaa-948c-4a37-ae34-4ebf53e0825c'; -- Ageing Australia

UPDATE public.events SET organizer_email='hello@southstart.co'
WHERE id='a9952816-c159-4fad-9ccb-cf3879fba43a'; -- SouthStart

UPDATE public.events SET registration_url='https://www.himss.org/events-overview/apac-conference-and-exhibition/', date='2026-08-23', date_precision='exact'
WHERE id='2d67ea4e-fbf9-46bc-804c-11f854e5ef8e'; -- HIMSS Asia Pacific

-- Xerocon AU, Pacific Mining Expo: site unreachable / no AU 2026 announced.

-- Batch 8
UPDATE public.events SET registration_url='https://6j2wdxu8ain.typeform.com/to/bY6yuOq0', image_url='https://cloud-1de12d.becdn.net/media/original/1ec463e25eda331c2e0dba5a9adabfe9/250917-IntersektDay1-72.jpg', date='2026-09-03', date_precision='exact'
WHERE id='322f7329-3ac8-4f95-8533-eb77c273e1e8'; -- Intersekt

UPDATE public.events SET registration_url='https://mumbrella.com.au/mumbrella360', date='2026-05-26', date_precision='exact'
WHERE id='541c2376-2490-4ffb-80e2-568ba55933c8'; -- Mumbrella360

UPDATE public.events SET registration_url='https://superannuation.asn.au/conference/pricing/', date='2026-11-17', date_precision='exact'
WHERE id='ad7e3d0b-2287-4806-923c-279a8af94cd0'; -- ASFA Conference

UPDATE public.events SET registration_url='https://intersektfestival.com', organizer_email='tori@fintechaustralia.org.au', image_url='https://images.squarespace-cdn.com/content/v1/63869d9c2ee34066ae2291a7/1764545619610-M9J9PHS28RZQIA5SN41F/Banner+Kat%27s+2024+%28169%29+%2843%29.png', date='2026-09-03', date_precision='exact'
WHERE id='f7558608-bed7-45e6-8c40-af466c035fb3'; -- National Fintech Festival

-- AHRI National Convention, Clean Energy Summit: nothing usable found.

-- Batch 9
UPDATE public.events SET registration_url='https://www.informa.com.au/registration/conference/nt-resources-week/', image_url='https://ntresourcesweek.com.au/wp-content/uploads/2024/08/NTRW-bgland-scape.jpg', date='2026-09-02', date_precision='exact'
WHERE id='d738e2f9-b867-44e2-b99d-69b9227d4ab3'; -- NT Resources Week

UPDATE public.events SET date='2026-11-05', date_precision='exact'
WHERE id='4bc0ea48-2148-4010-8af6-c7f5cf857493'; -- Insurance Council of Australia Summit

-- MFAA, SMSF Association, AIIA Reimagination, National Safety Convention SIA: nothing found.

-- Batch 10
UPDATE public.events SET registration_url='https://retailfest26-registration.personatech.com/', image_url='https://i0.wp.com/retailglobal.com.au/wp-content/uploads/2024/07/2024-04-16_RetailFest-110306.jpg?resize=800%2C534&ssl=1', exhibitors=100
WHERE id='5ae9cc10-31f8-4366-8792-cc152ebd1052'; -- Retail Global (RetailFest 2026 just past, 2027 TBA)

UPDATE public.events SET registration_url='https://westtechfest.com.au/event/2026-festival-passes/', organizer_email='westtechfest@curtin.edu.au', date='2026-12-07', date_precision='exact'
WHERE id='54070890-028c-49df-b80c-98b7da8ede82'; -- West Tech Fest

UPDATE public.events SET registration_url='https://yowcon.com/tech-leaders-melbourne-2026/registrations', organizer_email='info@yowconference.com', image_url='https://files.gotocon.com/uploads/files/73/original/1678077740_Tech%20Leaders%20Summit.png', date='2026-06-16', date_precision='exact'
WHERE id='cb06a75a-d01e-4133-8c69-ec77f525a860'; -- YOW

UPDATE public.events SET registration_url='https://www.riuexplorersconference.com.au/', organizer_email='info@verticalevents.com.au', image_url='https://static.wixstatic.com/media/9c283a_9f0739f2b3544b3aaca1960bfc15e4a2~mv2.jpg', date='2027-02-16', date_precision='exact'
WHERE id='79c5f8ed-a104-4429-a4fc-6597dcb15fad'; -- RIU Explorers

-- Aged Care Industry Summit, The Property Congress: nothing found.
