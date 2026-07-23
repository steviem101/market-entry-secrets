-- Intelligence layer (Sub-ticket 3) — report-side insight retrieval.
--
-- generate-report needs to ground its sections in the distilled insight cards, but WITHOUT a new
-- embedding/OpenAI call (report-pipeline cost gate). This RPC is a pure metadata retriever over
-- canonical knowledge_insight cards: sector ∪ 'general', intent overlap, corridor match-or-null.
-- No embedding required — all filters are metadata scalars/arrays backed by the GIN index.
--
-- Security: SECURITY DEFINER, service-role only. visibility='internal' is PINNED in the body
-- (never a caller argument) so this can't be turned into an internal-card exfiltration hole the
-- way an early match_knowledge could (fixed in 20260718130000). All additive + reversible.
--
-- Rollback: supabase/rollback/20260722160000_intel_report_insights_rpc_revert.sql

create or replace function public.match_report_insights(
  p_sectors text[],
  p_intents text[],
  p_origin text,
  p_target text default 'Australia',
  p_distiller_version text default 'distill-v2',
  p_limit integer default 40
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
    and (k.metadata->>'visibility') = 'internal'                     -- pinned, never caller-supplied
    and coalesce((k.metadata->>'is_active')::boolean, true) is not false
    and coalesce((k.metadata->>'is_canonical')::boolean, true) = true
    and k.metadata->>'distiller_version' = p_distiller_version
    -- sector ∪ 'general' sentinel; empty p_sectors => no sector restriction
    and (
      p_sectors is null or array_length(p_sectors, 1) is null
      or k.metadata->'sectors' ?| p_sectors
      or k.metadata->'sectors' @> '["general"]'::jsonb
    )
    -- intent overlap; empty p_intents => no intent restriction
    and (
      p_intents is null or array_length(p_intents, 1) is null
      or exists (
        select 1
        from jsonb_array_elements_text(coalesce(k.metadata->'answers_intents', '[]'::jsonb)) ai
        where ai = any(p_intents)
      )
    )
    -- corridor match-or-null: a card with no origin/target applies to any entrant
    and (k.metadata->>'origin_country' is null or k.metadata->>'origin_country' = p_origin)
    and (k.metadata->>'target_country' is null or k.metadata->>'target_country' = p_target)
  order by coalesce((k.metadata->>'is_proprietary')::boolean, false) desc, k.updated_at desc
  limit greatest(p_limit, 1);
$function$;

revoke all on function public.match_report_insights(text[], text[], text, text, text, integer) from public, anon, authenticated;
grant execute on function public.match_report_insights(text[], text[], text, text, text, integer) to service_role;

comment on function public.match_report_insights(text[], text[], text, text, text, integer) is
  'Metadata-only retrieval of canonical knowledge_insight cards for report grounding (Sub-ticket 3): '
  'sector-or-general, intent-overlap, corridor-match-or-null. No embedding. Read-only, service-role only, '
  'visibility=internal pinned. Consumed by generate-report behind REPORT_INSIGHTS_ENABLED.';
