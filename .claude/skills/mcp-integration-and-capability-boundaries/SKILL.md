---
name: mcp-integration-and-capability-boundaries
description: Secure MCP design for MES — capabilities not raw DB access, anon/RLS-scoped reads, filter sanitisation, prompt-injection handling, and read-vs-write boundaries. Use before touching the mcp edge function, src/lib/mcp, or exposing any MES capability to an external agent.
---

Last verified: 2026-07-07

# MCP Integration & Capability Boundaries

## Purpose
Keep the MES MCP surface a set of **narrow, read-only, RLS-scoped capabilities** — never a generic
database gateway — and make externally-supplied inputs safe.

## When to trigger / when NOT to
- **Trigger:** the `mcp` edge function, `src/lib/mcp/*`, adding/altering an MCP tool, or exposing an
  MES capability to an external agent/LLM.
- **Don't trigger:** general edge-function conventions (→ `edge-functions-and-cost-controls`);
  internal Slack interactivity (→ `slack-notifications-and-ops-triage`).

## Preconditions — inspect first
- **`src/lib/mcp/*` is the human-authored source**; `supabase/functions/mcp/index.ts` is an
  **auto-generated bundle** (banner says "do not edit") produced by the Vite `mcpPlugin`
  (`vite.config.ts:5,17`). Edit the source, regenerate — never hand-edit the bundle.
- `.lovable/mcp/manifest.json` (declares the deployed path + auth posture), `supabase/config.toml`.

## The current surface (verified)
Server `market-entry-secrets-mcp` exposes **5 read-only tools**: `search_service_providers`,
`search_mentors` (reads the PII-safe `community_members_public` view, not the base table),
`list_events`, `search_content` (hard-filtered `status='published'`), `search_lead_databases`
(catalog metadata only — never lead *records*). All annotated `readOnlyHint: true`,
`openWorldHint: false`.

## Playbook
1. **Capabilities, not DB access.** Each tool is a specific, scoped query with a fixed column
   `select` — never "run this SQL". New tools follow the same shape: one intent, bounded columns.
2. **Anon client + RLS decides visibility.** The MCP client is built with the **anon/publishable
   key**, never service-role (`index.ts:24-28`, per-tool). So RLS is the boundary: PII goes through
   `_public` views, content is `published`-only. Never introduce a service-role client here — that
   would bypass RLS for an unauthenticated caller.
3. **Sanitise external filter values.** Free-text inputs interpolated into PostgREST `.or(...ilike)`
   strings pass through `sanitizeFilterValue` (`src/lib/mcp/tools/_shared.ts`) which strips
   `\ , ( ) . * " ' % \n \r`. Parameterised calls (`.contains`) and Zod-enum fields don't need it;
   raw string interpolation does. Bound every `limit` with Zod (`.int().min(1).max(50)`).
4. **Prompt-injection posture.** MCP tool *outputs* are directory data returned to an external LLM —
   treat any free-text you pass onward (and any external content you ingest elsewhere) as untrusted;
   the edge-function sanitiser for scraped content is `_shared/sanitize.ts`. Return a generic
   `search_failed` error, never DB internals (`genericSearchError`).
5. **Auth posture must be legible.** The endpoint is unauthenticated (public directory data only),
   but that's declared in `.lovable/mcp/manifest.json` (`auth: none`), **not** in `config.toml` —
   state it explicitly in any review so it isn't missed. If a tool ever needs to read non-public
   data, it needs real auth first — don't add it under the anon posture.

## Red flags / approval gates
- A service-role client in the MCP function, or a tool reading a base PII table instead of a
  `_public` view.
- Any write/mutation tool (the surface is read-only by design) → approval-gated, needs auth.
- Unsanitised free-text in a PostgREST filter string; an unbounded `limit`.
- Hand-editing `supabase/functions/mcp/index.ts` instead of `src/lib/mcp/*` + regenerate.
- **No rate limiting exists on the MCP endpoint today** — if you add an expensive or
  write-capable tool, add a guard first (see `edge-functions-and-cost-controls`).

## Good / bad examples
- ✅ New `search_investors` tool: anon client, reads `investors_public`, fixed columns,
  `sanitizeFilterValue` on the query, Zod-bounded limit, `readOnlyHint`.
- ❌ A `run_query(sql)` tool — generic DB access, exactly what MCP capabilities must not be.
- ❌ Reading `investors` (base) or `community_members` (base) → PII exposure to an unauth caller.
- ❌ `.or(\`name.ilike.%${input}%\`)` without `sanitizeFilterValue(input)`.

## Self-check rubric (pass/fail)
- [ ] Edited `src/lib/mcp/*`, regenerated the bundle (didn't hand-edit the generated file).
- [ ] Anon client only; PII via `_public` views; non-public data not exposed.
- [ ] Read-only (or auth added + approval for any write); free-text sanitised; `limit` bounded.
- [ ] Generic error text; no DB internals leaked.
- [ ] Auth/rate-limit posture stated explicitly in the change description.

## Evidence
Inspected 2026-07-07: `supabase/functions/mcp/index.ts` (generated bundle: tools L30-222, anon
client L24-28, `sanitizeFilterValue` L14-16, `genericSearchError` L17-20, server def L225-241),
`src/lib/mcp/*` (source), `.lovable/mcp/manifest.json` (path `/functions/v1/mcp`, `auth: none`),
`vite.config.ts:5,17` (`mcpPlugin`), `supabase/config.toml` (no `[functions.mcp]` block). Audit:
`docs/prelaunch-audit.md` §8 (mcp listed CLEAN — read-only, RLS applies, filter-value sanitised;
AUD-031 config.toml drift). Cross-refs: `edge-functions-and-cost-controls`,
`secrets-and-env-management`, `supabase-rls-and-migrations`.

## Common MES pitfalls (real)
1. **Auth declared outside config.toml** — the mcp endpoint's `auth: none` lives in the Lovable
   manifest, not `config.toml`; a config-only review misses it (MES-111 AUD-031 family).
2. **No rate limiting** on the MCP endpoint — safe while read-only + RLS-bounded, but any expensive
   or write tool must add a guard first.
3. **Editing the generated bundle** — `supabase/functions/mcp/index.ts` is regenerated from
   `src/lib/mcp/*`; hand-edits are overwritten.
4. **Forgetting the `_public` view rule** — a new tool reading a base table would leak PII to an
   unauthenticated caller.
