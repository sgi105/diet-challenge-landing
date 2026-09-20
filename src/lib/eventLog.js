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

// 유입 꼬리표(utm) — 첫 진입 URL에서 한 번 읽어 세션 동안 유지한다.
// 랜딩 → /apply 로 이동하면 URL에서 utm이 사라지므로 저장해둬야 지원서 이벤트에도 붙는다.
const UTM_KEY = 'ttr_utm';
export function utm() {
  try {
    const saved = sessionStorage.getItem(UTM_KEY);
    if (saved) return JSON.parse(saved);
    const q = new URLSearchParams(location.search);
    const v = {
      utm_source: q.get('utm_source'),
      utm_medium: q.get('utm_medium'),
      utm_campaign: q.get('utm_campaign'),
    };
    sessionStorage.setItem(UTM_KEY, JSON.stringify(v));
    return v;
  } catch {
    return {};
  }
}

// 인앱 브라우저 — 카톡 단톡방 링크는 referrer가 비어서 "직접 유입"과 구분이 안 된다.
// user agent로 어느 앱 안에서 열었는지 판별한다.
function inApp() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/KAKAOTALK/i.test(ua)) return 'kakaotalk';
  if (/Instagram/i.test(ua)) return 'instagram';
  if (/FBAN|FBAV/i.test(ua)) return 'facebook';
  if (/NAVER/i.test(ua)) return 'naver';
  if (/Threads/i.test(ua)) return 'threads';
  return null;
}

// 우리(운영자·자동화)가 들어간 방문은 아예 기록하지 않는다.
// 통계에 테스트 방문이 섞이면 전환율·이탈률이 전부 틀어지기 때문.
//   ① 로컬 개발 서버          ② Vercel 미리보기 주소(운영 도메인만 집계)
//   ③ 자동화 브라우저(스샷·점검)  ④ 내 기기에서 켜둔 제외 스위치
// 스위치: 주소 끝에 ?notrack=1 을 붙여 한 번 열면 그 브라우저는 계속 제외된다(?notrack=0 으로 해제).
const NOTRACK_KEY = 'ttr_notrack';

function isDevHost() {
  try {
    const h = location.hostname;
    return /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(h) || h.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function isBot() {
  try {
    if (navigator.webdriver) return true; // playwright·puppeteer 등 자동화 브라우저
    return /HeadlessChrome|Playwright|puppeteer|bot|crawler|spider|lighthouse/i.test(navigator.userAgent);
  } catch {
    return false;
  }
}

function isOptedOut() {
  try {
    const q = new URLSearchParams(location.search).get('notrack');
    if (q === '0') localStorage.removeItem(NOTRACK_KEY);
    else if (q != null) localStorage.setItem(NOTRACK_KEY, '1');
    return localStorage.getItem(NOTRACK_KEY) === '1';
  } catch {
    return false;
  }
}

export function skipTracking() {
  return isDevHost() || isBot() || isOptedOut();
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
    if (skipTracking()) return;
    const payload = {
      session_id: sessionId(),
      event,
      cohort_code: ACTIVE.cohortCode,
      path: typeof location !== 'undefined' ? location.pathname : null,
      referrer: typeof document !== 'undefined' ? (document.referrer || null) : null,
      in_app: inApp(),
      ...utm(),
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
