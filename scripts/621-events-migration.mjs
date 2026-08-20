// [621] 랜딩 퍼널 이벤트 테이블 + 집계 RPC
import { q } from './621-db.mjs';

const SQL = `
-- 랜딩 → 지원서 퍼널 이벤트 원본.
-- 개인정보는 담지 않는다(세션 식별자만). 지원자 신원은 applications 테이블에 있다.
create table if not exists landing_events (
  id           bigserial primary key,
  created_at   timestamptz not null default now(),
  session_id   text not null,          -- 브라우저 세션 단위 무작위 id (개인 식별 X)
  event        text not null,          -- page_view | cta_click | apply_open | apply_step | apply_submit
  cohort_code  text,
  step_key     text,                   -- 지원서 단계 키 (apply_step)
  step_index   int,
  placement    text,                   -- CTA 위치 (cta_click)
  path         text,
  referrer     text,
  is_referral  boolean
);

create index if not exists landing_events_cohort_created_idx on landing_events (cohort_code, created_at desc);
create index if not exists landing_events_event_idx on landing_events (event);
create index if not exists landing_events_session_idx on landing_events (session_id);

alter table landing_events enable row level security;

-- 익명 방문자는 쓰기만 가능. 읽기는 아래 집계 함수로만 (원본 노출 X).
drop policy if exists landing_events_anon_insert on landing_events;
create policy landing_events_anon_insert on landing_events
  for insert to anon, authenticated with check (true);

-- 퍼널 집계. 사람 수는 전부 세션 기준 distinct.
create or replace function landing_funnel(p_cohort text)
returns json
language sql
security definer
set search_path = public
as $$
  with base as (
    select * from landing_events where cohort_code = p_cohort
  ),
  totals as (
    select
      count(distinct session_id) filter (where event = 'page_view')    as visitors,
      count(distinct session_id) filter (where event = 'cta_click')    as cta_clicks,
      count(distinct session_id) filter (where event = 'apply_open')   as apply_opens,
      count(distinct session_id) filter (where event = 'apply_submit') as submits
    from base
  ),
  steps as (
    select step_index, step_key, count(distinct session_id) as reached
    from base
    where event = 'apply_step' and step_key is not null
    group by 1, 2
  ),
  placements as (
    select placement,
           count(*) as clicks,
           count(distinct session_id) as sessions
    from base
    where event = 'cta_click' and placement is not null
    group by 1
  ),
  daily as (
    select (created_at at time zone 'Asia/Seoul')::date as day,
      count(distinct session_id) filter (where event = 'page_view')    as visitors,
      count(distinct session_id) filter (where event = 'cta_click')    as cta_clicks,
      count(distinct session_id) filter (where event = 'apply_open')   as apply_opens,
      count(distinct session_id) filter (where event = 'apply_submit') as submits
    from base
    group by 1
  )
  select json_build_object(
    'totals',     (select row_to_json(t) from totals t),
    'steps',      coalesce((select json_agg(row_to_json(s) order by s.step_index) from steps s), '[]'::json),
    'placements', coalesce((select json_agg(row_to_json(p) order by p.clicks desc) from placements p), '[]'::json),
    'daily',      coalesce((select json_agg(row_to_json(d) order by d.day) from daily d), '[]'::json)
  );
$$;

grant execute on function landing_funnel(text) to anon, authenticated;
`;

await q(SQL);
console.log('마이그레이션 적용 완료');
console.log(JSON.stringify(await q("select landing_funnel('260824_team_run') as r"), null, 1));
