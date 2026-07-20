-- Revert 20260720100400_content_refresh_cron.sql
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron')
     and exists (select 1 from cron.job where jobname = 'content-refresh') then
    perform cron.unschedule('content-refresh');
  end if;
end $$;
