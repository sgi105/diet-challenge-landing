import { useEffect, useState } from 'react';
import { COHORT4 } from '../data/season4';
import { useApplicantCount } from './useApplicantCount';
import { spotsInfo } from '../lib/spots';

// 시즌4 3단계 상태머신.
//   upcoming — 오픈 대기 (지금 ~ 8/19 08:00) · 카운트다운만, 신청 버튼 잠김
//   official — 모집 중 (8/19 08:00 ~ 8/22 14:00) · 선착순 30명 + 지원서 심사
//   closed   — 마감 (8/22 14:00~) · 결원 대기 명단
function compute() {
  const now = Date.now();
  if (now < new Date(COHORT4.officialOpen).getTime()) return 'upcoming';
  if (now < new Date(COHORT4.officialDeadline).getTime()) return 'official';
  return 'closed';
}

export function useSeason4Status() {
  const [status, setStatus] = useState(compute);

  useEffect(() => {
    if (status === 'closed') return;
    // 오픈/마감 경계 전환 즉시 반영 — 1초 단위 체크
    const t = setInterval(() => {
      const next = compute();
      setStatus((prev) => (prev === next ? prev : next));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  // 정원 마감 시 자동 closed — 날짜 마감과 별개로 30명 다 차면 결원 대기 모드.
  // (?spots=30 미리보기도 동일하게 closed가 되어 마감 화면 확인 가능)
  const count = useApplicantCount(status === 'official', COHORT4.cohortCode);
  if (spotsInfo(count)?.full) return 'closed';

  return status;
}

// 시즌4는 사전신청 전형이 따로 없음 — 전부 일반 지원 폼.
export function applyPathForStatus4() {
  return '/apply';
}

// 단계별 카피 — 배너 / CTA 버튼 / 보조문구.
// 시기에 따라 ① 상단 배너, ② CTA 문구, ③ 마감 문구만 교체. 본문은 그대로.
export const COPY4 = {
  upcoming: {
    banner: '🟧 8/19(수) 아침 8시 모집 오픈 — 곧 시작',
    // 버튼 본문에 이미 오픈 시각이 들어가므로 보조문구는 정원·기간으로
    ctaSub: '선착순 30명 · 21일 러닝',
    cta: {
      hero: '🔒 8/19(수) 08:00 오픈',
      pricing: '🔒 8/19(수) 08:00 오픈',
      final: '🔒 8/19(수) 08:00 오픈',
      sticky: '🔒 8/19 08:00 오픈',
    },
    stickySub: '선착순 30명 모집',
  },
  official: {
    banner: '🔴 모집 중 · 8/22(토) 오후 2시 마감 · 선착순 30명',
    ctaSub: '8/22(토) 오후 2시 마감',
    cta: {
      hero: '지원하기',
      pricing: '지원하기',
      final: '지원하기',
      sticky: '지원하기',
    },
    stickySub: '8/22(토) 오후 2시 마감',
  },
  closed: {
    banner: '⏰ 모집 마감 · 결원 대기 명단 받는 중 →',
    ctaSub: '결원 생기면 대기 순서대로 연락',
    cta: {
      hero: '결원 대기 명단 신청',
      pricing: '결원 대기 명단 신청',
      final: '결원 대기 명단 신청',
      sticky: '결원 대기 명단 신청',
    },
    stickySub: '결원 생기면 대기 순서대로 연락',
  },
};
