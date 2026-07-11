# Phase 2 — exact pg_dump / psql commands (run on YOUR Mac)

> These run from a machine with **PostgreSQL 17 client tools** and DB reach.
> The CC sandbox can't (pg_dump v16 < PG17 server; no IPv6). CC does the MES-side
> drop (step 8) and all verification via MCP.
>
> **Confirm first:** `pg_dump --version` → must be **17.x** (server is 17.4 MES / 17.6 II).
> Homebrew: `brew install postgresql@17` then use
> `/opt/homebrew/opt/postgresql@17/bin/pg_dump` & `.../psql`.

## 0. Connection strings (Supabase dashboard → Settings → Database → Connection string)

Use the **Session pooler** string if your network is IPv4-only (direct `db.<ref>...`
is IPv6). URL-encode the password.

```bash
export MES_CONN='postgresql://postgres.xhziwveaiuhzdoutpgrh:<PW>@<host>:5432/postgres'   # SOURCE (read-only here)
export II_CONN='postgresql://postgres.schyrnxekxcoaragofgv:<PW>@<host>:5432/postgres'    # TARGET (Irish Insights)
```

Shared table set (the 9 ii_* tables):

```bash
II_TABLES=(-t public.ii_content -t public.ii_curations -t public.ii_curated_log \
  -t public.ii_experiment_outputs -t public.ii_reddit_signals \
  -t public.ii_published_archive -t public.ii_personal_linkedin_posts \
  -t public.ii_prefilter_log -t public.ii_intro_archive)
```

Restore order is **extensions → trigger fns → schema → RPC fns → data**
(see 20-ii-trigger-functions.sql / 21-ii-rpc-functions.sql for the why).
Extensions are already enabled on the target by CC (vector 0.8.0 + pg_trgm 1.6, public).

---

## STEP 4a — SCHEMA move (no freeze needed; schema is static)

```bash
# (1) trigger functions FIRST — so the dump's CREATE TRIGGER statements resolve
psql "$II_CONN" -v ON_ERROR_STOP=1 -f .claude/prompts/phase2-ii-extraction/20-ii-trigger-functions.sql

# (2) schema-only dump of the 9 tables (indexes, RLS, triggers, identity seq travel with it)
pg_dump "$MES_CONN" --schema-only --no-owner --no-privileges "${II_TABLES[@]}" > ii_schema.sql
#   --> eyeball ii_schema.sql: 9 CREATE TABLE, ivfflat indexes, the 4 CREATE TRIGGER,
#       "Read relevant content" POLICY on ii_content, ENABLE ROW LEVEL SECURITY x9.

# (3) restore schema
psql "$II_CONN" -v ON_ERROR_STOP=1 -f ii_schema.sql

# (4) RPC functions LAST (need the tables to exist)
psql "$II_CONN" -v ON_ERROR_STOP=1 -f .claude/prompts/phase2-ii-extraction/21-ii-rpc-functions.sql
```

After 4a, ping CC → it verifies tables/indexes/RLS/policy/functions via MCP before data.

---

## STEP 4b — DATA move  ⚠️ CUTOVER (do during a write-freeze; see note below)

```bash
# (1) capture MES counts at this instant (paste the output to CC for exact verification)
psql "$MES_CONN" -At -F$'\t' -c "
  select 'ii_content',count(*) from public.ii_content
  union all select 'ii_prefilter_log',count(*) from public.ii_prefilter_log
  union all select 'ii_curated_log',count(*) from public.ii_curated_log
  union all select 'ii_curations',count(*) from public.ii_curations
  union all select 'ii_published_archive',count(*) from public.ii_published_archive
  union all select 'ii_reddit_signals',count(*) from public.ii_reddit_signals
  union all select 'ii_experiment_outputs',count(*) from public.ii_experiment_outputs
  union all select 'ii_intro_archive',count(*) from public.ii_intro_archive
  union all select 'ii_personal_linkedin_posts',count(*) from public.ii_personal_linkedin_posts
  order by 1;"

# (2) data-only dump (embeddings copy as-is; same pgvector 0.8.0 both sides)
pg_dump "$MES_CONN" --data-only --no-owner "${II_TABLES[@]}" > ii_data.sql

# (3) restore data with FKs + triggers suppressed for the load (Supabase-safe;
#     avoids --disable-triggers privilege issues and any FK ordering edge case)
psql "$II_CONN" -v ON_ERROR_STOP=1 <<'EOF'
set session_replication_role = replica;
\i ii_data.sql
set session_replication_role = default;
EOF
```

After 4b, ping CC → it verifies row counts == the STEP 4b(1) snapshot exactly, runs a
similarity self-check, and a real `match_content` call.

> **Why a freeze.** MES is live — `ii_*` drifted ~+600 rows over 2 days (Apify, Beehiiv,
> the research workflow, the Python classifier keep writing). A clean cutover = quiesce
> those external writers, run 4b, repoint them (step 6) to the new project, resume. If a
> freeze isn't practical, tell CC and we'll do a delta top-up via the upsert RPCs + unique
> indexes instead (a bit more fiddly). The newsletter backend is not user-facing realtime,
> so a short freeze is the safe default.

---

## STEP 6 — edge functions + consumer repoint (you / ii-ingest repo)

Not in this repo. `supabase functions deploy apify-webhook --project-ref schyrnxekxcoaragofgv`
and `... notion-research-trigger ...` from the ii-ingest codebase, set their secrets
(list in 00-runbook.md §1), then repoint: Apify task `3RnAZzC9CsXXPZrbM` webhook URL,
the Notion automation URL, `research.yml` env, Beehiiv, the Python classifier — all to
`https://schyrnxekxcoaragofgv.functions.supabase.co/...` + the new service-role key.
(Or hand CC the function source + secret values and it can deploy via MCP.)
