-- 시즌7부터 참가 결제가 토스(toss_orders)로 들어온다 — 인원 집계에 토스 실결제(DONE, 테스트 제외)를 더한다.
-- 랜딩 "남은 자리", 정원 마감 자동 closed, alert_blasts, 결제 승인 서버의 정원 체크가 모두 이 함수를 쓴다.
-- 주의: 상점관리자에서 직접 취소한 건은 toss_orders.status 가 자동으로 안 바뀐다(웹훅 미연결) — 취소 시 수동 반영.
create or replace function public.count_applicants_public(p_cohort text default '260601_team_run'::text)
returns integer
language sql security definer set search_path to 'public'
as $$
  select (
    (select count(*) from public.applications
      where cohort_code = p_cohort and active = true
        and (pay_state = 'paid' or created_at < '2026-10-22 00:00:00+09'))
    + (select count(*) from public.toss_orders
      where cohort_code = p_cohort and status = 'DONE' and is_test = false)
  )::int;
$$;

-- 정원 마감 감시(설정형): coach_settings 'cohort_full_watch' = {cohort, spots, adsets:[광고세트 ID...]}
-- 정원 도달 시 1회: 텔레그램 "정원 마감" 알림 + adsets 에 적힌 메타 광고 세트 끄기 → done_at 기록 후 멈춤.
-- 다음 기수엔 설정값만 바꾸면 된다(done_at 지우기).
create or replace function public.cohort_full_watch()
returns void
language plpgsql security definer set search_path to 'public'
as $$
declare
  cfg jsonb; v_cohort text; v_spots int; v_n int; v_adset text;
begin
  select value into cfg from public.coach_settings where key = 'cohort_full_watch';
  if cfg is null or (cfg ->> 'done_at') is not null then return; end if;
  v_cohort := cfg ->> 'cohort';
  v_spots := coalesce((cfg ->> 'spots')::int, 0);
  if v_cohort is null or v_spots <= 0 then return; end if;
  v_n := public.count_applicants_public(v_cohort);
  if v_n < v_spots then return; end if;

  perform net.http_post(
    url := 'https://arjkkooducikmpjeudnc.supabase.co/functions/v1/toss-paid-notify',
    headers := public.internal_edge_headers(),
    body := jsonb_build_object('kind', 'full', 'cohort', v_cohort, 'paidCount', v_n, 'capacity', v_spots,
                               'adsets', coalesce(cfg -> 'adsets', '[]'::jsonb)));
  for v_adset in select jsonb_array_elements_text(coalesce(cfg -> 'adsets', '[]'::jsonb)) loop
    perform net.http_post(
      url := 'https://arjkkooducikmpjeudnc.supabase.co/functions/v1/meta-ads-control',
      headers := public.internal_edge_headers(),
      body := jsonb_build_object('action', 'pause', 'adset_id', v_adset));
  end loop;
  update public.coach_settings
    set value = cfg || jsonb_build_object('done_at', now(), 'count', v_n), updated_at = now()
    where key = 'cohort_full_watch';
end;
$$;
revoke all on function public.cohort_full_watch() from public, anon, authenticated;

insert into public.coach_settings (key, value, updated_at)
  values ('cohort_full_watch', jsonb_build_object('cohort', '261130_team_run_season7', 'spots', 50, 'adsets', '[]'::jsonb), now())
  on conflict (key) do nothing;

select cron.unschedule('cohort-full-watch') where exists (select 1 from cron.job where jobname = 'cohort-full-watch');
select cron.schedule('cohort-full-watch', '*/5 * * * *', 'select public.cohort_full_watch()');
