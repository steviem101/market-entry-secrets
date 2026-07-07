---
name: secrets-and-env-management
description: Where MES secrets live, what may reach the client, and what must never reach git. Use before touching env vars, API keys, tokens, credentials, or personal data in code, docs, or PRs. OWNS the secret-handling rules — other skills link here.
---

Last verified: 2026-07-07

# Secrets & Env Management

## Purpose
Keep service-role keys, provider tokens, and personal data out of the client bundle, the repo, and
git *history* — where MES has already been burned once (~750 people's PII required a history rewrite).

## When to trigger / when NOT to
- **Trigger:** adding/using any secret or env var; writing PR descriptions or docs that mention
  configuration; importing data containing emails/phones/LinkedIn URLs; writing example payloads.
- **Don't trigger:** work that only consumes the two public client values below.

## Preconditions — inspect first
- `src/integrations/supabase/client.ts` — URL + publishable (anon) key are **hardcoded by design**
  (generated file). These are the only credentials allowed client-side.
- `CLAUDE.md` §11 — the canonical list of secret *names* (Stripe, Firecrawl, Perplexity, Lovable,
  Anthropic, Slack, Notion, Resend, internal secrets). Reference names only, never values.

## Playbook
1. **Client side:** no `VITE_*` vars exist or may be added (Lovable doesn't support them; see
   `mes-codebase-conventions`). The client gets exactly: Supabase URL + anon key. Everything else
   is server-side.
2. **Server side:** secrets live in Supabase Edge Function secrets, read via
   `Deno.env.get("NAME")` (e.g. `create-checkout/index.ts` reads `STRIPE_SECRET`,
   `STRIPE_*_PRICE_ID`; `generate-report` reads `FIRECRAWL_API_KEY`, `PERPLEXITY_API_KEY`,
   `LOVABLE_API_KEY`). A few are mirrored in Vault for cron use (`kb_sync_secret`,
   `kb_get_openai_key` RPC — `supabase/functions/embed-knowledge/index.ts:62`).
3. **Service-role key:** only inside edge functions (`SUPABASE_SERVICE_ROLE_KEY`). Never in
   frontend code, scripts committed to the repo, examples, or logs. Cross-project reads use anon
   keys only (`CONTENT_CREATOR_ANON_KEY` — "never a service-role key", `CLAUDE.md` §11).
4. **Internal auth secrets** (`EMAIL_INTERNAL_SECRET`, `KB_SYNC_SECRET`,
   `SLACK_NOTIFY_WEBHOOK_SECRET`) authenticate server-to-server calls via headers
   (`x-internal-secret`, `x-webhook-secret`). When adding one: document the *name* and where to set
   it in the PR; never paste a value anywhere, including examples — invent `<placeholder>` values.
5. **New env var checklist for PRs:** name, which function reads it, where it's set (Supabase
   secrets / Vault), and what breaks without it. No values.
6. **PII is a secret too.** Strip emails, phones, LinkedIn URLs, and real names from committed
   files, fixtures, skill examples, and Slack/log output. Never log PII (emails, tokens) to
   console — verified live pattern: `generate-report` deliberately does not log Perplexity error
   bodies (`index.ts:692-693`).
7. **Git history counts.** Deleting a file does not remove it from history; a leak requires
   `git filter-repo`/BFG and force-push coordination. Prevent, don't remediate.

## Red flags / approval gates
- Any diff line that looks like a live key (`sk_`, `whsec_`, JWTs beyond the public anon key,
  `Bearer` + long string) — stop, remove, and if it was ever pushed, treat as leaked: report it for
  rotation. Never commit on top hoping nobody noticed.
- CSVs/SQL dumps of people data destined for the repo — that exact move put ~750 people's PII in
  history (`docs/audits/MES-35-security-data-audit.md` S3/T20).
- Adding a secret to frontend code "temporarily".

## Good / bad examples
- ✅ `const key = Deno.env.get("FIRECRAWL_API_KEY"); if (!key) return json({error:"not configured"},500);`
- ✅ PR note: "Requires new secret `ACME_API_KEY` in Supabase Edge Function secrets."
- ❌ `scripts/import_investors.sql` with 147 personal emails committed (real incident, MES-35 S3).
- ❌ Logging `console.log("user", user.email)` in an edge function.

## Self-check rubric (pass/fail)
- [ ] `git diff` contains zero secret values, zero real personal emails/phones/LinkedIn URLs.
- [ ] Every new secret: named in PR, read via `Deno.env.get`, server-side only.
- [ ] No new client-side credential beyond the generated Supabase URL/anon key.
- [ ] No PII in logs, Slack messages, or example payloads introduced by the change.

## Evidence
Inspected 2026-07-07: `src/integrations/supabase/client.ts:5-6`; `Deno.env.get` usage across
`supabase/functions/` (create-checkout, generate-report, send-email, kb-sync, embed-knowledge);
`CLAUDE.md` §11 secret registry; root `.env` (dead `VITE_SUPABASE_*` scaffold — anon values only);
`docs/audits/MES-35-security-data-audit.md` S3/T20 (PII-in-history incident), S8 (email → Slack);
`docs/audits/SECURITY_AUDIT.md` §5 (`.env` committed).

## Common MES pitfalls (real)
1. **PII committed to git history** — `mentor_identification/*.csv`, `scripts/import_investors.sql`,
   `startmate_import_blocks/*.sql`: ~600+ emails, ~1,200 LinkedIn URLs, requiring a history rewrite
   (MES-35 S3).
2. **Customer emails leaking into ops channels** — `slack-notify` posted raw `actor_email` to Slack
   (MES-35 S8). Mask or omit PII in notifications.
3. **Raw webhook payloads stored wholesale** — `payment_webhook_logs.stripe_payload` retains
   customer emails (`docs/audits/SECURITY_AUDIT.md` §7); don't widen access to that table.
4. **"It's only the anon key" normalisation** — `.env` is *tracked in git* despite being in
   `.gitignore` (MES-111 AUD-053; public values only today). It must be `git rm --cached`-ed
   before any real secret ever lands in it. Anything credential-shaped stays out of git.
