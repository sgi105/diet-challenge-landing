-- /diet/stats 대시보드용 집계 — 날짜별 방문·신청서 버튼 클릭·신청 수 (한국 시간 기준, 세션 단위)
-- 원본 landing_events·diet_consults 는 RLS로 잠겨 있고 이 집계만 공개한다(개인정보 없음).
create or replace function public.diet_stats()
returns json
language sql
security definer
set search_path = public
as $$
  with ev as (
    select (created_at at time zone 'Asia/Seoul')::date d, session_id, event, step_index, step_key, placement, utm_source, in_app
    from landing_events where event like 'diet\_%'
  ),
  days as (
    select generate_series(date '2026-11-17', (now() at time zone 'Asia/Seoul')::date, interval '1 day')::date d
  ),
  sub as (
    select (created_at at time zone 'Asia/Seoul')::date d, count(*) n from diet_consults group by 1
  )
  select json_build_object(
    'daily', (
      select json_agg(json_build_object(
        'd', days.d,
        'visitors', (select count(distinct session_id) from ev where ev.d = days.d and event = 'diet_view'),
        'cta', (select count(distinct session_id) from ev where ev.d = days.d and event = 'diet_cta_click'),
        'started', (select count(distinct session_id) from ev where ev.d = days.d and event = 'diet_q_view'),
        'submits', coalesce((select n from sub where sub.d = days.d), 0)
      ) order by days.d desc) from days
    ),
    'totals', json_build_object(
      'visitors', (select count(distinct session_id) from ev where event = 'diet_view'),
      'cta', (select count(distinct session_id) from ev where event = 'diet_cta_click'),
      'submits', (select count(*) from diet_consults)
    ),
    'steps', (
      select json_agg(x order by x.step_index) from (
        select step_index, max(step_key) step_key, count(distinct session_id) sessions
        from ev where event = 'diet_q_view' group by step_index
      ) x
    ),
    'sources', (
      select json_agg(x order by x.visitors desc) from (
        select coalesce(nullif(utm_source, ''), in_app, 'direct') src, count(distinct session_id) visitors
        from ev where event = 'diet_view' group by 1
      ) x
    ),
    'placements', (
      select json_agg(x order by x.clicks desc) from (
        select coalesce(placement, '?') placement, count(distinct session_id) clicks
        from ev where event = 'diet_cta_click' group by 1
      ) x
    )
  );
$$;
grant execute on function public.diet_stats() to anon, authenticated;
