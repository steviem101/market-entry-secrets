-- Migration 004: Create persona filter helper function
CREATE OR REPLACE FUNCTION get_content_for_persona(
  p_persona text,
  p_table_name text,
  p_limit int DEFAULT 50
)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE format(
    'SELECT row_to_json(t) FROM public.%I t
     WHERE target_personas @> ARRAY[$1]
        OR target_personas = ''{}''
     LIMIT $2',
    p_table_name
  ) USING p_persona, p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION get_content_for_persona
  TO anon, authenticated;
