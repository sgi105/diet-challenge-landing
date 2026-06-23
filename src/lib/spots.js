// 모집 정원(30명) 대비 남은 자리 계산 — Hero/Live/Urgency에서 공유.
// 신청자수(count)는 listApplicantsPublic의 전체 코호트 카운트 기준.
import { COHORT2 } from '../data/config2';

export const TOTAL_SPOTS = COHORT2.totalSpots;

// count → { remaining, low, full }. count 미정(null)이면 null 반환.
//   low  : 0 < remaining < 10  (10자리 미만 남음 → 오렌지 강조)
//   full : remaining === 0     (정원 마감)
export function spotsInfo(count) {
  if (count == null) return null;
  const remaining = Math.max(0, TOTAL_SPOTS - count);
  return {
    remaining,
    low: remaining > 0 && remaining < 10,
    full: remaining === 0,
  };
}
