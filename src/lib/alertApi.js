import { supabase } from './applyApi';

// 다음 기수 오픈 알림 신청 — 전화번호 하나만 받는다. (테이블: cohort_alerts, 2026-09-19)
// anon은 INSERT만 가능하고 읽기는 코치 계정만 된다. 공개 대시보드엔 count_cohort_alerts_public 숫자만.

// 유입 꼬리표 — eventLog가 첫 진입 때 sessionStorage에 저장해 둔 utm을 그대로 읽는다.
function savedUtm() {
  try {
    const raw = sessionStorage.getItem('ttr_utm');
    const u = raw ? JSON.parse(raw) : null;
    return {
      utm_source: u?.utm_source?.slice(0, 100) || null,
      utm_medium: u?.utm_medium?.slice(0, 100) || null,
      utm_campaign: u?.utm_campaign?.slice(0, 200) || null,
    };
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  }
}

export async function submitCohortAlert({ phone, phoneCountry, sourceCohort }) {
  const { error } = await supabase.from('cohort_alerts').insert({
    phone: phone.trim().slice(0, 30),
    phone_country: (phoneCountry || 'KR').slice(0, 4),
    consent: true,
    source_cohort: sourceCohort || null,
    ...savedUtm(),
  });
  if (error) throw new Error(`신청 실패: ${error.message}`);
}

export async function countCohortAlertsPublic(cohort = null) {
  const { data, error } = await supabase.rpc('count_cohort_alerts_public', { p_cohort: cohort });
  if (error) throw error;
  return data ?? 0;
}
