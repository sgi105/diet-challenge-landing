-- 새 지원자 텔레그램 알림을 결제 기수에선 "결제 완료" 때만(가인 2026-10-26).
-- 결제 기수 지원서는 pay_state='pending' 으로 들어온다(applyApi) → INSERT 때는 건너뛰고,
-- pay_state 가 'paid' 로 바뀌는 순간 같은 알림 함수를 부른다. 무료 기수(pay_state null)는 예전처럼 INSERT 때.
drop trigger if exists applications_notify on public.applications;
create trigger applications_notify
  after insert on public.applications
  for each row
  when (new.pay_state is null)
  execute function public.trigger_notify_new_applicant();

drop trigger if exists applications_notify_paid on public.applications;
create trigger applications_notify_paid
  after update of pay_state on public.applications
  for each row
  when (old.pay_state is distinct from 'paid' and new.pay_state = 'paid')
  execute function public.trigger_notify_new_applicant();
