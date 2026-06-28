#!/usr/bin/env bash
# Phase 2 — chunked, pooler-safe data move  MES -> Irish Insights.
#
# Why chunked: the shared session pooler drops large COPY streams (ii_content).
# This dumps every ii_* table in small CHUNK-row slices inside ONE
# repeatable-read transaction — tiny transfers the pooler won't drop, AND a
# single consistent snapshot so no row is skipped while MES keeps writing.
# Then it truncate-loads them into Irish Insights (idempotent / re-runnable).
#
# Run:  bash .claude/prompts/phase2-ii-extraction/migrate-ii-data.sh
# Needs MES_CONN + II_CONN exported and PG17 on PATH.

set -uo pipefail
: "${MES_CONN:?set MES_CONN first}"
: "${II_CONN:?set II_CONN first}"

CHUNK=250
PARTS=ii_data_parts
DUMP=_ii_dump.sql
LOAD=_ii_load.sql
# parent-first order (also correct FK load order, belt-and-braces)
TABLES="ii_content ii_curations ii_curated_log ii_experiment_outputs ii_reddit_signals ii_published_archive ii_personal_linkedin_posts ii_prefilter_log ii_intro_archive"

rm -rf "$PARTS"; mkdir -p "$PARTS"

echo "=== counting source rows (dump-time snapshot) ==="
declare -A CNT
while read -r t n; do
  [ -n "${t:-}" ] && CNT[$t]=$n && printf "  %-28s %s\n" "$t" "$n"
done < <(psql "$MES_CONN" -At -F' ' -c "
  select 'ii_content',count(*) from public.ii_content
  union all select 'ii_curations',count(*) from public.ii_curations
  union all select 'ii_curated_log',count(*) from public.ii_curated_log
  union all select 'ii_experiment_outputs',count(*) from public.ii_experiment_outputs
  union all select 'ii_reddit_signals',count(*) from public.ii_reddit_signals
  union all select 'ii_published_archive',count(*) from public.ii_published_archive
  union all select 'ii_personal_linkedin_posts',count(*) from public.ii_personal_linkedin_posts
  union all select 'ii_prefilter_log',count(*) from public.ii_prefilter_log
  union all select 'ii_intro_archive',count(*) from public.ii_intro_archive;")

# ---- build the dump script (one consistent snapshot) and the load script ----
{ echo "\\set ON_ERROR_STOP on"
  echo "begin isolation level repeatable read;"; } > "$DUMP"
{ echo "\\set ON_ERROR_STOP on"
  echo "set session_replication_role = replica;"
  echo "truncate ii_content, ii_curations, ii_curated_log, ii_experiment_outputs, ii_reddit_signals, ii_published_archive, ii_personal_linkedin_posts, ii_prefilter_log, ii_intro_archive;"; } > "$LOAD"

total_chunks=0
for t in $TABLES; do
  n=${CNT[$t]:-0}
  off=0; seq=0
  while [ "$off" -lt "$n" ]; do
    f=$(printf "%s/%s_%05d.tsv" "$PARTS" "$t" "$seq")
    printf "\\copy (select * from public.%s order by id offset %d limit %d) to '%s'\n" "$t" "$off" "$CHUNK" "$f" >> "$DUMP"
    printf "\\copy public.%s from '%s'\n" "$t" "$f" >> "$LOAD"
    off=$((off + CHUNK)); seq=$((seq + 1)); total_chunks=$((total_chunks + 1))
  done
done
echo "commit;" >> "$DUMP"
echo "set session_replication_role = default;" >> "$LOAD"

echo "=== DUMP: $total_chunks chunk(s) of $CHUNK rows, single snapshot ==="
if ! psql "$MES_CONN" -q -v ON_ERROR_STOP=1 -f "$DUMP"; then
  echo ">>> DUMP failed — paste output to Claude."; exit 1
fi
echo "  wrote $(find "$PARTS" -type f | wc -l | tr -d ' ') files"

echo "=== LOAD into Irish Insights (truncate-then-load) ==="
if ! psql "$II_CONN" -q -v ON_ERROR_STOP=1 -f "$LOAD"; then
  echo ">>> LOAD failed — paste output to Claude."; exit 1
fi

echo
echo "=== DONE. Source snapshot counts were: ==="
for t in $TABLES; do printf "  %-28s %s\n" "$t" "${CNT[$t]:-0}"; done
echo "Tell Claude to verify the new database matches these + test embeddings."
