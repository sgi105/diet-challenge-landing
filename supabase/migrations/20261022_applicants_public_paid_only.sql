-- 참가비(카드 결제) 도입 후 공개 지원자 수·목록은 "결제 완료"만 센다.
-- 지원서는 결제창 열기 전에 먼저 저장되므로, 결제 안 하고 나간 행까지 세면 정원(50명)이 부풀어 마감이 일찍 걸린다.
-- 결제 도입(2026-10-22) 전 행은 pay_state 가 없으니 예전처럼 그대로 센다.
create or replace function public.count_applicants_public(p_cohort text default '260601_team_run'::text)
returns integer language sql security definer set search_path to 'public' as $$
  select count(*)::int from public.applications
  where cohort_code = p_cohort and active = true
    and (pay_state = 'paid' or created_at < '2026-10-22 00:00:00+09');
$$;

create or replace function public.list_applicants_public(p_cohort text default '260601_team_run'::text)
returns table(id uuid, name text, age integer, region text, job text, running_exp text, motivation text, instagram text, created_at timestamp with time zone)
language sql security definer set search_path to 'public' as $$
  select id, mask_name(name), age, region, job, running_exp, motivation, instagram, created_at
  from public.applications
  where cohort_code = p_cohort and active = true
    and (pay_state = 'paid' or created_at < '2026-10-22 00:00:00+09')
  order by created_at desc;
$$;
