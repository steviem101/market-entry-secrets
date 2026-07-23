-- Intelligence layer (Sub-ticket 3, refinement) — rank sector-specific insights above generic.
--
-- The corpus is ~60% 'general'-only cards, so the earlier recency-only ordering let generic
-- insights crowd the candidate pool (and, downstream, the 6-card-per-section cap) ahead of the
-- sector-specific cards that actually differentiate a report. This re-orders the retriever to
-- surface sector/corridor-specific cards first, and raises the default pool to 60 so a section's
-- specific cards survive to the per-section pick. Proprietary stays the top key as a future-proof
-- tiebreak (the corpus currently has none). No signature/security change — CREATE OR REPLACE only.
--
-- Rollback: supabase/rollback/20260723120000_intel_report_insights_rank_revert.sql
-- (reverts to the 20260722160000 body).

create or replace function public.match_report_insights(
  p_sectors text[],
  p_intents text[],
  p_origin text,
  p_target text default 'Australia',
  p_distiller_version text default 'distill-v2',
  p_limit integer default 60
)
returns table (claim text, topic_lane text, sectors jsonb, answers_intents jsonb, is_proprietary boolean)
language sql
stable
security definer
set search_path to 'public'
as $function$
  select
    k.content                                                        as claim,
    k.metadata->>'topic_lane'                                        as topic_lane,
    coalesce(k.metadata->'sectors', '[]'::jsonb)                     as sectors,
    coalesce(k.metadata->'answers_intents', '[]'::jsonb)            as answers_intents,
    coalesce((k.metadata->>'is_proprietary')::boolean, false)        as is_proprietary
  from public.mes_knowledge_base k
  where k.entity_type = 'knowledge_insight'
    and (k.metadata->>'visibility') = 'internal'
    and coalesce((k.metadata->>'is_active')::boolean, true) is not false
    and coalesce((k.metadata->>'is_canonical')::boolean, true) = true
    and k.metadata->>'distiller_version' = p_distiller_version
    and (
      p_sectors is null or array_length(p_sectors, 1) is null
      or k.metadata->'sectors' ?| p_sectors
      or k.metadata->'sectors' @> '["general"]'::jsonb
    )
    and (
      p_intents is null or array_length(p_intents, 1) is null
      or exists (
        select 1
        from jsonb_array_elements_text(coalesce(k.metadata->'answers_intents', '[]'::jsonb)) ai
        where ai = any(p_intents)
      )
    )
    and (k.metadata->>'origin_country' is null or k.metadata->>'origin_country' = p_origin)
    and (k.metadata->>'target_country' is null or k.metadata->>'target_country' = p_target)
  order by
    coalesce((k.metadata->>'is_proprietary')::boolean, false) desc,           -- proprietary first (future-proof)
    (k.metadata->'sectors' @> '["general"]'::jsonb
       and jsonb_array_length(coalesce(k.metadata->'sectors', '[]'::jsonb)) = 1) asc,  -- sector-specific before general-only
    (k.metadata->>'origin_country' is not null and k.metadata->>'origin_country' = p_origin) desc,  -- corridor-specific next
    k.updated_at desc
  limit greatest(p_limit, 1);
$function$;

revoke all on function public.match_report_insights(text[], text[], text, text, text, integer) from public, anon, authenticated;
grant execute on function public.match_report_insights(text[], text[], text, text, text, integer) to service_role;

comment on function public.match_report_insights(text[], text[], text, text, text, integer) is
  'Metadata-only retrieval of canonical knowledge_insight cards for report grounding (Sub-ticket 3): '
  'sector-or-general, intent-overlap, corridor-match-or-null, ordered sector/corridor-specific first. '
  'No embedding. Read-only, service-role only, visibility=internal pinned. Consumed by generate-report '
  'behind REPORT_INSIGHTS_ENABLED.';
