-- D2/D7 report follow-up nurture (conversion plan step 4, 2026-07-17).
--
-- A FREE-tier member whose completed report matched real options in its gated
-- sections gets two follow-up emails on the existing email_sequences rails:
--   D2 (report_followup_d2): "what your locked sections found" — their own
--       match counts (counts only, never names) + a link back to the report.
--   D7 (report_followup_d7): reflection-time social proof + the honest
--       purchase-confidence facts (one-time payment, instant unlock, human
--       advisor) + pricing.
--
-- Enrolment: generate-report inserts the email_sequences row on completion
-- (free tier + at least one non-zero locked count; unique (user_id,
-- sequence_name) makes it once per user, on conflict do nothing). Sending:
-- process-email-queue — which SKIPS these steps for anyone who has upgraded by
-- send time, and skips + advances when the fresh locked counts are zero.
-- Unsubscribe: the templates are marketing-class (layout unsubscribe footer)
-- and send-email's central opt-out suppression applies.
--
-- Step delay semantics (process-email-queue): the enroller sets the FIRST
-- next_send_at (now + 2 days); after a step sends, the next is scheduled at the
-- DELTA of the two steps' delay_days — so 2 then 7 yields D2 and D7.
--
-- Additive + idempotent (guarded inserts); data-only, no schema change.

insert into public.email_sequence_steps (sequence_name, step_number, template_name, subject, delay_days, is_active)
select 'report_followup', 1, 'report_followup_d2', 'Your report found more than you have unlocked', 2, true
where not exists (
  select 1 from public.email_sequence_steps
  where sequence_name = 'report_followup' and step_number = 1
);

insert into public.email_sequence_steps (sequence_name, step_number, template_name, subject, delay_days, is_active)
select 'report_followup', 2, 'report_followup_d7', 'How companies like yours entered Australia', 7, true
where not exists (
  select 1 from public.email_sequence_steps
  where sequence_name = 'report_followup' and step_number = 2
);
