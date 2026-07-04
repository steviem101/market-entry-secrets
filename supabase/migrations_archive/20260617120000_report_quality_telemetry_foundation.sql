-- Report-quality telemetry (Phase A). System-of-record table + routing + producer emit.
-- Telemetry is computed in slack-notify from the already-persisted report_json (no generate-report change here).

create table if not exists public.report_quality (
  id                 uuid primary key default gen_random_uuid(),
  report_id          uuid not null unique,
  intake_form_id     uuid,
  user_id            uuid,
  report_status      text,
  build_health       integer,
  score_plumbing     integer,
  score_coverage     integer,
  score_completeness integer,
  degraded           boolean not null default false,
  rag_hit_rate       numeric,
  tables_hit         integer,
  total_matches      integer,
  match_counts       jsonb not null default '{}'::jsonb,
  sources            jsonb not null default '{}'::jsonb,
  generation_time_ms integer,
  groundedness       numeric,
  prompt_version     text,
  cost               jsonb,          -- populated in Phase E (tokens/$)
  insights           jsonb,          -- populated in Phase C (insights agent)
  user_feedback      integer,        -- mirrored from user_reports.feedback_score when set
  metadata           jsonb not null default '{}'::jsonb,
  created_at         timestamptz not null default now()
);
create index if not exists report_quality_created_at_idx on public.report_quality (created_at);
create index if not exists report_quality_build_health_idx on public.report_quality (build_health);

alter table public.report_quality enable row level security;
revoke all on public.report_quality from anon, authenticated;
create policy "Admins read report_quality"
  on public.report_quality for select
  using (public.has_role((select auth.uid()), 'admin'::public.app_role));

comment on table public.report_quality is 'Per-report build-health / RAG-coverage telemetry (system of record for #report-quality + trend analysis). Writes are service-role only.';

-- Route report.quality -> #report-quality (realtime per-report card). Disabled until the card is verified.
insert into public.activity_event_routing (event_type, channel_id, emoji, severity, realtime, mention, enabled)
values ('report.quality','C0BB2PH60K0',':microscope:','info', true, false, false)
on conflict (event_type) do update set channel_id = excluded.channel_id;

-- Extend the report producer to also emit report.quality (once per finished report, completed or failed).
create or replace function public.emit_user_report_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare evt text; sev text; ddk text; company text;
begin
  if TG_OP = 'INSERT' then
    if NEW.status not in ('completed','failed') then return NEW; end if;
  else
    if NEW.status is not distinct from OLD.status then return NEW; end if;
    if NEW.status not in ('completed','failed') then return NEW; end if;
  end if;

  select company_name into company from public.user_intake_forms where id = NEW.intake_form_id;

  if NEW.status = 'completed' then
    evt := 'report.completed'; sev := 'info'; ddk := 'report.completed:report:'||NEW.id::text;
  else
    evt := 'report.failed'; sev := 'error';
    ddk := 'report.failed:'||coalesce(NEW.intake_form_id::text, NEW.id::text);
  end if;

  perform public.log_activity(evt, sev, NEW.user_id, null, null,
    'user_reports', NEW.id,
    jsonb_build_object('tier_at_generation', NEW.tier_at_generation, 'intake_form_id', NEW.intake_form_id, 'company', company),
    ddk);

  -- report-quality telemetry card (slack-notify reads report_json by report_id to score it).
  perform public.log_activity('report.quality', 'info', NEW.user_id, null, null,
    'user_reports', NEW.id,
    jsonb_build_object('report_status', NEW.status, 'company', company, 'intake_form_id', NEW.intake_form_id),
    'report.quality:'||NEW.id::text);

  return NEW;
exception when others then raise log 'emit_user_report_activity failed: %', sqlerrm; return NEW;
end $$;
