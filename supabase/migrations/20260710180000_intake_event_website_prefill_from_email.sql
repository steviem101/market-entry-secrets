-- Widen the intake_form_events.event_type CHECK to allow the new
-- 'website_prefill_from_email' funnel event (fired when a signed-in user's
-- corporate email domain prefills the report-creator website field).
--
-- Additive only — appends one value to the allowed set; every existing value
-- is preserved, so no rows can be invalidated. Idempotent: drop-if-exists then
-- re-add, safe to replay on preview branches.

ALTER TABLE public.intake_form_events
  DROP CONSTRAINT IF EXISTS intake_form_events_event_type_check;

ALTER TABLE public.intake_form_events
  ADD CONSTRAINT intake_form_events_event_type_check CHECK (
    event_type = ANY (ARRAY[
      'persona_selected',
      'step_entered',
      'step_exited',
      'field_focused',
      'field_completed',
      'field_skipped',
      'website_prefill_shown',
      'website_prefill_accepted',
      'website_prefill_rejected',
      'website_prefill_from_email',
      'auth_modal_shown',
      'auth_completed',
      'generate_clicked',
      'report_completed',
      'abandoned'
    ]::text[])
  );
