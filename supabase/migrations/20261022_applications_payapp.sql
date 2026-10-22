-- 지원서 참가비 카드 결제(페이앱) — 결제 상태를 지원서 행에 같이 기록한다.
-- 기존 paid / paid_at 은 그대로 재사용(코치 화면이 이미 본다). 여기선 페이앱 쪽 식별자·상태만 추가.
--
-- 흐름: 랜딩이 지원서 id를 직접 만들어 INSERT → 페이앱 결제창(var1 = 지원서 id)
--       → 페이앱이 Edge Function payapp-feedback 으로 결과 통보 → 이 칸들 갱신 + 메타 Purchase 전송.

alter table public.applications
  add column if not exists pay_state   text,         -- requested | paid | cancelled | partial_cancelled
  add column if not exists pay_mul_no  text,         -- 페이앱 결제번호(mul_no). 취소·대조용
  add column if not exists pay_amount  integer,
  add column if not exists pay_type    text,         -- 페이앱 pay_type 코드 원문
  add column if not exists pay_raw     jsonb,        -- 마지막 통보 원문(디버깅용)
  add column if not exists meta_fbp    text,         -- 메타 서버 전송 매칭용 쿠키. 결제 통보는 페이앱 서버에서 오니까 미리 받아 둔다
  add column if not exists meta_fbc    text,
  add column if not exists client_ua   text;

create unique index if not exists applications_pay_mul_no_key
  on public.applications (pay_mul_no) where pay_mul_no is not null;

-- 결제 완료 화면이 "결제 반영됐는지"만 확인하는 창구. anon 은 applications SELECT 권한이 없다.
-- 지원서 id(UUID)를 아는 사람만 조회 가능하고, 결제 상태 외 개인정보는 돌려주지 않는다.
create or replace function public.application_pay_status(p_id uuid)
returns table (pay_state text, pay_mul_no text, pay_amount integer)
language sql
security definer
set search_path = public
as $$
  select a.pay_state, a.pay_mul_no, a.pay_amount
  from public.applications a
  where a.id = p_id;
$$;

revoke all on function public.application_pay_status(uuid) from public;
grant execute on function public.application_pay_status(uuid) to anon, authenticated;
