-- The 83 logos using the dead pk_ZDgrKooYR4myUNCcckiOsg img.logo.dev token all return
-- 401 "invalid api token". NULL them so the CompanyLogo component regenerates working
-- logo URLs at render time using the live token in src/lib/logoUtils.ts.

UPDATE public.events
SET event_logo_url = NULL
WHERE event_logo_url LIKE '%pk_ZDgrKooYR4myUNCcckiOsg%';
