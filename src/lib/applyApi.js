// Supabase 직접 호출 — vercel serverless 의존성 제거.
// applications INSERT 시 DB 트리거가 Edge Function(notify-new-applicant)을 호출해 Telegram 알림 발송.
// 친구 매칭은 motivation 끝에 인라인으로 붙어 들어감 (attachFriend 폐기).
//
// 필요한 env (.env.local):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const CURRENT_COHORT_CODE = '260629_team_run';

// 신청자수 캐시 — 재방문/새로고침 시 게이지를 즉시 렌더(stale-while-revalidate). fetch 끝나면 갱신.
const COUNT_CACHE_KEY = 'ttr_count_260629';
export function getCachedCount() {
  try { const v = localStorage.getItem(COUNT_CACHE_KEY); return v != null && v !== '' ? Number(v) : null; } catch { return null; }
}
function cacheCount(n) {
  try { if (n != null) localStorage.setItem(COUNT_CACHE_KEY, String(n)); } catch { /* ignore */ }
}

// count만 필요한 곳(Hero/Urgency)용 경량 호출 — 목록(list) RPC를 안 기다려서 빠름.
export async function countApplicantsPublic(cohortCode = CURRENT_COHORT_CODE) {
  const { data, error } = await supabase.rpc('count_applicants_public', { p_cohort: cohortCode });
  if (error) throw new Error(`지원자 수 조회 실패: ${error.message}`);
  const n = Number(data) || 0;
  cacheCount(n);
  return n;
}

function combineMotivationWithFriend(motivation, friend) {
  const base = (motivation || '').trim();
  const f = (friend || '').trim();
  if (!f) return base;
  const tail = `\n\n[같이 지원한 친구] ${f}`;
  return (base + tail).slice(0, 2000);
}

export async function submitApplication(form) {
  const motivation = combineMotivationWithFriend(form.motivation, form.friend);
  const goals = Array.isArray(form.goals) ? form.goals.slice(0, 5) : [];
  const goalsOther = form.goalsOther?.trim().slice(0, 500) || null;
  const payload = {
    name: form.name.trim().slice(0, 50),
    age: parseInt(form.age, 10),
    gender: form.gender === 'M' || form.gender === 'F' ? form.gender : null,
    phone: form.phone.trim().slice(0, 30),
    phone_country: (form.phoneCountry || 'KR').slice(0, 4),
    job: form.job.trim().slice(0, 100),
    region: form.region.trim().slice(0, 100),
    running_exp: String(form.runningExp || '').slice(0, 30),
    motivation,
    goals,
    goals_other: goals.includes('other') ? goalsOther : null,
    instagram: form.instagram?.trim().slice(0, 100) || null,
    kakao_id: form.kakaoId?.trim().slice(0, 50) || null,
    referrer_name: form.referrerName?.trim().slice(0, 50) || null,
    agree_deposit: !!form.agreeDeposit,
    agree_schedule: !!form.agreeSchedule,
    cohort_code: CURRENT_COHORT_CODE,
  };

  // RETURNING은 anon SELECT 권한이 필요해서 사용 X — INSERT만 수행하고 id는 null 반환.
  // id는 done 페이지에서 사용되지 않음.
  const { error } = await supabase.from('applications').insert(payload);
  if (error) {
    throw new Error(`제출 실패: ${error.message}`);
  }
  return { id: null };
}

export async function submitWaitlist({ name, contact, contactType, note }) {
  const payload = {
    name: (name || '').trim().slice(0, 50),
    contact: (contact || '').trim().slice(0, 100),
    contact_type: (contactType || 'instagram').slice(0, 20),
    note: (note || '').trim().slice(0, 500) || null,
  };
  if (!payload.name) throw new Error('이름을 입력해줘.');
  if (!payload.contact) throw new Error('연락처를 입력해줘.');

  const { error } = await supabase.from('waitlist').insert(payload);
  if (error) {
    throw new Error(`사전알림 신청 실패: ${error.message}`);
  }
}

export async function listApplicantsPublic(cohortCode = CURRENT_COHORT_CODE) {
  const [rowsRes, countRes] = await Promise.all([
    supabase.rpc('list_applicants_public', { p_cohort: cohortCode }),
    supabase.rpc('count_applicants_public', { p_cohort: cohortCode }),
  ]);
  if (rowsRes.error) throw new Error(`지원자 조회 실패: ${rowsRes.error.message}`);
  if (countRes.error) throw new Error(`지원자 수 조회 실패: ${countRes.error.message}`);
  const count = Number(countRes.data) || 0;
  cacheCount(count);
  return {
    recent: Array.isArray(rowsRes.data) ? rowsRes.data : [],
    count,
  };
}
