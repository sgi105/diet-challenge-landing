import { useEffect, useState } from 'react';
import { COHORT2 } from '../data/config2';

// 시즌2 3단계 상태머신.
//   prereg    — 지인 추천 사전신청 (지금 ~ 6/21 자정)
//   interlude — 막간 (6/22) · 정식 모집 오픈 대기
//   official  — 정식 모집 (6/23 ~ 6/25) · 선착순 30명
//   closed    — 마감 (6/26~) · 결원 대기 명단
function compute() {
  const now = Date.now();
  if (now < new Date(COHORT2.preRegEnd).getTime()) return 'prereg';
  if (now < new Date(COHORT2.officialOpen).getTime()) return 'interlude';
  if (now < new Date(COHORT2.officialDeadline).getTime()) return 'official';
  return 'closed';
}

export function useSeason2Status() {
  const [status, setStatus] = useState(compute);

  useEffect(() => {
    if (status === 'closed') return;
    // 자정 경계 전환 즉시 반영 — 1초 단위 체크
    const t = setInterval(() => {
      const next = compute();
      setStatus((prev) => (prev === next ? prev : next));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  return status;
}

// CTA가 향하는 신청 폼 경로. 사전신청은 추천인 전형(폼에 추천인 항목), 정식은 일반.
export function applyPathForStatus(status) {
  if (status === 'prereg') return '/apply?type=referral';
  return '/apply';
}

// 단계별 카피 — 배너 / CTA 버튼 / 보조문구.
// 시기에 따라 ① 상단 배너, ② CTA 문구, ③ 마감·일정 문구만 교체. 본문은 그대로.
export const COPY2 = {
  prereg: {
    banner: '🟢 지인 추천 사전신청 받는 중 · 6/21(일) 자정 마감',
    ctaSub: '정식 모집(6/23)보다 먼저 · 자정 마감',
    cta: {
      hero: '지인 추천 사전신청하기',
      pricing: '지인 추천 사전신청하기',
      final: '지인 추천 사전신청하기',
      sticky: '지인 추천 사전신청',
    },
    stickySub: '6/21(일) 자정 마감',
  },
  interlude: {
    banner: '🟧 사전신청 마감 · 정식 모집 6/23(화) 오픈',
    ctaSub: '6/23(화) 정식 모집 오픈',
    cta: {
      hero: '6/23(화) 오픈 알림',
      pricing: '6/23(화) 오픈 알림',
      final: '6/23(화) 오픈 알림',
      sticky: '6/23(화) 오픈',
    },
    stickySub: '곧 열려 · 6/23(화) 오픈',
  },
  official: {
    banner: '🔴 정식 모집 중 · 6/25(목) 마감 · 선착순 30명',
    ctaSub: '6/25(목) 23:59 마감 · 2분 소요',
    cta: {
      hero: '지금 신청하기',
      pricing: '지금 신청하기',
      final: '지금 신청하기',
      sticky: '지금 신청하기',
    },
    stickySub: '6/25(목) 23:59 마감',
  },
  closed: {
    banner: '⏰ 정식 모집 마감 · 결원 대기 명단 →',
    ctaSub: '대기 명단 · 결원 시 우선 검토',
    cta: {
      hero: '결원 대기 명단에 이름 올리기',
      pricing: '결원 대기 명단에 이름 올리기',
      final: '결원 대기 명단에 이름 올리기',
      sticky: '결원 대기 명단 등록',
    },
    stickySub: '결원 발생 시 우선 검토',
  },
};
