---
name: content-freshness-and-seo-ops-loop
description: MES content-freshness rules — expiring events and "past event" states, stale-content detection, the events ingest/normalize pipeline, KB freshness, and a monthly SEO-health checklist. Use when touching events lifecycle, the sitemap's staleness filters, or content-freshness automation.
---

Last verified: 2026-07-07

# Content Freshness & SEO Ops Loop

## Purpose
Keep time-sensitive content honest (events that have passed, stale directory rows) and give the
platform a repeatable freshness/SEO-health routine — without breaking the CSR/sitemap rules owned
by `seo-rendering-indexing-and-programmatic-pages`.

## When to trigger / when NOT to
- **Trigger:** events lifecycle/expiry, the sitemap's staleness filters, `events_staging`/normalize
  pipeline, KB freshness, a monthly SEO-health review, freshness automation.
- **Don't trigger:** canonical/rendering mechanics (→ `seo-rendering-indexing-and-programmatic-pages`);
  copy/CTA style (→ `content-and-vendor-copy`).

## Preconditions — inspect first
- `src/hooks/useEvents.ts`, `src/lib/eventDate.ts` (`isEventPast`), `src/components/EventCard.tsx`,
  `supabase/functions/sitemap/index.ts` (events section), `ingest-events`/`normalize-events`,
  `events_staging`, `kb_sync_state`/`knowledge_embed_log`.

## Events lifecycle (verified)
- Upcoming vs past is a client `useMemo` over `isEventPast(event)` (`useEvents.ts:84-100`).
  **`isEventPast` (`eventDate.ts:26-30`) treats approximate-date events as never past** — only
  `date_precision === 'exact'` events use `isPast(date)`; for `month`/`tbc` the stored date is a
  sort key, not a schedule. Respect this when adding date logic.
- Past events are **dimmed + badged "Past Event"**, calendar/registration CTAs hidden
  (`EventCard.tsx`, `EventDetailHero.tsx`), and get their own `Past` tab — they are **not removed**.
- `events.status` values: `approved` (moderated-visible), `needs_review`, `rejected`.

## Playbook
1. **Sitemap staleness gap (known):** the sitemap events section filters only
   `status='approved'` — **no date filter** (`sitemap/index.ts` events section), so past approved
   events persist in the sitemap indefinitely. If asked to improve freshness, add a recency bound
   there (keep it anon/RLS-safe per the SEO skill). `<lastmod>` is derived from row `updated_at`,
   not event date — don't mistake it for a recency signal.
2. **Events ingest/normalize pipeline:** Apify → `ingest-events` (`x-webhook-secret`, dedupes to
   `events_staging`) → `normalize-events` (service-role, Anthropic `claude-haiku-4-5` parses the
   real datetime, incl. a "month/day before today ⇒ next year" rollover rule) → RPC upsert →
   staging `processed=true`. There is **no cron** for normalize; it's triggered by ingest or ops.
   New event automation follows this staged shape (see `directory-data-enrichment`).
3. **KB freshness:** `mes_knowledge_base` stays fresh via a watermark pull — `kb-sync` cron
   (`kb-sync-incremental`, every 3 days) pulls source rows newer than `kb_sync_state.last_synced_at`
   — plus resumable re-embedding logged to `knowledge_embed_log`. Preserve the watermark + log when
   touching it.
4. **Monthly SEO-health checklist:** indexation (GSC coverage), sitemap freshness (past events not
   dominating; new rows present), canonical/noindex correctness (per the SEO skill), broken/stale
   detail pages (soft-404s — MES-111 AUD-046), and content aging. **Prerequisite gap:** MES has
   **zero web analytics** (no GA4/GTM/Plausible/PostHog — only a GSC verification tag and the
   internal `intake_form_events` funnel), so "which pages perform" can't be measured yet — the
   MES-SEO-02 "stand up measurement" work is the precondition for a real health loop.
5. **Safe automation:** any freshness check is read-only reporting first; changing visibility
   (e.g. auto-hiding events) is a data/behaviour change — plan it, don't silently ship it.

## Red flags / approval gates
- Treating an approximate-date event as past (breaks the sort-key semantics).
- Adding a date filter to the sitemap that runs as service-role or leaks non-approved events.
- Auto-deleting/hiding content as "stale" without review — that's a behaviour change.
- Assuming GA4/analytics exists for a "health" metric — it doesn't yet.

## Good / bad examples
- ✅ Sitemap PR: keep `status='approved'`, add "event date within last N months OR upcoming", anon
  client, `_public` views — a recency bound that doesn't leak.
- ✅ Monthly report: GSC coverage delta, count of past events in sitemap, soft-404 sample — read-only.
- ❌ `DELETE FROM events WHERE date < now()` — destructive, and breaks the "Past" tab UX.
- ❌ Filtering events by `isPast(date)` ignoring `date_precision` — hides valid TBC events.

## Self-check rubric (pass/fail)
- [ ] Date logic respects `date_precision` (approximate ≠ past).
- [ ] Sitemap changes stay `status='approved'` + anon + `_public` views; recency bound if added.
- [ ] Event automation goes through `events_staging`/normalize, not direct live writes.
- [ ] KB changes preserve the `kb_sync_state` watermark + `knowledge_embed_log`.
- [ ] Freshness checks are read-only first; the analytics-absent gap is acknowledged.

## Evidence
Inspected 2026-07-07: `src/hooks/useEvents.ts:42-100`, `src/lib/eventDate.ts:26-30`,
`src/components/EventCard.tsx`, `src/components/events/EventDetailHero.tsx`,
`supabase/functions/sitemap/index.ts` (events section, `status='approved'`, no date filter),
`supabase/functions/ingest-events/index.ts`, `normalize-events/index.ts`, `events_staging`;
`kb-sync`/`embed-knowledge`, `kb_sync_state`, `knowledge_embed_log`. Audits:
`docs/audits/seo-discoverability-audit-2026-07-04.md` (zero analytics, MES-SEO-02 measurement),
MES-111 `docs/prelaunch-audit.md` AUD-046 (soft-404s). Cross-refs:
`seo-rendering-indexing-and-programmatic-pages`, `directory-data-enrichment`,
`observability-logging-and-cost-attribution`.

## Common MES pitfalls (real)
1. **Sitemap has no event-date filter** — past approved events persist indefinitely
   (`sitemap/index.ts` events section); freshness relies only on moderation status.
2. **Approximate-date events aren't "past"** — `date_precision` gating (`eventDate.ts:26-30`);
   naive `isPast(date)` hides valid TBC events.
3. **Zero web analytics** — no GA4/GTM/Plausible; a "health loop" needs measurement stood up first
   (`seo-discoverability-audit-2026-07-04.md`).
4. **No normalize cron** — event normalization is trigger/ops-driven, not scheduled; don't assume
   it runs automatically.
