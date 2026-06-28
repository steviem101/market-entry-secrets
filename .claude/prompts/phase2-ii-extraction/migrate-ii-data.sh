#!/usr/bin/env bash
# Phase 2 — chunked, pooler-safe data move  MES -> Irish Insights.
# (bash 3.2 compatible — macOS default bash; no associative arrays.)
#
# Why chunked: the shared session pooler drops large COPY streams (ii_content).
# This dumps every ii_* table in small CHUNK-row slices inside ONE
# repeatable-read transaction — tiny transfers the pooler won't drop, AND a
# single consistent snapshot so no row is skipped while MES keeps writing.
# Then truncate-loads them into Irish Insights (idempotent / re-runnable).
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

# dump script header (one consistent snapshot)
{ printf '%s\n' "\\set ON_ERROR_STOP on" "begin isolation level repeatable read;"; } > "$DUMP"
# load script header (FKs/triggers off, fresh load)
{ printf '%s\n' "\\set ON_ERROR_STOP on" "set session_replication_role = replica;" \
    "truncate ii_content, ii_curations, ii_curated_log, ii_experiment_outputs, ii_reddit_signals, ii_published_archive, ii_personal_linkedin_posts, ii_prefilter_log, ii_intro_archive;"; } > "$LOAD"

echo "=== counting source rows (dump-time snapshot) ==="
total_chunks=0
for t in $TABLES; do
  n=$(psql "$MES_CONN" -At -c "select count(*) from public.$t" | tr -d '[:space:]')
  case "$n" in ''|*[!0-9]*) echo ">>> count failed for $t (got '$n') — paste to Claude."; exit 1;; esac
  printf '  %-28s %s\n' "$t" "$n"
  off=0; seq=0
  limit=$(( n + CHUNK ))          # one extra chunk of headroom covers live drift
  while [ "$off" -lt "$limit" ]; do
    f=$(printf '%s/%s_%05d.tsv' "$PARTS" "$t" "$seq")
    printf "\\copy (select * from public.%s order by id offset %d limit %d) to '%s'\n" "$t" "$off" "$CHUNK" "$f" >> "$DUMP"
    printf "\\copy public.%s from '%s'\n" "$t" "$f" >> "$LOAD"
    off=$(( off + CHUNK )); seq=$(( seq + 1 )); total_chunks=$(( total_chunks + 1 ))
  done
done
printf '%s\n' "commit;" >> "$DUMP"
printf '%s\n' "set session_replication_role = default;" >> "$LOAD"

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
echo "=== DONE. Tell Claude to verify row counts + embeddings. ==="
