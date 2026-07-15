-- MES-191 (T5a) — funnel instrumentation: extend the event bus for funnel-wide
-- events + a source attribution field.
--
-- intake_form_events already carries the public-INSERT RLS + fire-and-forget
-- client pattern, so this REUSES it (no new table, no new policy — not RLS work)
-- by widening the event_type CHECK to the funnel-wide types and adding a
-- nullable `source` attribution column (reserves 'homepage_hero' for MES-158).
--
-- Non-destructive: the new CHECK is a strict SUPERSET of the old one, so every
-- existing row stays valid and validation is instant; ADD COLUMN … text is a
-- metadata-only change. Idempotent (ADD COLUMN IF NOT EXISTS, DROP CONSTRAINT IF
-- EXISTS then re-add) and self-sufficient on an empty preview replay.

alter table public.intake_form_events add column if not exists source text;

comment on column public.intake_form_events.source is
  'Funnel-event attribution source (e.g. report, pricing; homepage_hero reserved for MES-158). MES-191 / T5a.';

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
    'signup_started', 'session_established', 'report_viewed', 'section_feedback_opened'
  ]));
