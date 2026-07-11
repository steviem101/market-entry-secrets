# Phase 2 / step 6 — repoint the remaining Irish Insights consumers

Everything below moves consumers off MES (`xhziwveaiuhzdoutpgrh`) onto the
**Irish Insights** project. The two webhooks are DONE; what remains are the
consumers that talk to the **database/RPCs directly**.

## Irish Insights connection constants

| What | Value |
|------|-------|
| Project ref | `schyrnxekxcoaragofgv` |
| API / Supabase URL | `https://schyrnxekxcoaragofgv.supabase.co` |
| Region | `eu-west-1` (Ireland) |
| DB direct host | `db.schyrnxekxcoaragofgv.supabase.co` (IPv6) |
| DB session pooler | `aws-0-eu-west-1.pooler.supabase.com:5432`, user `postgres.schyrnxekxcoaragofgv` (IPv4-safe) |
| anon key (legacy JWT) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaHlybnhla3hjb2FyYWdvZmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzkzNDYsImV4cCI6MjA5NzgxNTM0Nn0.45SzRL75Og72PG-skSueEG6wCnFRAvw3h0VOagNRHGM` |
| publishable key | `sb_publishable_S4sGWX8SzPajplo08a7wWg_2MRtnpkT` |
| service-role key | **operator-only** — Dashboard → project `schyrnxekxcoaragofgv` → Settings → API keys. Never commit it. |

All `ii_*` tables, the 4 ivfflat indexes, and the 6 RPCs (`match_content`,
`match_archive`, `match_emails`, `recent_ii_content`, `recent_ii_emails`,
`upsert_ii_linkedin_posts`) are live on the target — verified.

## Status

| Consumer | Talks to | Status |
|----------|----------|--------|
| Apify task `3RnAZzC9CsXXPZrbM` | `apify-webhook` edge fn | ✅ repointed; token verified; final live test blocked only by Apify monthly usage limit |
| Notion automation | `notion-research-trigger` edge fn | ✅ repointed + verified end-to-end (real dispatch `200`) |
| `research.yml` (GitHub Actions, `steviem101/irish-insights-email-ingest`) | DB/RPCs via env secrets | ⬜ pending |
| Python classifier (cron) | DB via env | ⬜ pending |
| Beehiiv newsletter ingestion | via ii-ingest pipeline (confirm mechanism in repo) | ⬜ pending |

## What to change (per consumer)

The exact env-var names live in `steviem101/irish-insights-email-ingest`
(not inspectable from this session until the repo is added to its scope —
or grep it locally for `xhziwveaiuhzdoutpgrh` / `SUPABASE_URL`). The changes
are the same three values everywhere:

1. **Supabase URL** → `https://schyrnxekxcoaragofgv.supabase.co`
2. **Service-role key** → the Irish Insights service-role key (dashboard)
3. **Any raw Postgres string** → the session-pooler string above

Concretely:

- **`research.yml`** — repo → Settings → Secrets and variables → Actions:
  update the `SUPABASE_*` secrets to the II values. The workflow itself
  usually needs no code change (it reads the secrets).
- **Python classifier** — wherever its cron runs, update its `.env`
  (same three values). It reads unclassified `ii_content` rows and writes
  classifications; after the switch its writes land in II.
- **Beehiiv** — confirm in the repo how newsletter content reaches
  `ii_content` (poll vs webhook vs Gmail ingest); repoint the same env values
  in that path.

## Safety notes for the cutover window

- **Switch order doesn't matter** and partial states are safe: II-only writes
  are never overwritten by the MES→II delta sync (it upserts with
  `on conflict do nothing` / keyed updates — MES rows only add, never clobber).
- Consumers still on MES keep drifting MES forward — expected; the **final
  freeze-sync** (dblink anti-join → 0 missing) reconciles right before the drop.
- After ALL consumers point at II: run the final sync, verify 0 missing +
  FK-clean, then Hard Stop 2 (explicit approval) → MES `ii_*` drop.
- Post-drop hygiene: rotate both DB passwords (shared in chat during the
  migration), rotate the MES-era Apify webhook secret if desired, and remove
  the two edge functions from MES.
