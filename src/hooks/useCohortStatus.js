import { useEffect, useState } from 'react';
import { COHORT } from '../data/config';

function getDeadline(variant) {
  return variant === 'referral' ? COHORT.referralDeadline : COHORT.deadline;
}

function compute(variant) {
  const now = Date.now();
  const openAt = new Date(COHORT.applyOpenAt).getTime();
  const deadline = new Date(getDeadline(variant)).getTime();
  if (now < openAt) return 'preopen';
  if (now < deadline) return 'open';
  return 'closed';
}

export function useCohortStatus(variant = 'main') {
  const [status, setStatus] = useState(() => compute(variant));

  useEffect(() => {
    if (status === 'closed') return;
    // preopen 윈도우는 짧을 수 있어 1초 단위로 체크 — open/closed 전환 즉시 반영
    const t = setInterval(() => {
      const next = compute(variant);
      setStatus((prev) => (prev === next ? prev : next));
    }, 1000);
    return () => clearInterval(t);
  }, [status, variant]);

  return status;
}

export const COPY = {
  preopen: {
    banner: '🕒 시즌 1 오픈 임박 · 5/25(월) 18:00 · 선착순 30명',
    ctaSub: '5/25(월) 18:00 오픈 · 선착순 30명',
    cta: {
      hero: '지원하기',
      pricing: '지원하기',
      final: '지원하기',
      sticky: '지원하기',
    },
    stickySub: '6/1(월) 시작 · 30명 한정',
  },
  open: {
    banner: '🟢 시즌 1 신청 마감 5/28(목) 24:00 → 6/1(월) 시작',
    ctaSub: '5/28(목) 24:00 마감 · 2분 소요',
    cta: {
      hero: '지원하기',
      pricing: '지원하기',
      final: '지원하기',
      sticky: '지원하기',
    },
    stickySub: '5/28(목) 24:00 마감',
  },
  closed: {
    banner: '⏰ 시즌 1 신청 마감 · 다음 기수 알림 →',
    cta: {
      hero: '지원하기',
      pricing: '지원하기',
      final: '지원하기',
      sticky: '지원하기',
    },
    ctaSub: '정원 마감 · 결원 발생 시 우선 검토',
    stickySub: '결원 발생 시 우선 검토',
  },
};

export const COPY_REFERRAL = {
  preopen: {
    banner: '🟧 초대 전용 · 5/25(월) 18:00 오픈 · 추천인 이름 필수',
    ctaSub: '5/25(월) 18:00 오픈 · 선착순 30명',
    cta: {
      hero: '지원하기',
      pricing: '지원하기',
      final: '지원하기',
      sticky: '지원하기',
    },
    stickySub: '6/1(월) 시작 · 30명 한정',
  },
  open: {
    banner: '🟧 초대 전용 · 5/28(목) 24:00 마감 · 추천인 이름 필수 →',
    ctaSub: '5/28(목) 24:00 마감 · 추천인 이름 입력 필수',
    cta: {
      hero: '초대 전형으로 지원하기',
      pricing: '초대 전형으로 지원하기',
      final: '초대 전형으로 지원하기',
      sticky: '초대 전형으로 지원하기',
    },
    stickySub: '5/28(목) 24:00 마감',
  },
  closed: {
    banner: '⏰ 초대 전형 마감 · 대기자 등록 →',
    ctaSub: '정원 마감 · 결원 발생 시 우선 검토',
    cta: {
      hero: '대기자 등록',
      pricing: '대기자 등록',
      final: '대기자 등록',
      sticky: '대기자 등록',
    },
    stickySub: '결원 발생 시 우선 검토',
  },
};
