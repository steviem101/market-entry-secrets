-- Phase 3.5: realtime producers (+ the report digest events live in the consolidated
-- user_reports / user_intake_forms functions). All SECURITY DEFINER + exception-safe so a
-- notification insert can never roll back the producer's business write.

-- intro.requested
create or replace function public.emit_mentor_contact_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity('intro.requested','action',
    null, NEW.requester_email, NEW.requester_name,
    'mentor_contact_requests', NEW.id,
    jsonb_build_object('mentor_id', NEW.mentor_id, 'company', NEW.requester_company, 'country', NEW.requester_country),
    'intro.requested:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_mentor_contact_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_mentor_contact_activity on public.mentor_contact_requests;
create trigger trg_emit_mentor_contact_activity
  after insert on public.mentor_contact_requests
  for each row execute function public.emit_mentor_contact_activity();

-- submission.received
create or replace function public.emit_directory_submission_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity('submission.received','action',
    null, NEW.contact_email, null,
    'directory_submissions', NEW.id,
    jsonb_build_object('submission_type', NEW.submission_type),
    'submission.received:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_directory_submission_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_directory_submission_activity on public.directory_submissions;
create trigger trg_emit_directory_submission_activity
  after insert on public.directory_submissions
  for each row execute function public.emit_directory_submission_activity();

-- lead.submitted
create or replace function public.emit_lead_submission_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity('lead.submitted','action',
    null, NEW.email, null,
    'lead_submissions', NEW.id,
    jsonb_build_object('sector', NEW.sector, 'target_market', NEW.target_market, 'company_website', NEW.company_website),
    'lead.submitted:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_lead_submission_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_lead_submission_activity on public.lead_submissions;
create trigger trg_emit_lead_submission_activity
  after insert on public.lead_submissions
  for each row execute function public.emit_lead_submission_activity();

-- review.submitted
create or replace function public.emit_review_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.log_activity('review.submitted','action',
    null, null, NEW.reviewer_name,
    'service_provider_reviews', NEW.id,
    jsonb_build_object('service_provider_id', NEW.service_provider_id, 'rating', NEW.rating, 'is_verified', NEW.is_verified),
    'review.submitted:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_review_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_review_activity on public.service_provider_reviews;
create trigger trg_emit_review_activity
  after insert on public.service_provider_reviews
  for each row execute function public.emit_review_activity();

-- user_reports: report.completed (info) / report.failed (error)
create or replace function public.emit_user_report_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare evt text; sev text; company text;
begin
  if TG_OP = 'INSERT' then
    if NEW.status not in ('completed','failed') then return NEW; end if;
  else
    if NEW.status is not distinct from OLD.status then return NEW; end if;
    if NEW.status not in ('completed','failed') then return NEW; end if;
  end if;

  if NEW.status = 'completed' then evt := 'report.completed'; sev := 'info';
  else evt := 'report.failed'; sev := 'error'; end if;

  select company_name into company from public.user_intake_forms where id = NEW.intake_form_id;

  perform public.log_activity(evt, sev, NEW.user_id, null, null,
    'user_reports', NEW.id,
    jsonb_build_object('tier_at_generation', NEW.tier_at_generation, 'intake_form_id', NEW.intake_form_id, 'company', company),
    evt||':report:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_user_report_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_user_report_activity on public.user_reports;
create trigger trg_emit_user_report_activity
  after insert or update on public.user_reports
  for each row execute function public.emit_user_report_activity();

-- user_intake_forms: report.requested (info, insert) / report.started (info) / report.failed (error)
create or replace function public.emit_intake_form_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare evt text; sev text;
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity('report.requested','info', NEW.user_id, null, null,
      'user_intake_forms', NEW.id,
      jsonb_build_object('company', NEW.company_name, 'country', NEW.country_of_origin, 'industry', NEW.industry_sector),
      'report.requested:'||NEW.id::text);
    return NEW;
  end if;

  if NEW.status is not distinct from OLD.status then return NEW; end if;
  if NEW.status = 'processing' then evt := 'report.started'; sev := 'info';
  elsif NEW.status = 'failed' then evt := 'report.failed'; sev := 'error';
  else return NEW; end if;

  perform public.log_activity(evt, sev, NEW.user_id, null, null,
    'user_intake_forms', NEW.id,
    jsonb_build_object('company', NEW.company_name, 'country', NEW.country_of_origin),
    evt||':intake:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_intake_form_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_intake_form_activity on public.user_intake_forms;
create trigger trg_emit_intake_form_activity
  after insert or update on public.user_intake_forms
  for each row execute function public.emit_intake_form_activity();

-- email.failed (error)
create or replace function public.emit_email_log_activity()
returns trigger language plpgsql security definer set search_path = public as $$
declare is_fail boolean; was_fail boolean;
begin
  is_fail := (NEW.status = 'failed' or NEW.error_message is not null);
  if not is_fail then return NEW; end if;
  if TG_OP = 'UPDATE' then
    was_fail := (OLD.status = 'failed' or OLD.error_message is not null);
    if was_fail then return NEW; end if;   -- already in failed state, don't re-fire
  end if;

  perform public.log_activity('email.failed','error', NEW.user_id, NEW.recipient_email, null,
    'email_log', NEW.id,
    jsonb_build_object('email_type', NEW.email_type, 'status', NEW.status, 'error', NEW.error_message),
    'email.failed:'||NEW.id::text);
  return NEW;
exception when others then raise log 'emit_email_log_activity failed: %', sqlerrm; return NEW;
end $$;
drop trigger if exists trg_emit_email_log_activity on public.email_log;
create trigger trg_emit_email_log_activity
  after insert or update on public.email_log
  for each row execute function public.emit_email_log_activity();
