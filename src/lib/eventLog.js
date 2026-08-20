// 랜딩 → 지원서 퍼널 이벤트 기록.
//
// Vercel Analytics(track)와 별개로 우리 DB(landing_events)에도 쌓는다.
//   - Vercel 맞춤 이벤트는 플랜에 따라 조회가 막히고, 퍼널을 원하는 모양으로 못 본다
//   - 우리 DB에 있으면 /stats 대시보드에서 마음대로 집계할 수 있다
//
// 개인정보는 담지 않는다. 세션 단위 무작위 id만 붙여서 "몇 명이" 를 셀 수 있게 한다.
import { supabase } from './applyApi';
import { ACTIVE } from '../data/activeCohort';

const SESSION_KEY = 'ttr_sid';

function sessionId() {
  try {
    let v = sessionStorage.getItem(SESSION_KEY);
    if (!v) {
      v = (crypto.randomUUID?.() || String(Math.random()).slice(2) + Date.now());
      sessionStorage.setItem(SESSION_KEY, v);
    }
    return v;
  } catch {
    return 'no-storage';
  }
}

// 같은 세션에서 중복으로 찍히면 안 되는 이벤트(방문·지원서 진입)를 한 번만 보내기 위한 표식.
export function once(key) {
  try {
    const k = `ttr_once_${key}`;
    if (sessionStorage.getItem(k)) return false;
    sessionStorage.setItem(k, '1');
    return true;
  } catch {
    return true;
  }
}

// 실패해도 사용자 흐름을 막지 않는다 — 기록은 어디까지나 부가 기능.
// insert에 .select()를 붙이면 RLS(읽기 차단)에 걸리므로 절대 붙이지 말 것.
export function logEvent(event, extra = {}) {
  try {
    const payload = {
      session_id: sessionId(),
      event,
      cohort_code: ACTIVE.cohortCode,
      path: typeof location !== 'undefined' ? location.pathname : null,
      referrer: typeof document !== 'undefined' ? (document.referrer || null) : null,
      ...extra,
    };
    supabase.from('landing_events').insert(payload).then(
      () => {},
      () => {}
    );
  } catch {
    /* ignore */
  }
}
