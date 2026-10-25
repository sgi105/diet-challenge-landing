-- 결제 완료 확인 문자 자동 발송 — 쏘다(ssodaa) API를 DB(pg_net)에서 호출.
-- 엣지 함수는 출구 IP가 매번 바뀌어 쏘다 토큰 IP 제한에 걸린다 → DB 고정 출구 IP(3.38.70.78) 전용 토큰 사용.
-- 키는 vault: ssodaa_base_url / ssodaa_api_key / ssodaa_db_token_key / ssodaa_send_phone (값은 파일에 없음).
-- 문구 정본 = coach_msg_templates 'paid_confirm' ({name_voc} 치환). 2026-10-25.

alter table public.applications add column if not exists confirm_sms_at timestamptz;
alter table public.applications add column if not exists confirm_sms_req bigint; -- net._http_response 대조용

-- 쏘다 문자 1건 발송 → pg_net 요청 id 반환(비동기). 응답은 net._http_response 에서 code='200' 확인.
create or replace function public.send_sms_ssodaa(p_to text, p_text text, p_subject text default null)
returns bigint
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_base text; v_key text; v_token text; v_from text;
begin
  select decrypted_secret into v_base from vault.decrypted_secrets where name = 'ssodaa_base_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'ssodaa_api_key';
  select decrypted_secret into v_token from vault.decrypted_secrets where name = 'ssodaa_db_token_key';
  select decrypted_secret into v_from from vault.decrypted_secrets where name = 'ssodaa_send_phone';
  return net.http_post(
    url := v_base || '/sms/send/sms',
    headers := jsonb_build_object('x-api-key', v_key, 'Content-Type', 'application/json'),
    body := jsonb_strip_nulls(jsonb_build_object(
      'token_key', v_token, 'msg_type', 'sms',
      'dest_phone', regexp_replace(p_to, '\D', '', 'g'),
      'send_phone', v_from, 'msg_body', p_text, 'subject', p_subject)),
    timeout_milliseconds := 15000
  );
end;
$$;
revoke all on function public.send_sms_ssodaa(text, text, text) from public, anon, authenticated;

-- 호칭: 한글 3글자면 성 빼고, 받침 있으면 +아 / 없으면 +야. 한글 이름 아니면 ''.
create or replace function public.name_vocative(p_name text)
returns text
language sql
immutable
as $$
  with n as (select btrim(coalesce(p_name, '')) as s),
       g as (select case when s ~ '^[가-힣]{3}$' then substr(s, 2) else s end as s from n where s ~ '^[가-힣]+$')
  select coalesce(
    (select s || case when (ascii(right(s, 1)) - 44032) % 28 = 0 then '야' else '아' end from g),
    '')
$$;

-- 결제 완료로 바뀌는 순간 확인 문자. 결제 반영(UPDATE)은 어떤 경우에도 실패시키지 않는다.
create or replace function public.trg_paid_confirm_sms()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_tpl text; v_voc text; v_msg text; v_req bigint;
begin
  if new.confirm_sms_at is not null then return new; end if;
  if coalesce(new.pay_raw ->> 'userid', '') = 'payapptest' then return new; end if;
  -- 같은 번호로 이미 결제 완료된 다른 지원서가 있으면(중복 결제) 보내지 않는다.
  if exists (
    select 1 from public.applications o
    where o.id <> new.id and o.cohort_code = new.cohort_code and o.pay_state = 'paid'
      and right(regexp_replace(o.phone, '\D', '', 'g'), 8) = right(regexp_replace(new.phone, '\D', '', 'g'), 8)
  ) then return new; end if;

  select body into v_tpl from public.coach_msg_templates where key = 'paid_confirm';
  if v_tpl is null then return new; end if;
  v_voc := public.name_vocative(new.name);
  v_msg := case when v_voc = '' then replace(replace(v_tpl, '{name_voc} 안녕!', '안녕!'), '{name_voc}', '')
                else replace(v_tpl, '{name_voc}', v_voc) end;
  v_req := public.send_sms_ssodaa(new.phone, v_msg, '90일 하프마라톤 챌린지');
  new.confirm_sms_at := now();
  new.confirm_sms_req := v_req;
  return new;
exception when others then
  return new;
end;
$$;

drop trigger if exists paid_confirm_sms on public.applications;
create trigger paid_confirm_sms
  before update of pay_state on public.applications
  for each row
  when (old.pay_state is distinct from 'paid' and new.pay_state = 'paid')
  execute function public.trg_paid_confirm_sms();
