-- Revert of 20260723120000_intel_report_insights_rank.sql.
-- Restores the PRIOR (20260722160000) function body: proprietary-desc + updated_at-desc ordering,
-- default pool 40. CREATE OR REPLACE (not DROP) so match_report_insights stays present and callable
-- — generate-report can keep calling it. Security/signature/grants are identical to both versions.

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
  order by coalesce((k.metadata->>'is_proprietary')::boolean, false) desc, k.updated_at desc
  limit greatest(p_limit, 1);
$function$;

revoke all on function public.match_report_insights(text[], text[], text, text, text, integer) from public, anon, authenticated;
grant execute on function public.match_report_insights(text[], text[], text, text, text, integer) to service_role;
