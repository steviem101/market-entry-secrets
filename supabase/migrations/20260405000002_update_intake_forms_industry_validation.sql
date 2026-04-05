-- Validate user_intake_forms.industry_sector values against linkedin_industries table
-- Replaces the old hardcoded CHECK constraint with a dynamic cross-table validation.

CREATE OR REPLACE FUNCTION public.validate_industry_sector_values(industries text[])
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF industries IS NULL OR array_length(industries, 1) IS NULL THEN
    RETURN true;
  END IF;
  RETURN NOT EXISTS (
    SELECT 1 FROM unnest(industries) AS val
    WHERE val NOT IN (
      SELECT DISTINCT industry_group FROM public.linkedin_industries WHERE is_active = true
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_validate_intake_industry()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.validate_industry_sector_values(NEW.industry_sector) THEN
    RAISE EXCEPTION 'Invalid industry_sector value(s). Values must match linkedin_industries.industry_group.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_intake_industry ON public.user_intake_forms;
CREATE TRIGGER validate_intake_industry
  BEFORE INSERT OR UPDATE ON public.user_intake_forms
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_validate_intake_industry();
