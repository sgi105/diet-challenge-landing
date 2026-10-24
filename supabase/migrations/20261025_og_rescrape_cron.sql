-- 링크 미리보기 자동 갱신: 10분마다 랜딩 og:image 주소를 보고 바뀌었으면 메타 scrape 요청(og-rescrape 엣지 함수).
-- 기록 = coach_settings key 'landing_og_last'. 2026-10-25 적용.
select cron.schedule('landing-og-rescrape', '*/10 * * * *', $$
  select net.http_post(
    url := 'https://arjkkooducikmpjeudnc.supabase.co/functions/v1/og-rescrape',
    headers := public.internal_edge_headers(),
    body := '{}'::jsonb,
    timeout_milliseconds := 30000)
$$);
