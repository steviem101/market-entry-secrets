# MES Unified RAG Layer — `mes_knowledge_base`

A single, semantically-searchable knowledge layer over all customer-facing MES entities, for
MCPs and AI agents. Source tables remain the system of record; `mes_knowledge_base` is a
**derived, rebuildable** search index kept in step by triggers and an auto-embedding cron.

- **Project:** `xhziwveaiuhzdoutpgrh` (MES Platform) only. Content Studio (`rcgaviwbsudouvfwzydq`) is untouched.
- **Embedding model:** OpenAI `text-embedding-3-small` → `vector(1536)` (matches the `ii_*` pipeline).
- **Index:** HNSW cosine + GIN (tsvector, metadata). Retrieval is **hybrid** (vector + tsvector + trigram).

## Architecture

```
source tables ──AFTER INSERT/UPDATE/DELETE trigger──▶ upsert_kb_<entity>() ──▶ mes_knowledge_base
                                                          (PII-stripped content + metadata,        │
                                                           content_hash = md5(content))            │
                                                                                                   ▼
                                          BEFORE INSERT/UPDATE OF content: kb_strip_pii (emails/phones)
                                                                                                   │
   pg_cron (*/2 * * * *) ──net.http_post + Vault secret──▶ embed-knowledge edge fn ──OpenAI──▶ embedding + embedded_hash
                                                                                                   │
   agent / MCP ──▶ knowledge-search edge fn ──▶ match_knowledge() RPC (hybrid, visibility-gated) ──┘
```

## The table

`public.mes_knowledge_base` — RLS enabled, **no anon/authenticated grants**. The only read path is
the `match_knowledge()` SECURITY DEFINER RPC; writes are service-role only. (`rls_enabled_no_policy`
in the advisor is intentional.)

Key columns: `source_table`, `source_id (uuid)`, `chunk_index`, `entity_type`, `title`, `content`
(PII-stripped, embeddable), `metadata (jsonb)`, `content_hash`, `embedding vector(1536)`,
`embedded_hash`, `embedding_model`. Unique on `(source_table, source_id, chunk_index)`.
A row is **stale** (needs re-embedding) when `embedding is null OR embedded_hash <> content_hash`.

### Metadata key contract (agents filter on these ONLY)

| key | type | notes |
|---|---|---|
| `sector` | jsonb array | sector tags / focus; `[]` if none. Filter with `@>` e.g. `{"sector":["fintech"]}` |
| `country` | text or null | |
| `visibility` | `public` \| `member` \| `paid` | gate; anonymous callers only ever see `public` |
| `is_active` | bool | inactive rows are removed from KB, never just flagged |
| `source_url` | text | canonical MES app URL for the entity |
| `plan_tier` | `free`\|`growth`\|`scale`\|`enterprise`\|null | tier hint for upsell |

## Entities, recipe & visibility (v1)

| entity_type | source table | eligibility | visibility | plan_tier |
|---|---|---|---|---|
| `service_provider` | service_providers | all | public | free |
| `event` | events | `status='approved'` | public | free |
| `mentor` | community_members | `is_active` (name suppressed if `is_anonymous`) | public | free |
| `agency` | trade_investment_agencies | `is_active` | public | free |
| `ecosystem` | innovation_ecosystem | all | public | free |
| `investor` | investors | all | **member** | growth |
| `country` | countries | all | public | free |
| `country_faq` | country_faqs | non-empty question | public | free |
| `lead_database` | lead_databases | `status='active'` (catalog only, **never records**) | **paid** | scale |
| `case_study` / `guide` / … | content_items (+ content_bodies) | `status='published'` | public | free |

`content_items` are **chunked**: `chunk_index=0` = summary (title+subtitle+tldr+meta_description);
`chunk_index>=1` = one row per `content_bodies` row (section-bounded). `entity_type` = the item's
`content_type`.

**PII:** emails, phones and structured contact fields (`contact`, `contact_persons`,
`contact_email`, `contact_name`, `organizer_email`, `linkedin_url`) are excluded from `content`.
A centralized `BEFORE INSERT/UPDATE OF content` trigger (`kb_strip_pii`) scrubs any email/phone that
slips in via source prose, as defense in depth.

## Search API (the canonical agent entry point)

### Edge function `knowledge-search` (POST, `verify_jwt=false`)

```jsonc
// request
{ "query": "corporate law firm to enter Australia", "top_k": 10, "filter": { "sector": ["legal"] }, "match_threshold": 0.5 }
// response
{ "query": "...", "count": 10, "allowed_visibility": ["public"],
  "results": [ { "entity_type", "title", "content", "metadata", "source_url", "score", "similarity", "source_table", "source_id" } ] }
```

- Anonymous callers ⇒ `allowed_visibility = ["public"]`. A valid `Authorization: Bearer <jwt>`
  widens to `["public","member"]`, and a paid tier (`user_subscriptions.tier <> 'free'`) to
  `["public","member","paid"]`.
- This is the single tool an agent/MCP should call. **Content Studio's `mes-context` can call this
  cross-project** instead of keyword ranking (separate change; this function is the contract).

### RPC `match_knowledge(query_embedding, query_text, match_count, match_threshold, filter, allowed_visibility)`

`SECURITY DEFINER`; visibility is enforced **inside** the function and never assumed from the caller
(`allowed_visibility` defaults to `['public']`). Hybrid score = `0.6*cosine + 0.25*ts_rank +
0.15*trigram(title)`, so exact-name queries rank correctly (not pure vector). `query_text` is an
addition to the original spec — required to compute the keyword half.

## Operations

- **Backfill / rebuild** (idempotent): `select public.kb_sync_all('<entity>');` where entity ∈
  `service_provider, event, mentor, agency, ecosystem, investor, country, country_faq, lead_database, content_item`.
- **Embedding** drains automatically: `pg_cron` job `embed-knowledge` every 2 min, **hard-capped at
  100 rows/run** (a bulk hash-flip is throttled, not a cost spike). Runs logged to
  `public.knowledge_embed_log`.
- **OpenAI key:** read from the `OPENAI_API_KEY` edge-function env (already configured), falling back
  to a Vault secret `openai_api_key` if ever needed — no redeploy required to rotate via Vault.
- **Internal auth:** cron → `embed-knowledge` uses `x-internal-secret` from Vault
  (`knowledge_internal_secret`), mirroring `process-email-queue`.

## Deferred (out of scope for v1)

- `lead_database_records` + contact-table embedding (PII + paid-tier design).
- Reranking model on top of hybrid results; finer token-aware sub-chunking of long bodies.
- Optional NER scrub of person names that appear in entities' own marketing prose (emails/phones
  already scrubbed; a few public founder/principal names remain editorially).
- Migrating `ii_*` ivfflat indexes to HNSW; backfilling unembedded `ii_content`.
- Multi-language embeddings for non-English source content.
