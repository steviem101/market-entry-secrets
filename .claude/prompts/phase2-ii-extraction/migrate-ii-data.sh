#!/usr/bin/env bash
# Phase 2 — RESUMABLE, pooler-safe data move  MES -> Irish Insights.
# bash 3.2 compatible (macOS).
#
# Robustness:
#  - Keyset pagination by id (no skipped/duplicated rows; restartable).
#  - Each chunk is its own SHORT connection with TCP keepalives, so a dead/
#    half-open link ERRORS in ~35s instead of hanging for many minutes.
#  - A watermark (.seq/.lastid) is saved after every successful chunk, so if it
#    stops for ANY reason you just re-run and it resumes from the last good chunk.
#  - Heavy tables (emails/embeddings) use small chunks; light tables big chunks.
#
# RUN IT KEPT-AWAKE (so the Mac can't sleep mid-run):
#   caffeinate -dimsu bash .claude/prompts/phase2-ii-extraction/migrate-ii-data.sh
# If it ever prints "re-run to resume", just run that same line again.

set -uo pipefail
: "${MES_CONN:?set MES_CONN first}"
: "${II_CONN:?set II_CONN first}"

PARTS=ii_data_parts
mkdir -p "$PARTS"
# keepalives => a dead connection fails fast instead of hanging
MES_KA="${MES_CONN}?keepalives=1&keepalives_idle=15&keepalives_interval=5&keepalives_count=4&connect_timeout=20"
TABLES="ii_content ii_curations ii_curated_log ii_experiment_outputs ii_reddit_signals ii_published_archive ii_personal_linkedin_posts ii_prefilter_log ii_intro_archive"

chunk_for() {
  case "$1" in
    ii_content|ii_published_archive|ii_reddit_signals) echo 250 ;;  # big rows
    *) echo 2000 ;;                                                 # light rows
  esac
}

echo "=== DUMP from MES (resumable; re-run the same command to resume) ==="
for t in $TABLES; do
  done_marker="$PARTS/$t.done"
  [ -f "$done_marker" ] && { echo "  $t: complete, skipping"; continue; }
  cs=$(chunk_for "$t")
  seq=0; last=""
  [ -f "$PARTS/$t.seq" ]    && seq=$(cat "$PARTS/$t.seq")
  [ -f "$PARTS/$t.lastid" ] && last=$(cat "$PARTS/$t.lastid")
  # drop any partial/leftover chunk files at or beyond the resume point
  for stale in "$PARTS"/${t}__*.tsv; do
    [ -e "$stale" ] || continue
    num=$(printf '%s' "$stale" | sed -E 's/.*__([0-9]+)\.tsv/\1/')
    [ "$num" -ge "$seq" ] && rm -f "$stale"
  done
  [ "$seq" -gt 0 ] && echo "  $t: resuming from chunk $seq"
  while true; do
    f="$PARTS/${t}__${seq}.tsv"
    if [ -z "$last" ]; then where="true"; else where="id > '$last'::uuid"; fi
    if ! psql "$MES_KA" -v ON_ERROR_STOP=1 -q \
         -c "\copy (select * from public.$t where $where order by id limit $cs) to '$f'"; then
      rm -f "$f"
      echo "  $t: connection dropped at chunk $seq — re-run the same command to resume."
      exit 1
    fi
    rows=$(wc -l < "$f" | tr -d ' ')
    if [ "$rows" -eq 0 ]; then rm -f "$f"; : > "$done_marker"; echo "  $t: done"; break; fi
    last=$(tail -1 "$f" | cut -f1)
    seq=$(( seq + 1 ))
    printf '%s' "$seq"  > "$PARTS/$t.seq"
    printf '%s' "$last" > "$PARTS/$t.lastid"
    printf '    %s: ~%s rows dumped\n' "$t" "$(( seq * cs ))"
  done
done

echo "=== LOAD into Irish Insights (Ireland = fast/local) ==="
LOAD="$PARTS/_load.sql"
{ echo "\\set ON_ERROR_STOP on"
  echo "set session_replication_role = replica;"
  echo "truncate ii_content, ii_curations, ii_curated_log, ii_experiment_outputs, ii_reddit_signals, ii_published_archive, ii_personal_linkedin_posts, ii_prefilter_log, ii_intro_archive;"; } > "$LOAD"
for t in $TABLES; do
  for f in "$PARTS"/${t}__*.tsv; do
    [ -e "$f" ] && echo "\\copy public.$t from '$f'" >> "$LOAD"
  done
done
echo "set session_replication_role = default;" >> "$LOAD"

if ! psql "$II_CONN" -v ON_ERROR_STOP=1 -q -f "$LOAD"; then
  echo ">>> LOAD failed — paste output to Claude."; exit 1
fi

echo
echo "=== DONE. Tell Claude to verify row counts + embeddings. ==="
