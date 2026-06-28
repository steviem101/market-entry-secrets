#!/usr/bin/env bash
# Phase 2 — robust per-table data move MES -> Irish Insights.
# Run with:  bash .claude/prompts/phase2-ii-extraction/migrate-ii-data.sh
# Requires MES_CONN and II_CONN already exported in your shell (and PG17 on PATH).
# Per-table dump with keepalives + retries; only loads if ALL dumps succeed.
# The load is idempotent (truncates the target tables first), so it is safe to re-run.

set -uo pipefail
: "${MES_CONN:?set MES_CONN first}"
: "${II_CONN:?set II_CONN first}"

# keepalive-enhanced source connection (quoted so & is literal, not a background op)
MES_KA="${MES_CONN}?keepalives=1&keepalives_idle=20&keepalives_interval=10&keepalives_count=6"

# Parent-first order (also the correct FK load order as a belt-and-braces).
TABLES="ii_content ii_curations ii_curated_log ii_experiment_outputs ii_reddit_signals ii_published_archive ii_personal_linkedin_posts ii_prefilter_log ii_intro_archive"

mkdir -p ii_data_parts

echo "=== DUMP (one table at a time, up to 3 tries each) ==="
fail=0
for t in $TABLES; do
  ok=0
  for attempt in 1 2 3; do
    if pg_dump "$MES_KA" --data-only --no-owner -t "public.$t" > "ii_data_parts/$t.sql"; then
      ok=1; break
    fi
    echo "    retry $attempt for $t ..."; sleep 3
  done
  sz=$(du -h "ii_data_parts/$t.sql" 2>/dev/null | cut -f1)
  if [ "$ok" -eq 1 ]; then
    echo "  OK   $t ($sz)"
  else
    echo "  FAIL $t  <<< the pooler keeps dropping this table"
    fail=1
  fi
done

if [ "$fail" -ne 0 ]; then
  echo
  echo ">>> A table failed to dump after retries. NOT loading anything."
  echo ">>> Tell Claude which table failed — we'll switch that one to the direct connection (IPv4 add-on)."
  exit 1
fi

echo
echo "=== LOAD into Irish Insights (truncate-then-load; FKs/triggers off for the load) ==="
psql "$II_CONN" -v ON_ERROR_STOP=1 <<'EOF'
set session_replication_role = replica;
truncate ii_content, ii_curations, ii_curated_log, ii_experiment_outputs, ii_reddit_signals,
         ii_published_archive, ii_personal_linkedin_posts, ii_prefilter_log, ii_intro_archive;
\i ii_data_parts/ii_content.sql
\i ii_data_parts/ii_curations.sql
\i ii_data_parts/ii_curated_log.sql
\i ii_data_parts/ii_experiment_outputs.sql
\i ii_data_parts/ii_reddit_signals.sql
\i ii_data_parts/ii_published_archive.sql
\i ii_data_parts/ii_personal_linkedin_posts.sql
\i ii_data_parts/ii_prefilter_log.sql
\i ii_data_parts/ii_intro_archive.sql
set session_replication_role = default;
EOF
rc=$?

echo
if [ "$rc" -eq 0 ]; then
  echo "=== LOAD DONE (psql exit 0). Tell Claude to verify the row counts + embeddings. ==="
else
  echo "=== LOAD hit an error (psql exit $rc). Paste the output to Claude. ==="
fi
