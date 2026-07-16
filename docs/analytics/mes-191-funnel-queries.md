# Funnel query pack (MES-191 / T5a)

> Dashboard queries over `intake_form_events` (the funnel bus). Every query
> **excludes test/founder accounts** (MES-190 `is_test`) so day-1 numbers are
> real; anonymous events (`user_id is null`) are kept as genuine top-of-funnel.
> `source` attributes the surface (`report`, `pricing`; `homepage_hero` reserved
> for MES-158). Read-only; run as service role.

Events emitted (all wired as of T5a increment 2):
`gate_impression` · `gate_click` · `checkout_started` · `checkout_completed` ·
`signup_started` · `session_established` · `report_viewed` · `section_feedback_opened`
(plus the existing intake-wizard events).

`source` attribution by event: gate events → `report` (report upgrade gate) or
`directory` (freemium 3-view wall); `signup_started` → `email`;
`session_established` → `auth`; `section_feedback_opened` → `report_top`
(the report-open bar) or `report_footer` (the notes widget); checkout/report →
`report`/`pricing`.

## Exclusion predicate (reused by every query below)

```sql
-- keep an event unless it belongs to a flagged test user
-- (anonymous events, user_id is null, are always kept)
left join public.profiles p on p.id = e.user_id
where coalesce(p.is_test, false) = false
```

## Event volume (last 7d, real users)

```sql
select e.event_type, e.source, count(*) as n
from public.intake_form_events e
left join public.profiles p on p.id = e.user_id
where coalesce(p.is_test, false) = false
  and e.created_at >= now() - interval '7 days'
group by e.event_type, e.source
order by n desc;
```

## North star — report → paid within 7 days

```sql
-- distinct real users who viewed a report, and how many completed checkout
-- within 7 days of their first report view.
with viewed as (
  select e.user_id, min(e.created_at) as first_view
  from public.intake_form_events e
  left join public.profiles p on p.id = e.user_id
  where e.event_type = 'report_viewed' and e.user_id is not null
    and coalesce(p.is_test, false) = false
  group by e.user_id
),
paid as (
  select e.user_id, min(e.created_at) as first_paid
  from public.intake_form_events e
  where e.event_type = 'checkout_completed' and e.user_id is not null
  group by e.user_id
)
select
  count(*) filter (where v.user_id is not null) as viewed_report,
  count(*) filter (where pd.first_paid is not null
                     and pd.first_paid <= v.first_view + interval '7 days') as paid_within_7d,
  round(100.0 * count(*) filter (where pd.first_paid is not null
                     and pd.first_paid <= v.first_view + interval '7 days')
        / nullif(count(*) filter (where v.user_id is not null), 0), 1) as pct
from viewed v
left join paid pd using (user_id);
```

## Checkout conversion (started → completed) by source

```sql
select e.source,
  count(*) filter (where e.event_type = 'checkout_started')   as started,
  count(*) filter (where e.event_type = 'checkout_completed') as completed,
  round(100.0 * count(*) filter (where e.event_type = 'checkout_completed')
        / nullif(count(*) filter (where e.event_type = 'checkout_started'), 0), 1) as pct
from public.intake_form_events e
left join public.profiles p on p.id = e.user_id
where coalesce(p.is_test, false) = false
  and e.event_type in ('checkout_started', 'checkout_completed')
group by e.source
order by started desc;
```

## Daily report views (real users + anonymous)

```sql
select date_trunc('day', e.created_at)::date as day, count(*) as report_views
from public.intake_form_events e
left join public.profiles p on p.id = e.user_id
where e.event_type = 'report_viewed'
  and coalesce(p.is_test, false) = false
group by 1 order by 1 desc;
```

## Upgrade-gate conversion (impression → click → checkout) by source

```sql
-- how many locked-gate impressions turn into upgrade clicks, per gate surface.
-- 'report'   = report premium-section wall (feeds checkout)
-- 'directory'= freemium 3-free-views wall (feeds signup)
select e.source,
  count(*) filter (where e.event_type = 'gate_impression') as impressions,
  count(*) filter (where e.event_type = 'gate_click')      as clicks,
  round(100.0 * count(*) filter (where e.event_type = 'gate_click')
        / nullif(count(*) filter (where e.event_type = 'gate_impression'), 0), 1) as ctr_pct
from public.intake_form_events e
left join public.profiles p on p.id = e.user_id
where coalesce(p.is_test, false) = false
  and e.event_type in ('gate_impression', 'gate_click')
group by e.source
order by impressions desc;
```

## Signup funnel (started → session established)

```sql
-- signup_started is anonymous (no user_id yet); session_established carries the
-- user_id once the session lands. Test-user exclusion applies to the latter only.
select
  count(*) filter (where event_type = 'signup_started')       as signup_started,
  count(*) filter (where event_type = 'session_established'
                     and coalesce(p.is_test, false) = false)  as session_established
from public.intake_form_events e
left join public.profiles p on p.id = e.user_id
where e.event_type in ('signup_started', 'session_established')
  and e.created_at >= now() - interval '30 days';
```

## Report feedback engagement (opened → scored)

```sql
-- section_feedback_opened marks first engagement with a feedback prompt,
-- split by placement (report_top = the report-open bar, report_footer = the
-- notes widget). Pairs with report_viewed for an engagement rate.
select e.source,
  count(*) as feedback_opened
from public.intake_form_events e
left join public.profiles p on p.id = e.user_id
where e.event_type = 'section_feedback_opened'
  and coalesce(p.is_test, false) = false
group by e.source
order by feedback_opened desc;
```
