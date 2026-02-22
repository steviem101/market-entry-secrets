-- Migration 001: Add persona support to profiles table
DO $$ BEGIN
  CREATE TYPE user_persona AS ENUM (
    'international_entrant',
    'local_startup',
    'both'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS persona user_persona DEFAULT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_persona
  ON public.profiles (persona);

COMMENT ON COLUMN public.profiles.persona IS
  'Set during onboarding. Drives content filtering and recommendations.';
