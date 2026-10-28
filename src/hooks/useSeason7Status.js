import { useEffect, useState } from 'react';
import { COHORT7, RECRUIT_OPEN, NOTIFY_LABEL7, CTA_LABEL7 } from '../data/season7';
import { useApplicantCount } from './useApplicantCount';
import { spotsInfo } from '../lib/spots';

// 261130_team_run_season7 상태머신 (useSeason6Status fork).
//   upcoming — 모집 오픈 전 = "오픈 알림 신청" 모드. 메인 버튼은 /notify, 결제는 /s7/join 공개 링크로 미리 받는다.
//   official — 모집 중 · 메인 버튼이 /s7/join(참가비 결제)으로 간다. 정원 50명.
//   closed   — 마감 · 다음 기수 오픈 알림 신청(/notify)
// RECRUIT_OPEN(season7.js)이 false 면 날짜와 상관없이 upcoming.
function compute() {
  if (!RECRUIT_OPEN) return 'upcoming';
  const now = Date.now();
  if (now < new Date(COHORT7.officialOpen).getTime()) return 'upcoming';
  if (now < new Date(COHORT7.officialDeadline).getTime()) return 'official';
  return 'closed';
}

export function useSeason7Status() {
  const [status, setStatus] = useState(compute);

  useEffect(() => {
    if (status === 'closed' || !RECRUIT_OPEN) return;
    const t = setInterval(() => {
      const next = compute();
      setStatus((prev) => (prev === next ? prev : next));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  // 정원(결제 완료 기준) 다 차면 자동 closed.
  const count = useApplicantCount(status === 'official', COHORT7.cohortCode);
  if (spotsInfo(count)?.full) return 'closed';

  return status;
}

export const JOIN_PATH7 = '/s7/join';

export function applyPathForStatus7(status) {
  return status === 'official' ? JOIN_PATH7 : '/notify';
}

export const COPY7 = {
  upcoming: {
    banner: `🟧 시즌7 ${COHORT7.startDate} 시작 · 오픈 알림 신청 중 →`,
    ctaSub: '전화번호만 남기면 오픈 때 제일 먼저 문자',
    cta: { hero: NOTIFY_LABEL7, pricing: NOTIFY_LABEL7, final: NOTIFY_LABEL7, sticky: NOTIFY_LABEL7 },
    stickySub: '전화번호만 남기면 끝',
  },
  official: {
    banner: `🔴 시즌7 모집 중 · ${COHORT7.deadlineLabel} 마감 · 정원 ${COHORT7.totalSpots}명`,
    ctaSub: `${COHORT7.deadlineLabel} 마감`,
    cta: { hero: CTA_LABEL7, pricing: CTA_LABEL7, final: CTA_LABEL7, sticky: CTA_LABEL7 },
    stickySub: `${COHORT7.deadlineLabel} 마감`,
  },
  closed: {
    banner: '⏰ 이번 기수 마감 · 다음 기수 오픈 알림 받기 →',
    ctaSub: '전화번호만 남기면 끝',
    cta: {
      hero: '다음 기수 오픈 알림 받기',
      pricing: '다음 기수 오픈 알림 받기',
      final: '다음 기수 오픈 알림 받기',
      sticky: '다음 기수 오픈 알림 받기',
    },
    stickySub: '전화번호만 남기면 끝',
  },
};
