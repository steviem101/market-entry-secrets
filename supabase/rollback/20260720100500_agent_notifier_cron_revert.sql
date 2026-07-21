-- Revert 20260720100500_agent_notifier_cron.sql
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from cron.job where jobname = 'agent-notifier') then
    perform cron.unschedule('agent-notifier');
  end if;
end $$;
