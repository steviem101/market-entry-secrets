-- OAuth signups get blank profiles: handle_new_user only copies
-- first_name / last_name / username out of raw_user_meta_data, but OAuth
-- providers (Google, Azure) send full_name / name and avatar_url / picture
-- instead — so every Google signup landed with a nameless, avatar-less
-- profile even though the data was captured in auth.users (verified live
-- 2026-07-09: both existing Google users affected, e.g. Google sent
-- full_name + picture, profiles row all-null).
--
-- Fix, two parts:
--   1. Re-create handle_new_user with an OAuth fallback: when the form
--      fields are absent, derive first/last from full_name (first token /
--      remainder) and take avatar_url ?? picture. Form-driven email/password
--      signups are unchanged — their explicit fields still win.
--   2. Idempotent backfill for existing OAuth users whose profile names are
--      empty. Scoped so user-edited profiles are never overwritten (only
--      rows where first_name AND last_name are both blank), and a no-op on
--      an empty preview DB.
--
-- Same SECURITY DEFINER + empty search_path hardening as the current live
-- definition; all references schema-qualified.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  meta    jsonb := new.raw_user_meta_data;
  v_first text  := nullif(btrim(coalesce(meta ->> 'first_name', '')), '');
  v_last  text  := nullif(btrim(coalesce(meta ->> 'last_name',  '')), '');
  v_full  text  := nullif(btrim(coalesce(meta ->> 'full_name', meta ->> 'name', '')), '');
BEGIN
  -- OAuth fallback: no form-provided first name, but the provider sent a
  -- display name — split it (first token / remainder).
  IF v_first IS NULL AND v_full IS NOT NULL THEN
    v_first := split_part(v_full, ' ', 1);
    v_last  := nullif(btrim(substr(v_full, length(split_part(v_full, ' ', 1)) + 1)), '');
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (id, first_name, last_name, username, avatar_url)
  VALUES (
    new.id,
    v_first,
    v_last,
    meta ->> 'username',
    nullif(btrim(coalesce(meta ->> 'avatar_url', meta ->> 'picture', '')), '')
  );

  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$function$;

-- Backfill existing OAuth users whose profiles are still nameless.
-- Idempotent: after the first run the name is set and the WHERE no longer
-- matches. Never touches rows where the user has entered any name.
UPDATE public.profiles p
SET
  first_name = split_part(v.full_name, ' ', 1),
  last_name  = coalesce(p.last_name,
                 nullif(btrim(substr(v.full_name, length(split_part(v.full_name, ' ', 1)) + 1)), '')),
  avatar_url = coalesce(p.avatar_url, v.avatar_url)
FROM (
  SELECT
    u.id,
    nullif(btrim(coalesce(u.raw_user_meta_data ->> 'full_name',
                          u.raw_user_meta_data ->> 'name', '')), '') AS full_name,
    nullif(btrim(coalesce(u.raw_user_meta_data ->> 'avatar_url',
                          u.raw_user_meta_data ->> 'picture', '')), '') AS avatar_url
  FROM auth.users u
) v
WHERE v.id = p.id
  AND v.full_name IS NOT NULL
  AND nullif(btrim(coalesce(p.first_name, '')), '') IS NULL
  AND nullif(btrim(coalesce(p.last_name,  '')), '') IS NULL;
