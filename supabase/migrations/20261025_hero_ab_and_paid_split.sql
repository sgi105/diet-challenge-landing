-- 261019_team_run_season6 히어로 A/B + /stats 결제·광고 구분.
-- variant: 첫 화면 A(기존) / B(90일 헤드라인). 브라우저마다 고정 배정(localStorage).
alter table public.landing_events add column if not exists variant text;
alter table public.applications add column if not exists hero_variant text;

-- A/B별 · 유입(광고/자연)별 퍼널 + 결제.
-- 방문~제출은 landing_events(세션), 지원·결제는 applications(실제 행) 기준.
-- 광고 = utm_medium 'paid' (메타 광고 URL 매개변수). 그 외는 전부 자연 유입.
create or replace function public.landing_ab(p_cohort text, p_since timestamptz default null)
returns json
language sql
security definer
set search_path to 'public'
as $$
  with base as (
    select * from landing_events
    where cohort_code = p_cohort and (p_since is null or created_at >= p_since)
  ),
  sess as (
    select session_id,
      max(variant) as variant,
      case when bool_or(utm_medium = 'paid') then 'paid' else 'organic' end as medium,
      bool_or(event = 'page_view')                              as visited,
      bool_or(event = 'section_view' and placement <> 'hero')   as scrolled,
      bool_or(event = 'cta_click')                              as clicked,
      bool_or(event = 'apply_open')                             as opened,
      bool_or(event = 'apply_submit')                           as submitted
    from base group by 1
  ),
  apps as (
    select hero_variant as variant,
      case when utm_medium = 'paid' then 'paid' else 'organic' end as medium,
      paid
    from applications
    where cohort_code = p_cohort and (p_since is null or created_at >= p_since)
  ),
  by_variant as (
    select s.variant,
      count(*) filter (where visited)   as visitors,
      count(*) filter (where scrolled)  as scrolled,
      count(*) filter (where clicked)   as cta_clicks,
      count(*) filter (where opened)    as apply_opens,
      (select count(*) from apps a where a.variant = s.variant)            as applicants,
      (select count(*) from apps a where a.variant = s.variant and a.paid) as paid
    from sess s where s.variant is not null group by 1
  ),
  by_medium as (
    select s.medium,
      count(*) filter (where visited)   as visitors,
      count(*) filter (where scrolled)  as scrolled,
      count(*) filter (where clicked)   as cta_clicks,
      count(*) filter (where opened)    as apply_opens,
      (select count(*) from apps a where a.medium = s.medium)            as applicants,
      (select count(*) from apps a where a.medium = s.medium and a.paid) as paid
    from sess s group by 1
  )
  select json_build_object(
    'by_variant', coalesce((select json_agg(row_to_json(v) order by v.variant) from by_variant v), '[]'::json),
    'by_medium',  coalesce((select json_agg(row_to_json(m) order by m.medium desc) from by_medium m), '[]'::json),
    'paid_total', (select count(*) from apps where paid),
    'applicants_total', (select count(*) from apps)
  );
$$;

grant execute on function public.landing_ab(text, timestamptz) to anon, authenticated;
