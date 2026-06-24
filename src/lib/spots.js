// 모집 정원(30명) 대비 남은 자리 계산 — Hero/Live/Urgency에서 공유.
// 신청자수(count)는 listApplicantsPublic의 전체 코호트 카운트 기준.
import { COHORT2 } from '../data/config2';

export const TOTAL_SPOTS = COHORT2.totalSpots;

// count → { remaining, low, full }. count 미정(null)이면 null 반환.
//   low  : 0 < remaining < 10  (10자리 미만 남음 → 오렌지 강조)
//   full : remaining === 0     (정원 마감)
// 미리보기 스위치: URL ?spots=N 으로 신청자수를 강제 (마감/임박 화면 직접 확인·수정용).
// 파라미터 없으면 실데이터 그대로. 배지 "N명 지원 중"과 "남은 자리"가 같은 값을 쓰도록 공통 적용.
// 예) ?spots=30 → 정원 마감, ?spots=25 → 5자리(오렌지 강조)
export function previewCount(count) {
  if (typeof window !== 'undefined') {
    const o = new URLSearchParams(window.location.search).get('spots');
    if (o != null && o !== '') return Number(o);
  }
  return count;
}

// "마감 임박"(게이지 강조) 표시 시작 임계값 — 남은 자리 이하일 때.
// 9자리(30%) 같은 이른 시점엔 "임박"이 양치기라 효과 약함 → 진짜 막판에만.
export const LOW_THRESHOLD = 9;

export function spotsInfo(count) {
  count = previewCount(count);
  if (count == null) return null;
  const remaining = Math.max(0, TOTAL_SPOTS - count);
  return {
    remaining,
    filled: TOTAL_SPOTS - remaining,        // 게이지 채움(=신청 인원, 정원 상한)
    low: remaining > 0 && remaining <= LOW_THRESHOLD,
    full: remaining === 0,
  };
}
