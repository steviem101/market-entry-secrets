-- Revert Mentors remediation WS-C: strip the `domain` key from every experience
-- tile, returning active tiles to their pre-WS-C {"name": ...} shape.
-- Idempotent.
UPDATE public.community_members cm
SET experience_tiles = (
  SELECT jsonb_agg(tile - 'domain')
  FROM jsonb_array_elements(cm.experience_tiles) tile
)
WHERE jsonb_typeof(experience_tiles) = 'array'
  AND jsonb_array_length(experience_tiles) > 0;
