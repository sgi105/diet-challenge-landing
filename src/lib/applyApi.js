// Supabase 직접 호출 — vercel serverless 의존성 제거.
// applications INSERT 시 DB 트리거가 Edge Function(notify-new-applicant)을 호출해 Telegram 알림 발송.
// 친구 매칭은 motivation 끝에 인라인으로 붙어 들어감 (attachFriend 폐기).
//
// 필요한 env (.env.local):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js';
import { ACTIVE } from '../data/activeCohort';
import { PACE_GOAL_VALUE, partsToSec } from '../data/applicationGoals';
import { utm } from './eventLog';
import { heroVariant } from './abTest';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 현재 액티브 코호트 = activeCohort.js의 ACTIVE.cohortCode. 신규 신청은 이 코호트로 태깅된다.
export const CURRENT_COHORT_CODE = ACTIVE.cohortCode;

// 신청자수 캐시 — 재방문/새로고침 시 게이지를 즉시 렌더(stale-while-revalidate). fetch 끝나면 갱신.
// 기수별로 키를 분리한다 — 안 그러면 지난 기수 신청자수가 새 기수 게이지에 잠깐 뜬다.
const COUNT_CACHE_KEY = `ttr_count_${ACTIVE.cohortCode}`;
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

function pickUtm() {
  const u = utm() || {};
  const clip = (v) => (typeof v === 'string' && v ? v.slice(0, 200) : null);
  return { utm_source: clip(u.utm_source), utm_medium: clip(u.utm_medium), utm_campaign: clip(u.utm_campaign) };
}

function readCookie(name) {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

// id 를 브라우저에서 만들어 넣는다 — anon 은 RETURNING(SELECT) 권한이 없어서 INSERT 후 id 를 못 받는다.
// 참가비 결제가 이 id 를 페이앱 var1 로 실어 보내고, 결제 통보가 이 행을 찾아 결제 완료로 바꾼다.
export async function submitApplication(form, { waitlist = false, backdoor = false, id = null } = {}) {
  const appId = id || crypto.randomUUID();
  let motivation = combineMotivationWithFriend(form.motivation, form.friend);
  // 마감(데드라인/정원) 후 접수분은 대기명단으로 태깅 — 코치 신청서 탭 동기 필드에 그대로 노출.
  if (waitlist) motivation = `[대기명단] ${motivation}`.slice(0, 2000);
  // 마감 뒤 결원 충원 링크(/apply?pass=…)로 들어온 접수분 — 정상 접수지만 구분은 필요하다.
  // 보증금 카드결제 기수는 '[추가 모집]' 꼬리표 — notify-new-applicant 는 '[결원 충원]'으로 시작하는 지원서에만
  // 옛 안내 문자(보증금 10만원 계좌 입금)를 보내므로, 꼬리표를 바꿔 그 문자를 끈다(가인 2026-10-23 A안).
  // 결제자 안내는 결제 완료 화면의 "10/25(일) 저녁 단톡방 초대"로 충분.
  else if (backdoor) motivation = `${ACTIVE.fee ? '[추가 모집]' : '[결원 충원]'} ${motivation}`.slice(0, 2000);
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
    // 단기(21일) 목표 — 'pr_5k'면 현재 5K 기록도 함께. 시간은 전부 정수 초로 저장.
    short_goal: form.shortGoal || null,
    current_5k_sec: form.shortGoal === 'pr_5k' ? partsToSec(form.current5k || {}) : null,
    // 최종 목표가 기록 단축일 때만 거리·목표기록이 붙는다.
    target_distance: goals.includes(PACE_GOAL_VALUE) ? (form.targetDistance || null) : null,
    target_time_sec: goals.includes(PACE_GOAL_VALUE) ? partsToSec(form.targetTime || {}) : null,
    // OT 참석 가능 여부 — 불참이면 팀 랜덤 배정 대상.
    ot_attend: form.otAttend || null,
    // 시즌6 프리프레이밍 질문 — 원하는 몸을 못 만든 이유(consistency|fun|method|motivation).
    fail_reason: form.failReason || null,
    // 유입 꼬리표 — 어느 광고/링크로 와서 지원했는지. 메타 광고는 utm_campaign = 광고 이름.
    ...pickUtm(),
    // 어느 첫 화면(A/B)을 보고 지원했는지 — /stats A/B 비교용 (abTest.js)
    hero_variant: heroVariant(),
    id: appId,
    // 결제 통보는 페이앱 서버에서 오니까 메타 매칭용 쿠키·브라우저 정보를 지금 받아 둔다.
    meta_fbp: readCookie('_fbp'),
    meta_fbc: readCookie('_fbc'),
    client_ua: (navigator.userAgent || '').slice(0, 400) || null,
  };

  const { error } = await supabase.from('applications').insert(payload);
  if (error) {
    throw new Error(`제출 실패: ${error.message}`);
  }
  return { id: appId };
}

// 결제 완료 화면용 — 지원서 결제 상태만 조회(개인정보 X).
export async function fetchPayStatus(id) {
  const { data, error } = await supabase.rpc('application_pay_status', { p_id: id });
  if (error) throw new Error(error.message);
  return Array.isArray(data) ? (data[0] || null) : data;
}

// 이 번호로 이번 기수 결제가 끝난 지원서가 있으면 그 id, 없으면 null — 다른 브라우저·경로로 다시 온 결제자 잡기(2026-10-26).
export async function findPaidByPhone(cohortCode, phone) {
  const { data, error } = await supabase.rpc('application_paid_by_phone', { p_cohort: cohortCode, p_phone: phone });
  if (error) throw new Error(error.message);
  return data || null;
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
