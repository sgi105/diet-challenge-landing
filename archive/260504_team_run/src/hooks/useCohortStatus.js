import { useEffect, useState } from 'react';
import { COHORT } from '../data/config';

function getDeadline(variant) {
  return variant === 'referral' ? COHORT.referralDeadline : COHORT.deadline;
}

function compute(variant) {
  const now = Date.now();
  const deadline = new Date(getDeadline(variant)).getTime();
  return now < deadline ? 'open' : 'closed';
}

export function useCohortStatus(variant = 'main') {
  const [status, setStatus] = useState(() => compute(variant));

  useEffect(() => {
    if (status === 'closed') return;
    const t = setInterval(() => {
      const next = compute(variant);
      setStatus((prev) => (prev === next ? prev : next));
    }, 30000);
    return () => clearInterval(t);
  }, [status, variant]);

  return status;
}

export const COPY = {
  open: {
    banner: '🟢 시즌 0 지원 마감 D-1 · 4/27(일) 23:59 →',
    ctaSub: '4/27(일) 23:59 마감 · 2분 소요',
    cta: {
      hero: '지원하기',
      pricing: '내 자리 잡기',
      final: '팀에 합류하기',
      sticky: '지원하기',
    },
    stickySub: '4/27(일) 23:59 마감',
  },
  closed: {
    banner: '⏰ 시즌 0 지원 마감 · 후순위 지원 가능 →',
    ctaSub: '정원 마감 · 결원 발생 시 우선 검토',
    cta: {
      hero: '마감 · 후순위 지원하기',
      pricing: '마감 · 후순위 지원하기',
      final: '마감 · 후순위 지원하기',
      sticky: '후순위 지원하기',
    },
    stickySub: '결원 발생 시 우선 검토',
  },
};

export const COPY_REFERRAL = {
  open: {
    banner: '🟧 초대 전용 · 4/28(화) 14:00 마감 · 추천인 이름 필수 →',
    ctaSub: '4/28(화) 14:00 마감 · 추천인 이름 입력 필수',
    cta: {
      hero: '초대 전형으로 지원하기',
      pricing: '초대 전형으로 지원하기',
      final: '초대 전형으로 지원하기',
      sticky: '초대 전형으로 지원하기',
    },
    stickySub: '4/28(화) 14:00 마감',
  },
  closed: {
    banner: '⏰ 초대 전형 마감 · 후순위 지원 가능 →',
    ctaSub: '정원 마감 · 결원 발생 시 우선 검토',
    cta: {
      hero: '마감 · 후순위 지원하기',
      pricing: '마감 · 후순위 지원하기',
      final: '마감 · 후순위 지원하기',
      sticky: '후순위 지원하기',
    },
    stickySub: '결원 발생 시 우선 검토',
  },
};
