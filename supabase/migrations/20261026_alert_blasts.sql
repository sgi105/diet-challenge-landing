-- 알림 신청자(cohort_alerts) 단체 문자 예약 — DB(pg_net)에서 쏘다로. 2026-10-26.
-- 로컬 스크립트(scripts/send-alert-sms.mjs)는 가인 집 IP 에서만 되고 사람이 돌려야 한다.
-- 이건 DB 고정 출구 IP(쏘다 DB 토큰)로 나가서 언제 어디서든 자동으로 보낸다.
--
-- 한 줄 = 한 번의 단체 문자. 조건:
--   condition 'not_full' : send_after 이후, 아직 정원 미달일 때만 보낸다(그 전에 다 차면 skipped).
--   condition 'full'     : 정원이 차는 순간 보낸다(마감 문자).
-- 문구의 {left} 는 보낼 때의 남은 자리 수로 바뀐다. 사람마다 맨 아래 수신 해제 링크가 붙는다.
-- 광고 문자 야간 금지: KST 21시-08시엔 안 보내고 기다린다.
-- 쏘다 429 를 피하려고 1분에 5명씩 나눠 보낸다(cron alert-blasts).
-- 받는 사람 = 수신 해제 안 함 + 첫 오픈 문자 받은 사람(notified_at) + 이 기수에 지원서 안 낸 번호. 같은 번호는 한 번.

create table if not exists public.alert_blasts (
  key text primary key,
  cohort_code text not null,
  total_spots int not null,
  condition text not null check (condition in ('not_full', 'full')),
  subject text,
  body text not null,
  send_after timestamptz not null default now(),
  status text not null default 'waiting' check (status in ('waiting', 'sending', 'done', 'skipped')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.alert_blast_sends (
  blast_key text not null references public.alert_blasts(key) on delete cascade,
  phone8 text not null,
  alert_id uuid,
  req_id bigint,           -- net._http_response 대조용 (6시간 보관)
  sent_at timestamptz not null default now(),
  primary key (blast_key, phone8)
);

alter table public.alert_blasts enable row level security;
alter table public.alert_blast_sends enable row level security;

-- 아직 안 보낸 대상
create or replace function public.alert_blast_targets(p_key text)
returns table (alert_id uuid, phone text, phone8 text)
language sql stable security definer set search_path to 'public'
as $$
  with b as (select * from public.alert_blasts where key = p_key),
  c as (
    select distinct on (right(regexp_replace(ca.phone, '\D', '', 'g'), 8))
      ca.id, regexp_replace(ca.phone, '\D', '', 'g') as d, right(regexp_replace(ca.phone, '\D', '', 'g'), 8) as p8
    from public.cohort_alerts ca, b
    where ca.unsubscribed_at is null and ca.notified_at is not null
      and regexp_replace(ca.phone, '\D', '', 'g') ~ '^01\d{8,9}$'
      and not exists (select 1 from public.applications a
        where a.cohort_code = b.cohort_code
          and right(regexp_replace(a.phone, '\D', '', 'g'), 8) = right(regexp_replace(ca.phone, '\D', '', 'g'), 8))
    order by right(regexp_replace(ca.phone, '\D', '', 'g'), 8), ca.created_at desc
  )
  select c.id, c.d, c.p8 from c
  where not exists (select 1 from public.alert_blast_sends s where s.blast_key = p_key and s.phone8 = c.p8);
$$;

create or replace function public.process_alert_blasts()
returns void
language plpgsql security definer set search_path to 'public'
as $$
declare
  b record; t record; n int; v_left int; v_body text; v_subj text; v_req bigint; v_cnt int;
  v_hour int := extract(hour from now() at time zone 'Asia/Seoul');
begin
  if v_hour < 8 or v_hour >= 21 then return; end if;
  for b in select * from public.alert_blasts where status in ('waiting', 'sending') and send_after <= now() loop
    n := public.count_applicants_public(b.cohort_code);
    if b.condition = 'not_full' and n >= b.total_spots and b.status = 'waiting' then
      update public.alert_blasts set status = 'skipped', finished_at = now() where key = b.key;
      continue;
    end if;
    if b.condition = 'full' and n < b.total_spots then continue; end if;
    v_left := greatest(b.total_spots - n, 0);
    v_body := replace(b.body, '{left}', v_left::text);
    v_subj := replace(coalesce(b.subject, ''), '{left}', v_left::text);
    v_cnt := 0;
    for t in select * from public.alert_blast_targets(b.key) limit 5 loop
      begin
        v_req := public.send_sms_ssodaa(t.phone,
          v_body || E'\n\n알림 그만받기\nchallenge.samuraihabits.com/off?id=' || t.alert_id,
          nullif(v_subj, ''));
      exception when others then v_req := null;
      end;
      insert into public.alert_blast_sends (blast_key, phone8, alert_id, req_id) values (b.key, t.phone8, t.alert_id, v_req)
        on conflict do nothing;
      v_cnt := v_cnt + 1;
    end loop;
    if v_cnt = 0 then
      update public.alert_blasts set status = 'done', finished_at = now() where key = b.key;
    elsif b.status = 'waiting' then
      update public.alert_blasts set status = 'sending', started_at = now() where key = b.key;
    end if;
  end loop;
end;
$$;
revoke all on function public.process_alert_blasts() from public, anon, authenticated;
revoke all on function public.alert_blast_targets(text) from public, anon, authenticated;

select cron.unschedule('alert-blasts') where exists (select 1 from cron.job where jobname = 'alert-blasts');
select cron.schedule('alert-blasts', '* * * * *', 'select public.process_alert_blasts()');
