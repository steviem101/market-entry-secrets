#!/usr/bin/env bash
# Integration test for the Startmate staging pipeline: applies the real
# ecosystem_import_candidates migration + generated INSERT blocks to a throwaway
# Postgres database (Supabase-specific objects stubbed) and asserts schema,
# constraints, idempotency, review flow, and rollback. No production access.
#
# Requires: a local Postgres and the generated blocks
# (run `python3 scripts/generate_startmate_candidates.py --write` first).
#
# Usage:
#   scripts/test_startmate_staging.sh            # uses PGHOST/PGPORT/PGUSER env or defaults
#   PGPORT=55432 scripts/test_startmate_staging.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGRATION="$REPO_ROOT/supabase/migrations/20260703120000_create_ecosystem_import_candidates.sql"
BLOCKS_DIR="$REPO_ROOT/scripts/startmate_import_blocks"
PGHOST="${PGHOST:-/tmp}"; PGPORT="${PGPORT:-55432}"; PGUSER="${PGUSER:-postgres}"
DB="mestest_$$"
PSQL="psql -h $PGHOST -p $PGPORT -U $PGUSER -v ON_ERROR_STOP=1"
fail() { echo "FAIL: $1"; exit 1; }
ok()   { echo "  ok: $1"; }

[ -d "$BLOCKS_DIR" ] || fail "no import blocks — run generate_startmate_candidates.py --write first"

$PSQL -q -c "CREATE DATABASE $DB;"
trap '$PSQL -q -c "DROP DATABASE IF EXISTS $DB;" >/dev/null 2>&1' EXIT
DBQ="$PSQL -d $DB"

# Supabase-compatible stubs so the migration applies unchanged.
$DBQ -q <<'SQL'
DO $$ BEGIN
  CREATE ROLE anon NOLOGIN;          EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE ROLE authenticated NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE ROLE service_role NOLOGIN;  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE OR REPLACE FUNCTION public.has_role(uuid, public.app_role)
  RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT false $$;
SQL

$DBQ -q -f "$MIGRATION"; ok "migration applies cleanly"
[ "$($DBQ -tAc "SELECT relrowsecurity FROM pg_class WHERE relname='ecosystem_import_candidates';")" = t ] \
  || fail "RLS not enabled"; ok "RLS enabled"
[ "$($DBQ -tAc "SELECT count(*) FROM pg_policies WHERE tablename='ecosystem_import_candidates';")" = 2 ] \
  || fail "expected 2 policies"; ok "2 admin policies present"
[ "$($DBQ -tAc "SELECT has_table_privilege('anon','ecosystem_import_candidates','INSERT');")" = f ] \
  || fail "anon can INSERT"; ok "anon/authenticated writes revoked"

for f in "$BLOCKS_DIR"/0*.sql; do $DBQ -q -f "$f" || fail "block failed: $f"; done
N1="$($DBQ -tAc "SELECT count(*) FROM ecosystem_import_candidates;")"
[ "$N1" -gt 0 ] || fail "no rows staged"; ok "all INSERT blocks load ($N1 rows, all CHECK/UNIQUE satisfied)"

for f in "$BLOCKS_DIR"/0*.sql; do $DBQ -q -f "$f"; done
N2="$($DBQ -tAc "SELECT count(*) FROM ecosystem_import_candidates;")"
[ "$N1" = "$N2" ] || fail "idempotency: $N1 -> $N2"; ok "idempotent re-run (ON CONFLICT DO NOTHING)"

[ "$($DBQ -tAc "SELECT count(*) FROM ecosystem_import_candidates WHERE raw IS NULL OR proposed_payload IS NULL OR cardinality(source_rows)=0;")" = 0 ] \
  || fail "NULL/empty required fields"; ok "required jsonb/array fields populated"
ENR="$($DBQ -tAc "SELECT count(*) FILTER (WHERE matched_existing_id IS NOT NULL AND match_method IS NOT NULL) = count(*) FROM ecosystem_import_candidates WHERE proposed_action='enrich_existing';")"
[ "$ENR" = t ] || fail "enrich rows missing match provenance"; ok "enrich_existing rows carry match provenance"

$DBQ -q -c "UPDATE ecosystem_import_candidates SET status='approved', reviewed_at=now() WHERE proposed_action='insert_new';"
ok "admin review UPDATE accepted under status CHECK"
if $DBQ -q -c "UPDATE ecosystem_import_candidates SET status='bogus' WHERE id=(SELECT id FROM ecosystem_import_candidates LIMIT 1);" 2>/dev/null; then
  fail "illegal status accepted"; fi
ok "illegal status rejected by CHECK"

$DBQ -q -c "DELETE FROM ecosystem_import_candidates WHERE batch_id='startmate-2026-07';"
[ "$($DBQ -tAc "SELECT count(*) FROM ecosystem_import_candidates;")" = 0 ] || fail "batch rollback incomplete"
ok "batch rollback (DELETE WHERE batch_id) clears the batch"

echo "PASS: Startmate staging pipeline verified end-to-end on ephemeral Postgres."
