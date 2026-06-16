# CC Prompt: Build the MES unified RAG layer (`mes_knowledge_base`)
Destination: save to `~/market-entry-secrets/.claude/prompts/mes-knowledge-base-rag.md`.
Run in a fresh Claude Code session.
## Objective
Make all customer-facing MES content and providers semantically searchable by MCPs and AI agents through a single unified knowledge base, with an idempotent pipeline that auto-embeds new and changed content. Source tables remain the system of record; `mes_knowledge_base` is a derived search layer.
## Scope guards (non-negotiable)
- **Project: `xhziwveaiuhzdoutpgrh` (MES Platform) ONLY.** Never touch `rcgaviwbsudouvfwzydq` (Content Studio). Do not read or write Content Studio tables in any phase.
- Discover all schema at runtime via `information_schema.columns`. Never hardcode column names from this prompt; the lists below are starting points to verify, not truth.
- Three-phase gated discipline. No writes, DDL, or migrations until the audit in Phase 1 is reviewed and approved. Each later phase needs explicit approval before applying.
- All migrations reversible. Provide the down migration alongside every up migration.
- Pilot on `service_providers` only, validate retrieval quality, then fan out to other entities.
## Decisions already made (defaults; flag if you would change one)
1. **Unified table, not per-table embedding columns.** One `mes_knowledge_base` with polymorphic `source_table` + `source_id`.
2. **Model: OpenAI `text-embedding-3-small`, `vector(1536)`.** Matches existing `ii_*` pipeline. Store `embedding_model` so future model changes are detectable.
3. **Index: HNSW cosine**, not ivfflat (datasets are small-to-medium; better recall, no retraining as rows grow).
4. **Hybrid search**: vector + keyword (tsvector) fused, exposed through one function. `pg_trgm` is already installed.
5. **Visibility gating is mandatory.** Every row carries a `visibility` in (`public`, `member`, `paid`) and `is_active`. Default search returns `public` + active only. The search edge function widens visibility only for authenticated/entitled callers.
6. **No PII in embeddable text.** Exclude emails, phone numbers, and direct personal contact fields from `content`. Contact rows (`agency_contacts`, `service_provider_contacts`) are not embedded in v1.
7. **Chunking**: short structured entities = one row per record. Long-form (`content_bodies`, report/case-study bodies) = chunk by section, one row per chunk, `chunk_index` set.
## Phase 1: read-only audit (no writes)
Re-verify, do not trust this prompt's numbers (fresh session):
- `pgvector`, `pg_net`, `pg_cron` installed (expected: yes, all three).
- Existing embedding columns and match functions (expected: only `ii_content`, `ii_published_archive`, `ii_reddit_signals` and `match_content` / `match_archive` / `match_emails`).
- The existing cron + `net.http_post` + Vault secret pattern (job that calls `process-email-queue`). Reuse this exact pattern for embedding.
- For each candidate source table below, confirm it exists and list its real columns, primary key type, an `is_active`/`status`/`published` style flag if any, and an `updated_at` if any:
  - `service_providers`, `events`, `community_members`, `trade_investment_agencies`, `innovation_ecosystem`, `investors`, `countries`, `country_faqs`, `country_case_studies`, `content_items`, `content_bodies` (joins via `section_id`), `lead_databases`.
- Confirm whether a Vault secret for OpenAI exists; if not, note that one must be added (`openai_api_key`) before Phase 4.
Output a short findings table and the proposed embed-source recipe (below) reconciled against real columns. Stop for approval.
## Phase 2: schema (migration, needs approval)
Create `public.mes_knowledge_base`:
```sql
create table public.mes_knowledge_base (
  id            uuid primary key default gen_random_uuid(),
  source_table  text not null,
  source_id     uuid not null,
  chunk_index   int  not null default 0,
  entity_type   text not null,          -- service_provider | event | mentor | agency | ecosystem | investor | case_study | country | guide
  title         text,
  content       text not null,          -- embeddable text, PII-stripped
  metadata      jsonb not null default '{}',  -- stable keys: sector, country, visibility, is_active, source_url, plan_tier
  content_hash  text not null,          -- md5(content)
  embedding     vector(1536),
  embedded_hash text,                   -- content_hash at time of embedding; stale when != content_hash
  embedding_model text default 'text-embedding-3-small',
  updated_at    timestamptz not null default now(),
  unique (source_table, source_id, chunk_index)
);
create index mes_kb_embedding_idx on public.mes_knowledge_base
  using hnsw (embedding vector_cosine_ops);
create index mes_kb_metadata_idx on public.mes_knowledge_base using gin (metadata);
create index mes_kb_fts_idx on public.mes_knowledge_base
  using gin (to_tsvector('english', coalesce(title,'') || ' ' || content));
create index mes_kb_stale_idx on public.mes_knowledge_base (id)
  where embedding is null or embedded_hash is distinct from content_hash;
```
Also create `public.knowledge_embed_log` (run_started, batch_size, embedded_count, failed_count, error, finished) for observability.
Metadata key contract (enforce in the sync layer, document in the prompt output): `sector`, `country`, `visibility`, `is_active`, `source_url`, `plan_tier`. Agents filter on these only.
## Phase 3: sync layer (needs approval)
Goal: keep `mes_knowledge_base` in step with sources on insert and update, mark rows stale on content change, remove on delete or deactivation.
- Build a per-entity `upsert_kb_<entity>(source_id)` function that assembles PII-stripped `content` per the recipe, computes `content_hash = md5(content)`, sets `metadata` (including `visibility` and `is_active`), and upserts on `(source_table, source_id, chunk_index)` using `ON CONFLICT ... DO UPDATE` that only rewrites `content`, `content_hash`, `metadata`, `updated_at` (never clobber `embedding` unless `content_hash` changed).
- `AFTER INSERT OR UPDATE` trigger on each source table calls its upsert function. `AFTER DELETE` removes matching KB rows. Inactive/unpublished/draft rows: delete from KB (do not embed). Skeletal UK case-study drafts must be excluded until enriched.
- Long-form chunking: for `content_bodies` and report/case-study bodies, split by `content_sections` / `section_id` boundary, target ~500 to 800 tokens per chunk, write one KB row per chunk with incrementing `chunk_index`.
- Provide a one-off backfill function `kb_sync_all(<entity>)` that re-derives KB rows from a source table (idempotent), for initial population and after taxonomy changes.
Embed-source recipe (verify columns in Phase 1, adjust):
| entity | content = | visibility default |
| --- | --- | --- |
| service_provider | name + description + specialties + categories | public |
| event | title + description + location + sector | public |
| mentor (community_members) | name + role + company + bio (no email/phone) | public |
| agency (trade_investment_agencies) | name + description + services_offered + country | public |
| ecosystem (innovation_ecosystem) | name + description + location + type | public |
| investor | name + thesis/description + stage + sector (no personal contact) | member |
| case_study (content_items + bodies) | title + body chunks | mixed: summary public, full body paid |
| country / country_faqs | name + question + answer + body | public |
| lead_databases | database title + description + record_count (NOT the records themselves) | paid |
Note: `lead_database_records` and contact tables are not embedded in v1 (PII + paid). Revisit only with explicit gating.
## Phase 4: embedding pipeline (needs approval)
Reuse the proven cron + `pg_net` + Vault pattern already in this DB.
- Edge function `embed-knowledge` (deploy via Supabase CLI only, never Lovable; set `verify_jwt: false`, guard with an `x-internal-secret` from Vault exactly like `process-email-queue`). It selects up to `batch_size` rows where `embedding is null or embedded_hash is distinct from content_hash`, embeds `content` via OpenAI, writes `embedding` + `embedded_hash`, logs to `knowledge_embed_log`.
- **Runaway guard**: hard cap `batch_size` (default 100) per invocation. Cron re-fires every 2 minutes and drains the queue gradually. A bulk import that flips thousands of hashes is throttled, not a cost spike.
- `pg_cron` job every 2 minutes calling `embed-knowledge`. Provide the unschedule command in the down migration.
- Idempotent and resumable: re-running embeds only stale rows.
## Phase 5: search interface for MCPs / agents (needs approval)
- RPC `match_knowledge(query_embedding vector, match_count int default 10, match_threshold float default 0.5, filter jsonb default '{}', allowed_visibility text[] default array['public'])`: hybrid score (cosine + ts_rank fusion), `where metadata @> filter and metadata->>'visibility' = any(allowed_visibility) and (metadata->>'is_active')::bool is not false`. `SECURITY DEFINER` but visibility is enforced inside the function, never assumed from the caller.
- Edge function `knowledge-search`: takes a text `query` (+ optional `filter`, `top_k`), embeds via OpenAI, calls `match_knowledge`, returns ranked cross-entity results with `entity_type`, `title`, `content`, `metadata`, `score`, `source_url`. This is the single tool an agent or MCP calls. It sets `allowed_visibility` from the caller's auth/plan; anonymous = `['public']`.
- Document the function as the canonical agent entry point so Content Studio's `mes-context` can later call it cross-project instead of keyword ranking.
## Phase 6: pilot then fan out
1. Apply Phases 2 to 5 wired for `service_providers` only.
2. Backfill, embed, then run 8 to 10 representative queries (exact name, sector intent, location intent, mixed) and eyeball precision. Confirm exact-name queries work (hybrid, not pure vector).
3. On approval, fan out triggers + upsert functions to the remaining entities one at a time, backfilling and validating each before the next.
## Deferred tech debt (do not scope-creep into this build)
- `lead_database_records` and contact-table embedding (needs PII + paid-tier gating design).
- Reranking model on top of hybrid results.
- Migrating `ii_*` ivfflat indexes to HNSW.
- Backfilling the 4165 unembedded `ii_content` rows (separate pipeline, out of scope).
- Cross-project switch of `mes-context` to `knowledge-search` (Content Studio change, separate session).
- Multi-language embeddings for non-English source content.
## Acceptance criteria
- `mes_knowledge_base` populated for `service_providers` with 100% active rows embedded and `embedded_hash = content_hash`.
- Editing a provider's description re-embeds within one cron cycle; deactivating removes it from search.
- `knowledge-search` returns relevant, visibility-correct results for text queries with no PII in `content`.
- Paid/member content never returned to an anonymous caller.
- All migrations have working down migrations; Content Studio untouched.
