# MES-218 — advisor-requests (report_v2 advisor loop) rollout runbook

How to take the report_v2 advisor loop live. Everything ships gated OFF: the interaction rows are
recorded from the moment F3 merges (they power the in-report shortlist and the admin Advisor queue),
but **no Slack traffic** flows until an operator points the routing rows at `#advisor-requests` and
enables them. Merging the code changes nothing customer-visible except the new booking CTA + step
checkboxes, which are self-contained. MES Platform project `xhziwveaiuhzdoutpgrh` only.

## What was built (all merged to main with F3)

- **Interactions (already live from MES-218 groundwork):** `report_interactions` event-log table +
  RLS (owner INSERT/SELECT, admin SELECT). Frontend records `star`, `scan_request`,
  `brief_request`, `lead_request`.
- **F3 additions:**
  - Two new interaction types — `checkbox` (action-plan step ticked; **silent**, like `star`) and
    `book_request` (customer clicked *Book your advisory session*; the primary conversion action).
    Migration `20260722130000_report_interactions_f3.sql` widens the type CHECK, extends
    `emit_report_interaction_activity()` so `book_request → report.session_requested`, and inserts a
    **disabled** routing row for it.
  - Renderer: durable action-plan checkboxes (`ActionPlanSection`), the booking CTA
    (`CloseSection`), both persisted through `ReportInteractionsProvider`.
  - Admin: **Advisor queue** panel on `/admin/reports/:id` (shortlist, requests, action-plan
    progress, and a prominent *Session requested* banner).

## Activity events emitted (all `severity: action`, `realtime: true`)

| Interaction | Event type | Ships |
|-------------|-----------|-------|
| Competitor scan request | `report.scan_requested` | disabled (MES-218 groundwork) |
| Account brief request | `report.brief_requested` | disabled (MES-218 groundwork) |
| Lead-list request | `report.lead_requested` | disabled (MES-218 groundwork) |
| Book advisory session | `report.session_requested` | disabled (this migration) |
| Star / checkbox | *(none — silent by design)* | n/a |

`dispatch_activity_event` skips any routing row where `enabled = false`, so until Step 2 the events
are logged to `activity_events` and surfaced in the admin queue, but never posted to Slack.

## Prerequisites

- Migration applied on merge (Supabase integration). Confirm the widened CHECK and the routing row:
  ```sql
  select conname, pg_get_constraintdef(oid)
    from pg_constraint where conname = 'report_interactions_type_check';
  -- expect: check (type = any (array['star','scan_request','brief_request','lead_request','checkbox','book_request']))

  select event_type, channel_id, enabled
    from public.activity_event_routing
   where event_type like 'report.%_requested' or event_type = 'report.session_requested';
  -- expect 4 rows, all channel_id = '' and enabled = false
  ```
- `slack-notify` is already deployed (no function change in F3 — it uses the generic event card).
  `SLACK_NOTIFY_WEBHOOK_SECRET` and `SLACK_BOT_TOKEN` already set (existing report-quality path).

## Step 1 — smoke-test the loop while still disabled

1. Open a report you own in report_v2, click *Book your advisory session*, tick a couple of
   action-plan steps, and star a provider.
2. Confirm the rows landed:
   ```sql
   select type, payload, created_at from public.report_interactions
    where report_id = '<your-report-id>' order by created_at desc;
   ```
3. Confirm the booking produced an activity event (but no Slack, routing still disabled):
   ```sql
   select event_type, severity, notified_at from public.activity_events
    where event_type = 'report.session_requested' order by created_at desc limit 3;
   -- notified_at stays null until routing is enabled
   ```
4. As an admin, open `/admin/reports/<id>` and confirm the **Advisor queue** shows the shortlist,
   the *Session requested* banner, and the action-plan progress count.

## Step 2 — point routing at #advisor-requests and enable

1. Invite the MES Slack bot to **#advisor-requests** and copy its channel ID (`Cxxxxxxxx`).
2. Enable the routing rows (start with just the booking event if you want the highest-signal one
   first, then add the three request events):
   ```sql
   update public.activity_event_routing
      set channel_id = '<Cxxxxxxxx>', enabled = true
    where event_type in (
      'report.session_requested',
      'report.scan_requested', 'report.brief_requested', 'report.lead_requested'
    );
   ```
3. Trigger the next interaction (or re-drive: `slack-notify` with `{"mode":"digest"}` re-drives
   stuck realtime events) and confirm a card posts to #advisor-requests with the customer, report id,
   and (for scan/brief/lead) the account/ICP context.

## Rollback

Fully reversible — no data or schema is destroyed by disabling:

- **Stop Slack traffic:** `update public.activity_event_routing set enabled = false where event_type
  like 'report.%_requested' or event_type = 'report.session_requested';` Interactions keep recording
  and the admin queue keeps working; only Slack goes quiet.
- **Hide the customer UI:** the booking CTA and checkboxes live behind the `report_v2` flag with the
  rest of the renderer; there is no separate flag. Revert the F3 PR to remove them.
- **One-way door:** none. The migration only widens a CHECK (every existing row still satisfies it)
  and adds a disabled routing row.
