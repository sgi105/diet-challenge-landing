-- 지원서 제출 직전 "이 번호로 이번 기수 결제 끝났나?" 확인 — 이중 결제·중복 지원서 방지.
-- 브라우저 메모(ttr_pending_pay_<기수>)는 그 브라우저에만 남아서, 다른 경로·다른 브라우저로 다시 들어오면 못 잡는다(10/26 권세미).
-- 번호 뒤 8자리 + 기수 코드 + 결제 완료만. 찾으면 그 지원서 id(완료 화면 주소용), 없으면 null. 2026-10-26.
create or replace function public.application_paid_by_phone(p_cohort text, p_phone text)
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
  select a.id
  from public.applications a
  where a.cohort_code = p_cohort
    and a.pay_state = 'paid'
    and length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) >= 8
    and right(regexp_replace(a.phone, '\D', '', 'g'), 8) = right(regexp_replace(p_phone, '\D', '', 'g'), 8)
  order by a.paid_at
  limit 1;
$$;
revoke all on function public.application_paid_by_phone(text, text) from public;
grant execute on function public.application_paid_by_phone(text, text) to anon, authenticated;
