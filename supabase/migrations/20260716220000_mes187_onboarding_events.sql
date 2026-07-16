-- MES-187 A3 — allow the streamlined welcome-modal funnel events.
--
-- The redesigned onboarding modal emits onboarding_modal_shown / _completed /
-- _skipped on the same fire-and-forget intake_form_events bus as the MES-191
-- funnel events. The bus swallows insert errors by design, so a value missing
-- from the event_type CHECK fails SILENTLY — this widening is what makes the
-- events actually land (same class of gap the mes-qa exam caught for T13).
--
-- Non-destructive: the new CHECK is a strict SUPERSET of the MES-196 one, so
-- every existing row stays valid and validation is instant. Idempotent
-- (DROP CONSTRAINT IF EXISTS then re-add) and self-sufficient on an empty
-- preview replay. Same pattern as 20260715160000 / 20260716200000.

alter table public.intake_form_events drop constraint if exists intake_form_events_event_type_check;
alter table public.intake_form_events add constraint intake_form_events_event_type_check
  check (event_type = any (array[
    -- intake funnel (existing)
    'persona_selected', 'step_entered', 'step_exited', 'field_focused', 'field_completed',
    'field_skipped', 'website_prefill_shown', 'website_prefill_accepted', 'website_prefill_rejected',
    'website_prefill_from_email', 'auth_modal_shown', 'auth_completed', 'generate_clicked',
    'report_completed', 'abandoned',
    -- funnel-wide (MES-191 / T5a)
    'gate_impression', 'gate_click', 'checkout_started', 'checkout_completed',
    'signup_started', 'session_established', 'report_viewed', 'section_feedback_opened',
    -- advisor booking (MES-196 / T13)
    'session_booking_opened',
    -- streamlined onboarding modal (MES-187 A3)
    'onboarding_modal_shown', 'onboarding_modal_completed', 'onboarding_modal_skipped'
  ]));
