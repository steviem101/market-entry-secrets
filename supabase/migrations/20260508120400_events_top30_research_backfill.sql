-- Research-backfill for the top 30 events by attendees: registration_url, organizer_email,
-- image_url (hero photo), exhibitors count, and the next confirmed start date. Where a
-- confirmed_date was found we flip date_precision back to 'exact'.
-- Source: parallel research agents querying each event's official website on 2026-05-08.
-- 1 event (CeBIT Australia) was deleted because the event was discontinued in 2019.

-- Batch 1
UPDATE public.events SET registration_url='https://airshow.com.au/visitors/trade-visitor/registration/', date='2027-02-23', date_precision='exact'
WHERE id='13ff3038-0dc9-40a7-b196-8c854122582e'; -- Avalon International Airshow

UPDATE public.events SET registration_url='https://www.sydneybuildexpo.com/register-interest', organizer_email='marketing@sydneybuildexpo.com', exhibitors=700, date='2027-04-28', date_precision='exact'
WHERE id='5ac5151c-76e1-4c05-a164-44b72607efaf'; -- Sydney Build Expo

UPDATE public.events SET organizer_email='expo@amda.com.au', exhibitors=900, date='2027-11-02', date_precision='exact'
WHERE id='ba57133f-01e4-4a1f-9678-298a9cc77828'; -- INDO PACIFIC

UPDATE public.events SET registration_url='https://finefoodaustralia.com.au/pre-qualification-form-2026/', organizer_email='finefood@divcom.net.au', exhibitors=900, date='2026-08-31', date_precision='exact'
WHERE id='37b5b129-5b8c-44d4-bff5-58c0f27f3d11'; -- Fine Food Australia

UPDATE public.events SET registration_url='https://tickets.lup.com.au/aus-manufacturing-brisbane26?cat=cat-registration', organizer_email='amw@amtil.com.au', exhibitors=230, date='2026-05-12', date_precision='exact'
WHERE id='cd9a9606-fdf3-44b9-8fa9-71eb1ef5bc68'; -- AMW

UPDATE public.events SET registration_url='https://foodserviceaustralia.com.au/registration-pricing/', organizer_email='customercare@nationalmedia.com.au', date='2026-05-25', date_precision='exact'
WHERE id='a39ca567-2148-42ee-a312-4fd2a747ff0b'; -- Foodservice Australia

-- Batch 2
UPDATE public.events SET registration_url='https://hannoverfairs.eventsair.com/cemat-australia-2026/exhibition-visitor-registration/Site/Register', organizer_email='info@cemat.com.au', date='2026-06-23', date_precision='exact'
WHERE id='c3f9f85c-fb4d-495e-b4f4-ad84fd02bd5b'; -- CeMAT Australia

UPDATE public.events SET registration_url='https://reg.salesforce.com/flow/plus/wtsydney26/sessioncatalog', image_url='https://wp.sfdcdigital.com/en-au/wp-content/uploads/sites/12/2025/11/awtsyd26-hero.png?w=1024'
WHERE id='795381ef-8340-416b-ae1a-e46b4aa1a331'; -- Salesforce Agentforce Sydney

UPDATE public.events SET registration_url='https://www.appex.com.au/register', organizer_email='marketing@appex.com.au', image_url='https://cdn.asp.events/CLIENT_Exhibiti_030C4FB2_97AC_2262_74166DECA5FD4BAB/sites/AusPack-2022/media/appex-2027/1.png', exhibitors=400, date='2027-03-16', date_precision='exact'
WHERE id='740506fc-2479-4048-a07d-54e1a79330d0'; -- AUSPACK

UPDATE public.events SET registration_url='https://imarcglobal.com/register', organizer_email='operations@imarcglobal.com', date='2026-10-27', date_precision='exact'
WHERE id='fd51e9b0-37b7-479b-803a-816968cd8de3'; -- IMARC

UPDATE public.events SET registration_url='https://primecreative.eventsair.com/megatrans-bulk2026/mtar', date='2026-09-16', date_precision='exact'
WHERE id='e62dae06-0678-418d-8317-bcaf76b82427'; -- MEGATRANS

UPDATE public.events SET registration_url='https://events.cpaaustralia.com.au/XYW21Z', date='2026-10-20', date_precision='exact'
WHERE id='760dfd9b-16c4-4180-8608-bf94fdab0a92'; -- CPA Congress

-- Batch 3
UPDATE public.events SET registration_url='https://pages.awscloud.com/aws-summit-sydney-2026-registration.html', organizer_email='aws-summit-sydney-info@amazon.com', image_url='https://d1.awsstatic.com/onedam/marketing-channels/website/aws/en_US/events/approved/images/f80c6282-4979-4fe1-a1d7-4764f24afb1a-aws-conference-stage-presentation-youtube-thumbnail-tpcl3k3xlbg-1280x720.c1244aef21430a60c70e0511b73822516a85c8e0.jpg', date='2026-05-13', date_precision='exact'
WHERE id='0aacb588-2a21-491f-9f79-74eb60a09247'; -- AWS Summit Sydney

UPDATE public.events SET registration_url='https://secure.terrapinn.com/V5/step1.aspx?E=11141', organizer_email='adminau@terrapinn.com', image_url='https://terrapinn-cdn.com/exhibition/accounting-business-expo/Img/abs700r.png', exhibitors=100, date='2027-03-17', date_precision='exact'
WHERE id='9bf533fe-0a57-4ce0-a94f-81d0e0d65301'; -- Accounting & Business Expo

UPDATE public.events SET registration_url='https://secure.terrapinn.com/V5/step1.aspx?E=11004', organizer_email='adminau@terrapinn.com', image_url='https://terrapinn-cdn.com/exhibition/edutech-australia/Img/edutech2025.png', exhibitors=320, date='2026-06-03', date_precision='exact'
WHERE id='2a98599e-df59-4bac-8261-7ca7c9089d19'; -- EduTECH

UPDATE public.events SET registration_url='https://melbournebuildexpo.com/register-ticket', organizer_email='marketing@melbournebuildexpo.com', image_url='https://cdn.asp.events/CLIENT_Oliver_K_15A4C8AE_5056_B739_54CFDE58102DEF33/sites/MBE2025/media/2025-edits/Hero-1-2025.png', exhibitors=350, date='2026-11-25', date_precision='exact'
WHERE id='0039f4e5-0b74-45b9-91ad-bfb578613c78'; -- Melbourne Build Expo

UPDATE public.events SET registration_url='https://foodproexpo.com/register', exhibitors=400, date='2026-07-26', date_precision='exact'
WHERE id='6b9ac7be-d116-4f75-903e-712af24cc201'; -- foodpro

-- CeBIT Australia: discontinued event (last held 2019), website dead. Hard-delete.
DELETE FROM public.events WHERE id='7b908a7d-96a6-4f96-9d71-ae538f048418';

-- Batch 4
UPDATE public.events SET organizer_email='events@qldguild.org.au', exhibitors=450, date='2027-03-18', date_precision='exact'
WHERE id='32d1b3fe-9b77-4ff4-b9e5-afbb940d4c19'; -- APP Conference

UPDATE public.events SET registration_url='https://www.cognitoforms.com/BusinessShowMedia1/TBSOZ26TicketRegistration', organizer_email='enquiries.tbsau@bsmexpo.com', exhibitors=300, date='2026-11-25', date_precision='exact'
WHERE id='fca5ac36-69e2-4be2-868d-1a22cdf05569'; -- The Business Show Australia

UPDATE public.events SET registration_url='https://www.gevme.com/AIME2026-buyer-registration', image_url='https://cdn.asp.events/CLIENT_Talk2Med_555181CA_F9E2_80A6_42262F88172B8903/sites/aime-26/media/2026-photos/26007_0017.jpg', exhibitors=800, date='2027-02-15', date_precision='exact'
WHERE id='9d5f0c55-6454-4899-83ea-86f20d79f30c'; -- AIME

UPDATE public.events SET registration_url='https://www.salesforce.com/au/events/world-tour/melbourne26/', image_url='https://wp.sfdcdigital.com/en-au/wp-content/uploads/sites/12/2026/04/awtmelb26-hub.png?w=1024', date='2026-06-17', date_precision='exact'
WHERE id='b8006246-5753-4280-9a6f-1f90f1aefe21'; -- Agentforce World Tour Melbourne

UPDATE public.events SET registration_url='https://whsshow.com.au/melbourne-register/', organizer_email='spalermo@nationalmedia.com.au', exhibitors=160, date='2026-05-20', date_precision='exact'
WHERE id='1bc800e3-0bc4-4410-b241-15dcf8cff2c8'; -- Workplace Health & Safety Show

-- Build Brisbane Expo: site unreachable, no updates.

-- Batch 5
UPDATE public.events SET image_url='https://naturallygood.com.au/wp-content/uploads/sites/6/2025/05/hero-imagebubble.png'
WHERE id='d4a16445-5f92-44dd-8d07-4a65b14f4821'; -- Naturally Good

UPDATE public.events SET registration_url='https://www.ozwater.org/register/registration', organizer_email='ozwater@awa.asn.au', exhibitors=200, date='2026-05-25', date_precision='exact'
WHERE id='2cd23531-4902-4570-a6ac-0934cc270a07'; -- Ozwater

UPDATE public.events SET organizer_email='info@pausefest.com.au', image_url='https://cdn.prod.website-files.com/6830754254da06a01dffe2ed/683193900093b94feddf8f4d_PF%20landing%20Images2.jpg'
WHERE id='92b92e71-0649-47d9-90ad-1763fb6327e1'; -- Pause Fest

UPDATE public.events SET registration_url='https://www.gartner.com/en/conferences/apac/symposium-australia'
WHERE id='0ec9f49c-6224-42a6-9390-80da0dacaed5'; -- Gartner IT Symposium

UPDATE public.events SET registration_url='https://secure.terrapinn.com/V5/step1.aspx?E=11080&p=1', organizer_email='hello@digitalhealthfest.com.au', exhibitors=350, date='2026-05-20', date_precision='exact'
WHERE id='e5baec3d-6601-47ae-9904-571f60fa321b'; -- Digital Health Festival

-- Xerocon Australia: no AU 2026 instance announced yet, all NULLs from research.
