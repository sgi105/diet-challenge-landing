import { useEffect, useState } from 'react';
import { COHORT5 } from '../data/season5';
import { useApplicantCount } from './useApplicantCount';
import { spotsInfo } from '../lib/spots';

// 260921_team_run_season5 3단계 상태머신.
//   upcoming — 오픈 대기 (지금 - 9/16 20:00) · 카운트다운만, 신청 버튼 잠김
//   official — 모집 중 (9/16 20:00 - 9/19 24:00) · 선착순 30명 + 지원서 심사
//   closed   — 마감 (9/19 24:00 이후) · 다음 기수 오픈 알림 신청(/notify) — 결원 대기는 없앰(2026-09-19)
function compute() {
  const now = Date.now();
  if (now < new Date(COHORT5.officialOpen).getTime()) return 'upcoming';
  if (now < new Date(COHORT5.officialDeadline).getTime()) return 'official';
  return 'closed';
}

export function useSeason5Status() {
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

  // 정원 마감 시 자동 closed — 날짜 마감과 별개로 30명 다 차면 다음 기수 알림 모드.
  // (?spots=30 미리보기도 동일하게 closed가 되어 마감 화면 확인 가능)
  const count = useApplicantCount(status === 'official', COHORT5.cohortCode);
  if (spotsInfo(count)?.full) return 'closed';

  return status;
}

// 사전신청 전형 없음 — 전부 일반 지원 폼.
// 모집 중 = 지원서(/apply) · 마감 뒤 = 다음 기수 오픈 알림(/notify, 전화번호 하나).
export function applyPathForStatus5(status) {
  return status === 'closed' ? '/notify' : '/apply';
}

// 단계별 카피 — 배너 / CTA 버튼 / 보조문구.
// 시기에 따라 ① 상단 배너, ② CTA 문구, ③ 마감 문구만 교체. 본문은 그대로.
export const COPY5 = {
  upcoming: {
    banner: '🟧 9/16(수) 저녁 8시 모집 오픈 — 곧 시작',
    // 버튼 본문에 이미 오픈 시각이 들어가므로 보조문구는 정원·기간으로
    ctaSub: '선착순 30명 · 21일 러닝',
    cta: {
      hero: '🔒 9/16(수) 20:00 오픈',
      pricing: '🔒 9/16(수) 20:00 오픈',
      final: '🔒 9/16(수) 20:00 오픈',
      sticky: '🔒 9/16 20:00 오픈',
    },
    stickySub: '선착순 30명 모집',
  },
  official: {
    banner: '🔴 모집 중 · 9/19(토) 자정 마감 · 선착순 30명',
    ctaSub: '9/19(토) 자정 마감',
    cta: {
      hero: '지원하기',
      pricing: '지원하기',
      final: '지원하기',
      sticky: '지원하기',
    },
    stickySub: '9/19(토) 자정 마감',
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
