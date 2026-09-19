-- 다음 기수 오픈 알림 신청 → 텔레그램 (2026-09-19)
-- 지원서 알림과 같은 엣지 함수(notify-new-applicant)를 kind='cohort_alert' 로 부른다. 실패해도 신청은 저장된다.
create or replace function public.trigger_notify_cohort_alert()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  begin
    perform net.http_post(
      url := 'https://arjkkooducikmpjeudnc.supabase.co/functions/v1/notify-new-applicant',
      headers := public.internal_edge_headers(),
      body := jsonb_build_object('kind', 'cohort_alert', 'record', row_to_json(new)));
  exception when others then
    raise warning 'trigger_notify_cohort_alert 전송 실패: %', sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists cohort_alerts_notify on public.cohort_alerts;
create trigger cohort_alerts_notify
  after insert on public.cohort_alerts
  for each row execute function public.trigger_notify_cohort_alert();
