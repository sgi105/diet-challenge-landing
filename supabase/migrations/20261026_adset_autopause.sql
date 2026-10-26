-- 정원이 차면 메타 광고 세트를 자동으로 끈다(가인 2026-10-26 "완전 자동"). 컴퓨터가 꺼져 있어도 DB cron 이 한다.
-- 5분마다: 정원 도달 → 엣지 meta-ads-control(pause) 호출 → 응답 200 확인되면 cron 스스로 해제. 실패면 다음 회차에 재시도.
-- 엣지는 secret META_ADS_TOKEN(광고 관리 권한) 필요. 기록 = coach_settings 'adset_autopause'.
create or replace function public.adset_autopause()
returns void
language plpgsql security definer set search_path to 'public'
as $$
declare
  v_cohort text := '261019_team_run_season6';
  v_spots int := 50;
  v_adset text := '120253518962270415'; -- 261019_team_run_season6 전국 브로드
  v_state jsonb; v_req bigint; v_code int;
begin
  select value into v_state from public.coach_settings where key = 'adset_autopause';
  v_req := (v_state ->> 'req')::bigint;
  if v_req is not null then
    select status_code into v_code from net._http_response where id = v_req;
    if v_code = 200 then
      insert into public.coach_settings (key, value, updated_at)
        values ('adset_autopause', v_state || jsonb_build_object('done_at', now()), now())
        on conflict (key) do update set value = excluded.value, updated_at = now();
      perform cron.unschedule('adset-autopause');
      return;
    elsif v_code is null then
      return; -- 아직 응답 대기
    end if;
    -- 실패 → 아래에서 재시도
  end if;
  if public.count_applicants_public(v_cohort) < v_spots then return; end if;
  v_req := net.http_post(
    url := 'https://arjkkooducikmpjeudnc.supabase.co/functions/v1/meta-ads-control',
    headers := public.internal_edge_headers(),
    body := jsonb_build_object('action', 'pause', 'adset_id', v_adset));
  insert into public.coach_settings (key, value, updated_at)
    values ('adset_autopause', jsonb_build_object('req', v_req, 'at', now(), 'last_code', v_code), now())
    on conflict (key) do update set value = excluded.value, updated_at = now();
end;
$$;
revoke all on function public.adset_autopause() from public, anon, authenticated;

select cron.unschedule('adset-autopause') where exists (select 1 from cron.job where jobname = 'adset-autopause');
select cron.schedule('adset-autopause', '*/5 * * * *', 'select public.adset_autopause()');
