-- MES-162 — allow the homepage hero credibility funnel events.
--
-- Two new events on the same fire-and-forget intake_form_events bus:
--   * hero_cta_clicked        — a click on the classic hero CTA group (primary /
--                               secondary / startup deep-link), source
--                               'homepage_hero'. The intent-hero path keeps its
--                               own MES-158 events; this closes the gap for the
--                               ?intent=0 fallback so hero CTA clicks are
--                               measurable in both flag states.
--   * hero_journey_step_viewed — a step of the three-panel value-journey proof
--                               section (flag `hero_journey`) became visible;
--                               metadata carries the step key.
--
-- The bus swallows insert errors by design, so a value missing from the
-- event_type CHECK fails SILENTLY — this widening is what makes the events
-- land. Non-destructive: strict SUPERSET of the MES-158 CHECK, so every
-- existing row stays valid. Idempotent (DROP CONSTRAINT IF EXISTS then re-add)
-- and self-sufficient on an empty preview replay. Same pattern as
-- 20260716240000 / 20260716220000.

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
    'onboarding_modal_shown', 'onboarding_modal_completed', 'onboarding_modal_skipped',
    -- intent-first hero (MES-158 / Wave-2)
    'hero_intent_started', 'hero_intent_submitted', 'hero_intent_chip_clicked',
    'report_prefill_loaded', 'report_prefill_confirmed', 'report_completed_from_hero_intent',
    -- homepage hero credibility (MES-162)
    'hero_cta_clicked', 'hero_journey_step_viewed'
  ]));
