// 메타(페이스북) 픽셀 — 광고 전환 추적.
//
// 퍼널 매핑:
//   랜딩/모든 화면 진입  → PageView        (라우트 바뀔 때마다. SPA라 기본 스니펫은 첫 로드만 잡음)
//   지원하기 CTA 클릭   → ViewContent
//   지원서 첫 진입      → InitiateCheckout
//   지원서 제출 성공    → Lead            ← 광고 최적화 목표
//   마감 후 대기명단 제출 → WaitlistLead(맞춤) — Lead와 섞이면 모집 끝난 뒤 성과가 부풀어 보임
//
// 제출 이벤트는 브라우저(픽셀) + 서버(Edge Function meta-capi) 양쪽으로 보낸다.
// 같은 event_id를 붙여서 메타가 한 건으로 합친다(중복 제거). 서버 쪽은 광고 차단·iOS 추적 차단에도 안 빠진다.
//
// META_PIXEL_ID가 비어 있으면 스크립트 로드부터 전부 no-op.
import { supabase } from './applyApi';

// 픽셀 ID는 공개값(페이지 소스에 그대로 보임). 메타 이벤트 관리자 → 데이터 소스에서 확인.
export const META_PIXEL_ID = '1800035934531489';

let initialized = false;

function enabled() {
  return typeof window !== 'undefined' && !!META_PIXEL_ID;
}

export function initMetaPixel() {
  if (!enabled() || initialized) return;
  initialized = true;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', META_PIXEL_ID);
}

// 기록은 부가 기능 — 실패해도 사용자 흐름을 막지 않는다.
export function metaTrack(event, params = {}, { eventId, custom = false } = {}) {
  if (!enabled()) return;
  try {
    initMetaPixel();
    const opts = eventId ? { eventID: eventId } : undefined;
    window.fbq(custom ? 'trackCustom' : 'track', event, params, opts);
  } catch {
    /* ignore */
  }
}

function readCookie(name) {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

function newEventId() {
  return crypto.randomUUID?.() || `${Date.now()}-${String(Math.random()).slice(2)}`;
}

// 전화번호를 매칭 키로 보낼지. 원문이 아니라 서버에서 해시한 값만 나간다.
// 끄면 쿠키(_fbp/_fbc)와 접속 정보만 가고, 매칭 정확도가 떨어진다.
const SEND_HASHED_PHONE = true;

// 지원서 제출 성공 시 1회 호출. 픽셀 + 서버 전송을 같은 event_id로 묶는다.
export function metaTrackApplication({ phone, phoneCountry, waitlist, isReferral }) {
  if (!enabled()) return;
  const eventId = newEventId();
  const event = waitlist ? 'WaitlistLead' : 'Lead';
  const params = { content_name: waitlist ? 'waitlist' : (isReferral ? 'apply_referral' : 'apply') };
  metaTrack(event, params, { eventId, custom: waitlist });

  try {
    supabase.functions.invoke('meta-capi', {
      body: {
        event_name: event,
        event_id: eventId,
        event_source_url: location.href,
        phone: SEND_HASHED_PHONE ? phone : null,
        phone_country: SEND_HASHED_PHONE ? phoneCountry : null,
        fbp: readCookie('_fbp'),
        fbc: readCookie('_fbc'),
        custom_data: params,
      },
    }).then(() => {}, () => {});
  } catch {
    /* ignore */
  }
}
