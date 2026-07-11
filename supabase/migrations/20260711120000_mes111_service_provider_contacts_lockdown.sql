-- MES-111 (AUD-020): close PII read-exposure on service_provider_contacts,
-- mirroring the MES-56 agency_contacts / investors lockdown.
--
-- State going in: "Authenticated can view service provider contacts" USING(true)
-- + an intact authenticated SELECT grant lets ANY signed-in user read
-- full_name/email/phone/linkedin_url. (The table is currently empty, so this is
-- a latent exposure closed pre-launch.) The profile UI only ever renders
-- full_name / role / avatar, never email or phone.
--
-- Pattern (same as agency_contacts_public / investors_public):
--   base table  -> admin-only SELECT policy + client SELECT grants revoked
--   masked view -> SECURITY DEFINER (owner postgres, RLS-exempt), excludes
--                  email/phone, granted to anon + authenticated
--
-- The import-contact-images edge function reads the base table with the service
-- role (bypasses RLS), so it is unaffected. Applies via PR/merge flow only;
-- idempotent for preview-branch replays.

-- 1. Admin-only base
DROP POLICY IF EXISTS "Authenticated can view service provider contacts"
  ON public.service_provider_contacts;

DO $$ BEGIN
  CREATE POLICY "Admins can view service provider contacts"
    ON public.service_provider_contacts FOR SELECT TO authenticated
    USING (public.has_role((SELECT auth.uid()), 'admin'::public.app_role));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

REVOKE SELECT ON TABLE public.service_provider_contacts FROM anon;
REVOKE SELECT ON TABLE public.service_provider_contacts FROM authenticated;
-- Re-grant so the admin-only policy (not a missing grant) is the boundary for
-- admin dashboards; non-admins are stopped by RLS. Mirrors agency_contacts.
GRANT SELECT ON TABLE public.service_provider_contacts TO authenticated;

-- 2. Masked public view: everything the directory UI renders (name/role/
--    LinkedIn/avatar/ordering) but NEVER email or phone.
CREATE OR REPLACE VIEW public.service_provider_contacts_public
WITH (security_invoker = 'false') AS
SELECT
  id,
  service_provider_id,
  full_name,
  role,
  linkedin_url,
  avatar_url,
  is_primary,
  sort_order,
  created_at
FROM public.service_provider_contacts;

ALTER VIEW public.service_provider_contacts_public OWNER TO postgres;
GRANT SELECT ON public.service_provider_contacts_public TO anon;
GRANT SELECT ON public.service_provider_contacts_public TO authenticated;
GRANT SELECT ON public.service_provider_contacts_public TO service_role;
