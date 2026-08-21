// 지금 신청을 받는 기수 = 시즌4 (260824_team_run).
// 신청 폼(ApplyPage) · 완료 페이지(ApplyDonePage) · 입금 페이지(PayPage)가 공유하는 단일 출처.
//
// 기수가 바뀌면 이 파일만 갈아끼우면 된다 — 폼 쪽 import는 전부 여기를 본다.
// (이전에는 프리시즌 설정 configPre.js를 직접 물고 있어서 기수 전환 때마다 폼을 뜯어야 했음)
import { COHORT4, PROGRAM4 } from './season4';

export const ACTIVE = {
  cohortCode: COHORT4.cohortCode,

  // 무료 여부 — false면 보증금 동의 step이 살아나고 /pay 입금 페이지가 열린다.
  isFree: false,
  deposit: PROGRAM4.deposit,

  teamSize: COHORT4.teamSize,
  totalSpots: COHORT4.totalSpots,
  durationDays: COHORT4.durationDays,

  // 신청 마감 — 이 시각 이후 접수분은 대기명단으로 태깅된다.
  deadline: COHORT4.officialDeadline,
  deadlineLabel: '8/21(금) 오후 2시 30분',

  startLabel: `${COHORT4.startDate} 시작`,
  startDateLabel: COHORT4.startDate,   // "시작"이라는 말이 앞에 이미 있는 자리용
  resultLabel: COHORT4.resultDate,        // 합격 발표
  depositDeadlineLabel: COHORT4.depositDeadline,
  otLabel: COHORT4.otDate,
  otTimeLabel: COHORT4.otTime,
  finalLabel: COHORT4.finalDate,

  // 러닝 시간표 요약 — 신청서 일정 동의 step에서 사용.
  minutesStart: PROGRAM4.startMinutes,
  minutesPeak: PROGRAM4.peakMinutes,
  peakDay: PROGRAM4.peakDay,
  passCount: PROGRAM4.passCount,
  finalDistanceKm: PROGRAM4.finalDistanceKm,
  successRate: PROGRAM4.successRate,
  prizeTeam1st: PROGRAM4.prizeTeam1st,
};

export default ACTIVE;
