import { useEffect, useState } from 'react';
import { COHORT6 } from '../data/season6';
import { useApplicantCount } from './useApplicantCount';
import { spotsInfo } from '../lib/spots';

// 261019_team_run_season6 상태머신 (useSeason5Status fork).
//   official — 모집 중 (배포 즉시 - 10/25(일) 24:00) · 결제하면 바로 참가 확정, 정원 50명
//   closed   — 마감 · 다음 기수 오픈 알림 신청(/notify)
// 오픈 전(upcoming) 단계는 이번엔 없지만 상태 모양은 시즌5와 맞춰 둔다(공용 컴포넌트가 같은 키를 본다).
function compute() {
  const now = Date.now();
  if (now < new Date(COHORT6.officialOpen).getTime()) return 'upcoming';
  if (now < new Date(COHORT6.officialDeadline).getTime()) return 'official';
  return 'closed';
}

export function useSeason6Status() {
  const [status, setStatus] = useState(compute);

  useEffect(() => {
    if (status === 'closed') return;
    const t = setInterval(() => {
      const next = compute();
      setStatus((prev) => (prev === next ? prev : next));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  // 정원(결제 완료 기준) 다 차면 자동 closed.
  const count = useApplicantCount(status === 'official', COHORT6.cohortCode);
  if (spotsInfo(count)?.full) return 'closed';

  return status;
}

export function applyPathForStatus6(status) {
  return status === 'closed' ? '/notify' : '/apply';
}

export const COPY6 = {
  upcoming: {
    banner: '🟧 곧 모집 오픈',
    ctaSub: `정원 ${COHORT6.totalSpots}명 · ${COHORT6.durationDays}일 러닝`,
    cta: { hero: '🔒 곧 오픈', pricing: '🔒 곧 오픈', final: '🔒 곧 오픈', sticky: '🔒 곧 오픈' },
    stickySub: `정원 ${COHORT6.totalSpots}명`,
  },
  official: {
    banner: `🔴 ${COHORT6.trialDays}일 무료 체험 모집 중 · ${COHORT6.deadlineLabel} 마감 · 정원 ${COHORT6.totalSpots}명`,
    ctaSub: `${COHORT6.deadlineLabel} 마감`,
    cta: { hero: '무료로 시작하기', pricing: '무료로 시작하기', final: '무료로 시작하기', sticky: '무료로 시작하기' },
    stickySub: `${COHORT6.deadlineLabel} 마감`,
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
