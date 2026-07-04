## Plan: Accept-risk all 8 findings, then publish + rescan

User chose option 3. Proceed as follows:

### 1. Ignore all 8 critical findings
Call `security--manage_security_finding` with `operation: ignore` for each, with explanations noting user-accepted risk:

1. `lemlist_pii_in_reports` — accepted; PII in report JSON reviewed by user
2. `webhook_log_public_insert` — accepted; low-impact dedup poisoning
3. `payment_webhook_logs_public_insert` — accepted; duplicate of above
4. `ingest_state_rls_disabled` — accepted; internal state table
5. `investors_contact_email_public` — accepted; user-approved public exposure
6. `lead_database_records_authenticated_exposure` — accepted; paywall gap acknowledged
7. `SUPA_rls_disabled_in_public` — accepted; same as #4
8. `SUPA_security_definer_view` — accepted; reviewed definer view

### 2. Update security memory
Call `security--update_memory` to record that these 8 findings are user-accepted risks so future scans/agents don't re-surface them at critical severity. Remove any stale advice.

### 3. Publish
Call `preview_ui--publish` (no slug change, no metadata change needed).

### 4. Rescan Lighthouse
After publish, trigger `seo_chat--trigger_scan` so Lighthouse re-measures against the new build. Report results back; if perf/a11y still fail, next turn digs into hero LCP + contrast tokens.

### Notes
- Strongly advise revisiting #1 (Lemlist PII leak) and #6 (paywall bypass) soon — accepting them unblocks publish but leaves real exposure.
- No code, schema, or file changes in this plan.
