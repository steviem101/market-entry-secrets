---
name: mes-ticket-workflow
description: How to run an MES ticket end-to-end — gate stages (Audit→Plan→Implement), branch naming, PR conventions, approval-gated categories, and updating the Notion ticket. Use at the start of any ticket-driven MES task and before opening a PR.
---

Last verified: 2026-07-07

# MES Ticket Workflow

## Purpose
Give every ticket the same safe shape: inspect before coding, stop at the right gates, name
branches/PRs consistently, and keep the Notion ticket current. Encodes the operational rules from
the [MES Ticket Writing Context](https://app.notion.com/p/95be3b3db0d3427295fba8664011d7ad) — link
there, don't duplicate.

## When to trigger / when NOT to
- **Trigger:** any Notion-ticket-driven change; opening a PR; deciding whether a change needs approval.
- **Don't trigger:** a throwaway question with no repo change.

## Preconditions — inspect first
- The ticket itself + the MES Ticket Writing Context (risk flags, status workflow, template).
- Repo reality for the area you're touching (routes, tables, functions) — the ticket's table
  names are hints; introspect before trusting them.

## Playbook — gate stages
1. **Audit (read-only):** inspect repo + schema; identify the real files, routes, components, edge
   functions, tables, and env vars. Read the matching skill(s) first (`mes-codebase-conventions`
   always).
2. **Plan:** produce a short implementation plan and list risks. **If the ticket touches RLS,
   destructive migrations, payments/subscriptions, secrets, or broad data writes → stop after the
   plan and get approval** before writing code. (The `qa-and-exam` RLS baseline is a model plan.)
3. **Implement:** keep changes scoped to the ticket; prefer additive, reversible changes; add tests
   where practical (pure logic modules — see `mes-codebase-conventions`); document required env
   vars/manual setup.

## Playbook — branch, PR, ticket
- **Branch:** `mes-<ticket-id>-<short-slug>` (e.g. `mes-113-claude-skills-library-w2`). If a
  harness assigns a different working branch, follow the harness; note the mapping in the ticket.
- **PR:** reference the ticket (`Closes MES-<id>` only when the ticket is fully done — for phased
  work, `Refs MES-<id>` on interim PRs and `Closes` on the final one). Open a PR; **never merge
  without review**. Fill a PR template if one exists (there isn't one in this repo today).
- **Update the Notion ticket** after meaningful progress with: branch, PR link, status,
  implementation summary, caveats/risks, and follow-ups. Move status per the workflow (Idea →
  Scoped → Prompt Ready → In Progress → In Review → Merged → Deployed → Archived); don't move a
  high-risk ticket to Prompt Ready until risk flags + approval needs are clear.

## Approval-gated categories (stop and ask)
RLS/policy/grant changes · destructive migrations (drop/rewrite/PK/bulk-update) · payments &
subscriptions/entitlements · secrets · broad/bulk data writes. These map to the ticket's risk
flags (Touches RLS, Freemium funnel, Cross-project, Destructive migration). Each has an owning
skill — read it before planning.

## Red flags / approval gates
- Coding before an Audit+Plan on anything non-trivial.
- Merging your own PR, or opening a PR that silently touches an approval-gated category.
- Leaving the Notion ticket stale after a PR is open/merged.

## Good / bad examples
- ✅ Branch `mes-201-events-capacity`, PR "Add capacity column to events (MES-201)" with
  `Closes MES-201`, ticket updated with the PR link + a rollback note.
- ✅ RLS ticket: post the plan, flag "Touches RLS", wait for approval (like the Wave-1 exam
  baseline RLS plan).
- ❌ A branch named `fix-stuff`; a PR with no ticket reference; merging before review.
- ❌ Bundling an unrelated refactor into a scoped ticket's PR.

## Self-check rubric (pass/fail)
- [ ] Audit + short plan done before code; risks listed.
- [ ] Approval-gated category? → plan posted and approval obtained before implementing.
- [ ] Branch `mes-<id>-<slug>`; PR references the ticket; not self-merged.
- [ ] Change scoped to the ticket; additive/reversible; tests where practical.
- [ ] Notion ticket updated (branch, PR, summary, caveats, follow-ups).

## Evidence
Notion: [MES Ticket Writing Context](https://app.notion.com/p/95be3b3db0d3427295fba8664011d7ad)
(operating rules, risk flags, status workflow, standard template — fetched 2026-07-07). Repo:
no PR template present (`.github/` checked 2026-07-07); branch/PR conventions observed in recent
history (e.g. `feat(...)(MES-99) (#300)`). Cross-refs: `supabase-rls-and-migrations`,
`stripe-payments-and-webhooks`, `secrets-and-env-management`, `directory-data-enrichment`.

## Common MES pitfalls (real)
1. **Skipping the plan gate on RLS/payments** — MES's worst incidents (subscription self-upgrade,
   webhook retry loss, PII SELECT holes) were single changes that a plan-and-approve gate would
   have caught; treat those categories as always-stop.
2. **Out-of-band "just this once" applies** — dashboard SQL / MCP `apply_migration` on schema
   drifted the ledger for 5 months (`docs/migrations.md`). Schema goes through the PR flow only.
3. **Stale tickets** — a merged PR with no ticket update loses the branch/PR/caveat trail the next
   session needs; update after every meaningful step.
4. **Scope creep** — bundling refactors into a ticket makes review (and rollback) harder; keep the
   diff to the ticket.
