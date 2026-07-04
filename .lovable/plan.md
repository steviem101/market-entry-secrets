## Status: Bucket A + B complete

Custom-domain cutover is done for all live surfaces:
- **Bucket A (code)** — edge functions now default to `marketentrysecrets.com` for CORS + Slack deep-links.
- **Bucket B (config)** — you've confirmed Supabase Auth URLs, `FRONTEND_URL` secret, and Lovable Primary Domain are all pointing at `marketentrysecrets.com`.

Everything the platform emits going forward (auth emails, Stripe redirects, report share links, Slack quality cards, CORS) is now custom-domain-first. `lovable.app` remains only as a fallback allow-listed origin so previews keep working.

## Optional: Bucket C — historical KB rows

The only remaining `lovable.app` references are **inside data**, not code:

`mes_knowledge_base.metadata->>'source_url'` holds ~8 content types worth of rows where `source_url` was baked in as `https://market-entry-secrets.lovable.app/...` when the baseline migration ran on 2026-07-04. These strings surface anywhere the KB `source_url` is rendered (agent citations, knowledge-search results, any UI that links back to the canonical page).

### Proposed fix (one-off, reversible)

A single migration that rewrites the host in place:

```sql
UPDATE public.mes_knowledge_base
SET metadata = jsonb_set(
  metadata,
  '{source_url}',
  to_jsonb(replace(metadata->>'source_url',
                   'market-entry-secrets.lovable.app',
                   'marketentrysecrets.com'))
)
WHERE metadata->>'source_url' LIKE '%market-entry-secrets.lovable.app%';
```

- Pure string swap on the host portion — paths, slugs, and query strings unchanged.
- Idempotent (re-running is a no-op once rows are updated).
- No schema change, no downtime.
- Rollback = same UPDATE with the hosts swapped.

### Also worth checking (I'll verify before writing the migration)

Any **fanout / sync SQL functions** that construct `source_url` at write time (e.g. the KB phase-6 fanout functions listed in `supabase/rollback/`) may still hardcode the lovable.app host — if so, they'd re-introduce the old host on the next sync. If I find any, I'll patch them in the same migration so the data fix isn't overwritten.

### Not doing

- Not touching `.claude/`, docs, historical reports, or archived migrations — those are frozen history.
- Not touching the `lovable.app` entries kept intentionally in `ALLOWED_ORIGINS` / `publishedOrigin.ts` (preview support).

---

**Say the word and I'll switch to build mode to (a) audit the fanout functions and (b) ship the migration.** Or if you'd rather leave historical KB `source_url` values as-is, we're done.
