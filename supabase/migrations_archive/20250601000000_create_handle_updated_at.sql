-- Create the handle_updated_at() trigger function used by all tables with updated_at columns.
-- This function was originally created manually on the production database outside of migrations.
-- Adding it here so Supabase Preview (which runs all migrations from scratch) can succeed.

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
