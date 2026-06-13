# MES Platform Comprehensive Review - Claude Code Prompt

> Save to: `~/market-entry-secrets/.claude/prompts/platform-review-2026-06.md`
> Run in: a fresh Claude Code session, MES Platform workstream only
> Model: Claude Fable 5

---

## Role and objective

You are conducting a full-platform review of **Market Entry Secrets (MES)**, a B2B intelligence platform helping international companies enter the Australian and New Zealand markets. Your job is to audit what already exists, identify defects, gaps, risks, and improvement opportunities, and produce a prioritised, actionable findings report.

This is a **review, not a build**. You analyse and document. You do not fix anything in this session unless explicitly approved per finding in Phase 3.

## Hard constraints (read before anything else)

1. **Project scope**: MES Platform only, Supabase project ref `xhziwveaiuhzdoutpgrh`. The Content Studio project (`rcgaviwbsudouvfwzydq`) is **strictly out of scope**. If any step would read from, write to, or affect Content Studio, HALT and report.
2. **One known cross-project dependency**: the `mes-context` edge function on Content Studio reads MES tables via the MES anon key. When reviewing RLS or anon access, flag any finding that could break this dependency. Do not test against Content Studio endpoints in this session; just flag.
3. **Freemium funnel is sacred**: the anonymous funnel (3 free entity views before auth gate) must be preserved. Any recommendation that would break anonymous read access for funnel-critical tables must say so explicitly and propose a funnel-safe alternative.
4. **Phase gates are non-negotiable**: Phase 1 is read-only. Phase 2 is a written plan requiring my explicit approval. Phase 3 (if it happens at all) is one finding at a time, each with its own approval.
5. **Schema discovery at runtime**: never assume table or column names. Query `information_schema.columns` and `information_schema.tables` before interacting with any table. Known quirks to verify, not assume: `content_bodies` joins via `section_id` to `content_sections` (not directly to `content_id`); `investors` unique constraint is on `slug` not `name`.
6. **No destructive queries, ever**: SELECT and EXPLAIN only in Phase 1. No INSERT, UPDATE, DELETE, ALTER, or function deployment.
7. **No secrets in output**: if you encounter API keys, service role keys, or webhook secrets anywhere (code, env files, edge function source, database rows), report the location and exposure type but never reproduce the value.

---

## Phase 1: Read-only audit

Work through the eight audit areas below. For each, gather evidence (queries, file reads, grep results) before forming conclusions. Use sub-agents per area if the session gets long, but keep all writes to a single findings file at `~/market-entry-secrets/.claude/reviews/platform-review-findings.md` (append-only, structured per the output format at the end).

### Area 1: Database schema and data model

- Enumerate all tables, row counts, column types, constraints, indexes, foreign keys
- Identify: missing FKs where relationships clearly exist, missing indexes on common filter columns (sector, country, slug, status fields), inconsistent naming conventions, nullable columns that should have constraints, text columns storing what should be enums or FKs
- Check for single-market assumptions baked into schema (hardcoded "Australia", missing country dimension on tables that will need it for UK/US/Singapore/Canada rollout)
- Verify `seo_canonical_url` and `sitemap_priority` exist where the country page schema specified them
- Flag orphaned tables (zero rows, no code references) and tables with obvious duplication or denormalisation that causes drift
- Assess readiness for the planned `mes_knowledge_base` RAG layer: which tables have clean enough text fields and metadata to feed embeddings, which need cleanup first

### Area 2: RLS and security posture

- For every table: list current RLS policies (or absence), what role can read/write, and whether that matches its sensitivity
- Cross-reference against the five known security workstreams (A: public read exposure of PII/commercial data, B: anonymous chat session scoping, C: over-permissive writes, D: edge function vulnerabilities including PostgREST filter injection and service role embedding contact data in report JSON, E: hygiene). Report which items appear remediated, which remain open, and anything new not in the original list
- Specifically verify: can the anon role still read everything mes-context needs? Can the anon role read anything it should not (emails, phone numbers, pricing, lead data)?
- Check edge functions for: verify_jwt settings vs their calling pattern (internal vs client-facing), header auth presence (`x-webhook-secret`), input validation, direct string interpolation into PostgREST filters, service role usage where anon would suffice
- Check Storage buckets: public vs private, policy coverage

### Area 3: Edge functions

- Inventory all deployed functions: name, version, purpose, JWT setting, secrets used
- For each: read the source if available in the repo, assess error handling, timeout risk, retry behaviour, logging quality, dead code
- Flag functions that duplicate logic, functions with no callers, and functions where Claude API model strings are outdated or hardcoded in multiple places
- Review the report generator and any chat-related functions against the designed architecture (single `homepage-chat` function, 9 tools, anonymous session model with cookie UUIDs, intent-triggered gating) and report drift between design and implementation

### Area 4: Data quality

- Per content table (`trade_investment_agencies`, `innovation_ecosystem`, `service_providers`, `events`, `case studies`/content tables, `investors`, `community_members`, leads tables): compute a quality profile - null rates on key fields, empty arrays, duplicate detection on name/domain/slug, malformed URLs, stale `updated_at`, records flagged `needs_re_research`
- Use `COALESCE((condition)::int, 0)` casting in any richness/completeness scoring to avoid NULL propagation
- Report which tables have been through cleanup passes (trade_investment_agencies Pass 1 is done; verify its current state) and which are untouched
- Verify the 20 UK case study skeletons: confirm they exist, confirm they are still thin, confirm update-not-insert is the right path
- Logo coverage: which tables have logo URLs, what proportion resolve to logo.dev vs null vs dead links (do not fetch every URL; sample 10 per table)

### Area 5: Frontend code quality (Lovable repo)

- Repo at `~/market-entry-secrets`. Audit the React/TypeScript codebase for: component sprawl, duplicated data-fetching logic, hardcoded table/column names that contradict the schema-discovery principle, hardcoded copy that should be data-driven, inconsistent use of shadcn/ui vs custom components
- Brand compliance spot check: teal `#2B7A8C`, light blue `#B8E4F0`, dark text `#1A1A2E`; flag colour drift and any long dashes in UI copy
- Check the freemium gate implementation: where the 3-view counter lives, whether it is trivially bypassable (localStorage clear, incognito), and whether that is acceptable for current stage
- Routing and page inventory: list all routes, identify dead routes, broken links, pages still on mock data
- Confirm the known constraint is respected, not fought: the Lovable SPA is not crawlable; flag any half-built SEO work inside the SPA that belongs in the deferred v2 indexable layer instead

### Area 6: Auth, billing, and email

- Auth flows: signup, login, password reset, anonymous-to-authenticated session linking (designed for chat; check what exists)
- Stripe: which products/prices exist in code, webhook handling, failure modes (failed payment, cancelled subscription, plan-gating enforcement in RLS or app code), test vs live key hygiene
- Resend: which transactional emails exist, sending domain config references (`noreply@marketentrysecrets.com`), error handling on send failure

### Area 7: AI features

- Market entry report generator: end-to-end trace from intake to output. Assess prompt quality, model/version pinning, token cost per report, failure handling, and the known issue of service role embedding contact data in report JSON
- Homepage chat: report implementation status vs the full design (it may be design-only; confirm)
- Any embeddings/pgvector usage on the MES Platform project itself (distinct from Content Studio): what exists, what is stale

### Area 8: Platform hygiene and operations

- Migrations: are they in version control, do they match live schema (drift check)
- Environment variables: inventory referenced env vars in code vs what is documented; flag undocumented ones
- Dead code, unused dependencies, console.log noise, TODO/FIXME comments worth promoting to backlog items
- CLAUDE.md and Lovable Knowledge Base: are they current with the live schema and architecture, or stale
- Anything that should feed the planned always-on agents (schema drift monitor, data quality digest) - note signals worth automating

**Phase 1 ends with a hard stop.** Write the findings file, print a summary, and wait.

---

## Phase 2: Findings report and prioritised plan

Only after Phase 1 is complete, produce:

1. **Executive summary**: 10 lines max. Overall health grade per area (A-F), top 3 risks, top 3 quick wins.
2. **Findings table**, every finding as a row:

| ID | Area | Finding | Severity | Effort | Funnel risk | Content Studio risk | Recommendation |
|----|------|---------|----------|--------|-------------|--------------------|----------------|

- Severity: Critical (data exposure, broken core flow), High (defect affecting users), Medium (debt slowing development), Low (polish)
- Effort: S (<1hr), M (half day), L (multi-day)
- Funnel risk: Yes/No - does the fix touch the anonymous funnel
- Content Studio risk: Yes/No - does the fix touch anon read paths mes-context depends on

3. **Proposed fix sequence**: ordered batches respecting dependencies, Critical first, with each batch sized for one CC session. For any batch touching RLS, include the standard verification matrix (anon, authenticated, service role) and the cross-project canary note.
4. **Explicitly out of scope for fixes**: anything that belongs to a planned future workstream (indexable layer, country rollout, homepage chat build, knowledge base) goes in a "feed to roadmap" list, not the fix queue.

**Phase 2 ends with a hard stop. Do not implement anything without my explicit written approval of specific finding IDs.**

---

## Phase 3: Implementation (approval-gated, likely a separate session)

If I approve specific finding IDs:

- One finding at a time, smallest first within the approved set
- Schema discovery before every table interaction
- Idempotent patterns only: `COALESCE(NULLIF(EXCLUDED.field, ''), table.field)` for upserts, `CASE WHEN array = '{}'::text[] THEN EXCLUDED.array ELSE array END` for arrays
- Edge function changes deploy via Supabase CLI only, never Lovable
- After any RLS change: run the verification matrix (anon, authenticated, service role) and remind me to run the Content Studio canary test against `generate-content`
- Pilot-before-fan-out for any data change: 5-10 records, show results, wait for approval, then full set
- Stop and report after each finding

---

## Output format for each finding (Phase 1 findings file)

```
### [AREA-NN] Short title
- Severity: Critical | High | Medium | Low
- Evidence: query or file path + what was observed
- Impact: who/what is affected
- Recommendation: specific fix, one paragraph
- Funnel risk: Yes/No
- Content Studio risk: Yes/No
- Effort: S/M/L
```

## Session hygiene

- If the session gets long enough to risk tool_use ID conflicts, checkpoint the findings file and tell me to start a fresh session for remaining areas rather than pushing through
- Keep a running area-completion checklist at the top of the findings file so a fresh session can resume cleanly
