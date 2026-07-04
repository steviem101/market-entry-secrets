-- Slack activity-notifications: event bus + data-driven routing (Phase 3.1).
-- Applied to xhziwveaiuhzdoutpgrh. Deny-by-default: RLS on, zero client policies,
-- table grants revoked from anon/authenticated. Producers (SECURITY DEFINER, owner=postgres)
-- and service_role insert; clients cannot read/write.
--
-- NOTE: the Vault secret `slack_notify_webhook_secret` and the slack-notify function-env
-- secrets (SLACK_BOT_TOKEN, SLACK_NOTIFY_WEBHOOK_SECRET) are provisioned out-of-band, not here.

create table if not exists public.activity_events (
  id                uuid primary key default gen_random_uuid(),
  event_type        text not null,
  actor_user_id     uuid,
  actor_email       text,
  actor_name        text,
  object_type       text,
  object_id         uuid,
  metadata          jsonb not null default '{}'::jsonb,
  severity          text not null default 'info'
                      check (severity in ('revenue','action','error','info')),
  dedup_key         text unique,
  notified_at       timestamptz,
  slack_ts          text,
  dispatch_attempts integer not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists activity_events_unnotified_idx
  on public.activity_events (notified_at) where notified_at is null;
create index if not exists activity_events_created_at_idx
  on public.activity_events (created_at);
create index if not exists activity_events_event_type_idx
  on public.activity_events (event_type);

create table if not exists public.activity_event_routing (
  event_type  text primary key,
  channel_id  text not null,
  emoji       text not null default ':bell:',
  severity    text not null,
  realtime    boolean not null default false,
  mention     boolean not null default false,
  enabled     boolean not null default true
);

alter table public.activity_events       enable row level security;
alter table public.activity_event_routing enable row level security;

revoke all on public.activity_events        from anon, authenticated;
revoke all on public.activity_event_routing from anon, authenticated;

-- Seed routing. All disabled until Phase 4 cutover.
insert into public.activity_event_routing
  (event_type, channel_id, emoji, severity, realtime, mention, enabled) values
  -- realtime -> #mes-agents-alerts (C0BACH1NR2S)
  ('subscription.created',   'C0BACH1NR2S', ':money_with_wings:',           'revenue', true,  false, false),
  ('subscription.upgraded',  'C0BACH1NR2S', ':rocket:',                     'revenue', true,  false, false),
  ('subscription.downgraded','C0BACH1NR2S', ':chart_with_downwards_trend:', 'action',  true,  false, false),
  ('intro.requested',        'C0BACH1NR2S', ':handshake:',                  'action',  true,  false, false),
  ('submission.received',    'C0BACH1NR2S', ':inbox_tray:',                 'action',  true,  false, false),
  ('lead.submitted',         'C0BACH1NR2S', ':seedling:',                   'action',  true,  false, false),
  ('review.submitted',       'C0BACH1NR2S', ':star:',                       'action',  true,  false, false),
  ('report.failed',          'C0BACH1NR2S', ':rotating_light:',            'error',   true,  true,  false),
  ('email.failed',           'C0BACH1NR2S', ':warning:',                    'error',   true,  true,  false),
  -- digest -> #mes-agents-digest (C0BAJ7ZD6VA)
  ('user.signed_up',         'C0BAJ7ZD6VA', ':wave:',                       'info',    false, false, false),
  ('report.requested',       'C0BAJ7ZD6VA', ':memo:',                       'info',    false, false, false),
  ('report.started',         'C0BAJ7ZD6VA', ':hourglass_flowing_sand:',     'info',    false, false, false),
  ('report.completed',       'C0BAJ7ZD6VA', ':white_check_mark:',           'info',    false, false, false),
  ('email.captured',         'C0BAJ7ZD6VA', ':email:',                      'info',    false, false, false),
  ('chat.started',           'C0BAJ7ZD6VA', ':speech_balloon:',            'info',    false, false, false),
  ('funnel.gate_hit',        'C0BAJ7ZD6VA', ':no_entry:',                   'info',    false, false, false)
on conflict (event_type) do nothing;

comment on table public.activity_events is 'Append-only event bus for platform activity -> Slack notifications. Deny-by-default RLS; producers are SECURITY DEFINER.';
comment on table public.activity_event_routing is 'Data-driven Slack routing + per-event kill switch (enabled=false disables with no deploy).';
