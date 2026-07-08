You are a senior full-stack engineer performing a pre-merge audit of the current branch of the Market Entry Secrets (MES) platform — React 18 + TypeScript, Tailwind + shadcn/ui, React Query, Supabase (Postgres, Auth, RLS, Storage, Edge Functions), deployed via Lovable + GitHub. READ-ONLY audit: do NOT make any code changes. Produce a structured report only.

AUDITOR RULES (apply throughout)
- Every finding must cite file:line and quote the offending code. No verifiable snippet = do not report it.
- Label each finding Confirmed (verified in source) or Suspected (needs human check).
- For any Medium/High-risk file, read the FULL file, not just the diff hunks.
- On large branches, review the diff file-by-file; never skim one giant diff in a single pass.
- HARD STOP: if the diff contains RLS/policy changes or destructive migrations NOT flagged and approved on the ticket, report CRITICAL and state that merge requires explicit human approval regardless of code quality.

PHASE 0: TICKET ALIGNMENT
1. Identify the ticket from the branch name (mes-<id>-<slug>) and read the Notion ticket + MES Ticket Writing Context.
2. Walk every acceptance criterion against the diff: Met / Not met / Unverifiable.
3. Flag scope drift: any file or behaviour change the ticket didn't ask for.
4. Verify ticket risk flags match the diff: policies/auth-dependent access -> Touches RLS; drops/rewrites/PK changes -> Destructive migration; gating/pricing/CTAs -> Freemium funnel; Slack/CRM/email/external services -> Cross-project. Any mismatch = WARNING minimum.

PHASE 1: DISCOVERY
1. Run: git branch --show-current, git log main...HEAD --oneline, git diff main...HEAD --stat, git status (flag uncommitted/untracked files).
2. Read CLAUDE.md, package.json; check supabase/ for migrations, edge functions, config.toml changes.
3. Confirm which Supabase project (xhziwveaiuhzdoutpgrh = production) migrations/functions target and that it matches the ticket.
4. Produce table: File | Category | Change Summary | Risk (Low/Med/High).

PHASE 2: FRONTEND
For every changed component, page, hook, or utility check:
- Unhandled null/undefined (missing optional chaining on API responses, query data, URL params, arrays)
- Missing loading/error/empty states on async operations
- Missing try-catch on async calls; unguarded .map()/.filter() on nullable arrays
- Race conditions: stale closures, missing useEffect deps, setState after unmount
- React Query: cache keys correct and unique; mutations invalidate the right queries; new queries have enabled guards so they don't fire with undefined params; sensible staleTime
- URL params parsed with fallback defaults; form state reset on success and error
- New as any / @ts-ignore / @ts-expect-error introduced
- Run npx tsc --noEmit AND the production build (npm run build); report all errors
- Components follow existing patterns; Tailwind uses design tokens, not hardcoded hex
- Interactive elements accessible (button vs div, aria labels)
- console.log/debugger/commented-out code left in
- Routes: auth guards, broken links, /undefined URLs, invalid slug handling

PHASE 3: BACKEND / EDGE FUNCTIONS
For every changed or new Edge Function check:
- Input validated at entry; all body fields checked before use
- Correct HTTP status codes (400/401/403/404/500); errors as structured JSON; CORS headers correct and not wildcarded where credentials matter
- Correct Supabase client (anon vs service role); service role only when strictly needed
- Every query result checked for .error before accessing data
- N+1 patterns (loop fetches vs batch); user auth header passed through
- External API calls: try-catch, timeouts (AbortController), response validation
- SSRF: any fetch of user-supplied or DB-stored URLs (logos, profile photos, links) validates/allowlists hosts and blocks internal addresses
- Webhook/shared-secret checks use constant-time comparison
- New public endpoints have rate limiting or abuse safeguards
- API keys via env vars, never hardcoded; rate-limit risk from loops
- Sequential awaits that could be Promise.all; unbounded result sets without pagination
- Could the operation exceed the function timeout
- Staging-first rule: automated/AI/enrichment write paths go through proposal/staging rows, not direct-to-live, with auditability (who/what/when) — flag any direct-to-live automated write

PHASE 4: DATABASE
For every migration, RPC function, table change, index, or policy check:
- New columns: appropriate types, defaults, NOT NULL, foreign keys with ON DELETE
- Unique constraints on slugs/emails/URLs; indexes on filtered/sorted columns
- Migrations must be additive. Any DROP/ALTER/data rewrite is CRITICAL unless the ticket carries an approved Destructive migration flag
- Migration safe on production with live data; backfills idempotent
- RLS enabled on every new table with correct policies (SELECT/INSERT/UPDATE/DELETE)
- Policies scoped correctly (auth = own data, anon = public only); not bypassable; auth.uid() wrapped as (select auth.uid()) on large tables
- RPC: SECURITY INVOKER preferred; SECURITY DEFINER must pin search_path; input validated; no SQL injection via string concat
- No TRUNCATE or unscoped DELETE; no table locks causing downtime

PHASE 5: SECURITY
- All non-public endpoints check auth; verify_jwt:false only where intended
- User-scoped operations verify ownership; admin ops gated by role
- No hardcoded API keys/tokens/secrets in the diff; no PII, data exports, or real user records committed
- Env vars correct (server: Deno.env.get(), client: import.meta.env.VITE_*)
- Service role key never in frontend code; no server secrets in client bundle
- User input sanitised before DB queries; no raw SQL concatenation
- No XSS vectors (dangerouslySetInnerHTML, unescaped HTML)
- File/storage uploads: MIME + size validated, path traversal blocked, bucket policies not widened
- No select('*') leaking sensitive fields; no enumeration attack vectors
- Error messages not leaking implementation details

PHASE 6: FREEMIUM & TIER GATING
If the diff touches gated content, reports, leads, premium data, pricing, or CTAs:
- State what anonymous / free / paid / admin users each see after this change
- Gating enforced server-side (RLS or Edge Function), not just hidden in the UI
- No paywall or upgrade CTA accidentally removed (revenue regression) or added to free content (funnel regression)
- No query/endpoint leaks premium fields (leads, report sections) to lower tiers
- Teaser/upgrade states intact; conversion paths unchanged unless the ticket intends it

PHASE 7: AI / REPORT PIPELINE
Only if the diff touches report generation, prompts, matching logic, RAG/embeddings (mes_knowledge_base, knowledge_embed_log), or model config:
- Prompt/template diffs: could new wording weaken grounding or invite unsourced claims?
- Output constraints intact: section card caps, cross-section dedup, sector/ICP filters, negative filters
- Every AI-surfaced claim traceable to a source row; no path for fabricated providers/events/stats or unsourced statistics
- Duplicate detection (e.g. event URLs) still applied
- Cost/limits: token usage, loop-driven model calls, per-tier report depth unchanged unless intended
- Knowledge-base/embedding writes logged for auditability

PHASE 8: SEO & PUBLIC ROUTES
Only if the diff touches public pages, routing, or head/meta:
- Canonical/OG/meta tags intact on changed public pages; structured data still valid
- noindex NOT added to public routes and NOT removed from private/shared-report/404 routes (privacy + SEO)
- Slug/route changes preserve 301s; dynamic sitemap still emits correct URLs; llms.txt/robots unaffected

PHASE 9: INTEGRATION & REGRESSION
- Identify features sharing the same tables/endpoints/components — could this PR break them?
- Changed shared hooks/utils: read every import site and verify it still works
- Cross-project side effects: Slack notifications, email, CRM/Zapier — could this double-fire or silently drop events?
- New env vars listed with exactly where to set them (Supabase secrets vs Lovable/Vite); new deps flagged for vulnerabilities
- Auto-generated Supabase types regenerated if schema changed; config.toml updated if needed
- Edge cases: empty datasets, invalid slugs (404), external APIs down, expired sessions, large datasets, free-tier users

PHASE 10: FINAL REPORT

CRITICAL (Must fix before merge)
Runtime errors, data loss, security vulnerabilities, broken functionality, unapproved RLS/destructive changes. If none: "None found."

WARNING (Should fix before merge)
Conditional bugs, UX issues, missing validation, scope drift, risk-flag mismatches. If none: "None found."

SUGGESTION (Follow-up)
Code quality, performance, patterns. If none: "None found."

ROLLBACK ASSESSMENT
Is this change reversible? What is the disable path (revert PR / feature flag / config)? Any one-way doors (data backfills, dropped columns, external side effects)?

MERGE CHECKLIST
- [ ] Diff matches ticket scope; all acceptance criteria met
- [ ] Ticket risk flags match the actual diff
- [ ] All Critical issues resolved
- [ ] All Warning issues resolved or deferred with justification
- [ ] TypeScript compiles cleanly AND production build passes
- [ ] No console.log/debugger artefacts
- [ ] Types regenerated if schema changed
- [ ] New env vars confirmed in Supabase + Lovable
- [ ] Edge Functions tested (provide curl commands)
- [ ] Affected pages smoke tested (list pages + what to verify)
- [ ] Rollback path documented

Finally, update the Notion ticket with the audit verdict: Critical/Warning counts, merge recommendation (Approve / Approve with conditions / Block), and any deferred items.
