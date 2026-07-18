# Founder follow-up loop (conversion plan step 3)

> Every completed report → a Slack ping → a personal founder email within 24h.
> At current report volume this manual touch is expected to out-convert any
> automated surface, and doubles as customer discovery. Producer: generate-report
> emits `report.completed` (dedup `rc:<report_id>`); routing seeded DISABLED by
> migration `20260717060000`.

## 1. One-time setup (operator)

1. Pick the ops channel (e.g. reuse the lead-list ops channel or a new
   `#report-completions`) and invite the MES Slack bot to it.
2. Enable the routing row (Supabase SQL editor, prod):
   ```sql
   update activity_event_routing
      set channel_id = '<SLACK_CHANNEL_ID>', enabled = true
    where event_type = 'report.completed';
   ```
3. Verify: generate a test report (or wait for the next organic one) and check
   the channel. Disable at any time with `set enabled = false`.

## 2. The loop (per ping, target < 24h)

Each Slack message carries the member's name/email (actor columns), their
company, tier, and the report path.

1. **Open the report** (`/report/<id>`), skim 60 seconds: does it look strong?
   Which locked sections have good teaser counts (mentors / leads / customers)?
2. **Send a personal email** from your own inbox (not a template blast — that is
   the point). Skeleton that works:

   > Subject: your Australia market-entry report
   >
   > Hi <name> — Stephen here, I run Market Entry Secrets. I saw your report on
   > <company>'s Australia entry come through and had a quick read.
   > <one genuinely specific observation about their situation/matches>.
   > If it would help, happy to walk you through it — 15 minutes, no charge:
   > <Calendly link — see below>. Either way, good luck with the entry.

3. **Calendly:** use the 30-min link
   (`https://calendly.com/stephen-marketentrysecrets/30min`). Keep the weekly
   window realistic — advisor capacity is deliberately small (D6, ~2h/week).
4. **Log the outcome** wherever you track leads (Lemlist/Notion) — at minimum,
   note replied / booked / upgraded so the loop's conversion is measurable
   against the `report.completed` count.

## 3. What to watch

- **Volume trigger:** when pings exceed what you can personally answer in a day
  (~10/day), that is the signal to graduate to the D2/D7 automated nurture as
  the primary channel and reserve personal follow-up for paid tiers /
  high-signal reports.
- **Paid reports** deserve the fastest touch — they already bought; the email
  becomes onboarding ("book your included session") rather than upsell, and the
  T13 booking banner + confirmation email have already offered the Calendly link.
- **Do not** paste report content or member emails into other tools when
  logging; link the report path instead (PII discipline, CLAUDE.md §9).

## Rollback

`update activity_event_routing set enabled = false where event_type = 'report.completed';`
— the producer keeps writing activity rows (harmless, auditable); Slack goes quiet.
