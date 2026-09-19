-- 다음 기수 오픈 알림 신청 (2026-09-19)
-- 260921_team_run_season5 마감 뒤 랜딩 버튼 → /notify 에서 전화번호 하나만 받는다.
-- 지원서(applications)는 이름·나이·직업 등이 필수라 섞지 않고 전용 테이블로 둔다(코치 신청서 목록 오염 방지).
--
-- 권한: anon = INSERT만 · 읽기는 코치 계정 2개만(applications 와 같은 규칙) · 공개 /stats 에는 숫자만(RPC).

create table if not exists public.cohort_alerts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  phone text not null check (char_length(phone) between 6 and 30),
  phone_country text not null default 'KR' check (char_length(phone_country) <= 4),
  consent boolean not null default true,
  source_cohort text,            -- 어느 기수 마감 뒤에 신청했나 (예: 260921_team_run_season5)
  notified_at timestamptz,       -- 다음 기수 오픈 문자 보낸 시각 (코치가 표시)
  utm_source text,
  utm_medium text,
  utm_campaign text
);

create index if not exists cohort_alerts_created_idx on public.cohort_alerts (created_at desc);

alter table public.cohort_alerts enable row level security;

drop policy if exists "anon insert cohort_alerts" on public.cohort_alerts;
create policy "anon insert cohort_alerts" on public.cohort_alerts
  for insert to anon, authenticated with check (consent = true);

drop policy if exists "coach select cohort_alerts" on public.cohort_alerts;
create policy "coach select cohort_alerts" on public.cohort_alerts
  for select to authenticated
  using (auth.uid() = any (array['02d34f88-ba89-4253-8b7d-f2189948ca71'::uuid, 'e26e7606-ff68-4136-8d91-16ab950e21b8'::uuid]));

drop policy if exists "coach update cohort_alerts" on public.cohort_alerts;
create policy "coach update cohort_alerts" on public.cohort_alerts
  for update to authenticated
  using (auth.uid() = any (array['02d34f88-ba89-4253-8b7d-f2189948ca71'::uuid, 'e26e7606-ff68-4136-8d91-16ab950e21b8'::uuid]));

grant insert on public.cohort_alerts to anon, authenticated;
grant select, update on public.cohort_alerts to authenticated;

-- 공개 대시보드(/stats)용 — 번호 없이 숫자만.
create or replace function public.count_cohort_alerts_public(p_cohort text default null)
returns integer
language sql
security definer
set search_path = public
as $$
  select count(*)::int from public.cohort_alerts
  where p_cohort is null or source_cohort = p_cohort;
$$;
grant execute on function public.count_cohort_alerts_public(text) to anon, authenticated;
