// 지금 신청을 받는 기수 = 260921_team_run_season5.
// 신청 폼(ApplyPage) · 완료 페이지(ApplyDonePage) · 입금 페이지(PayPage)가 공유하는 단일 출처.
//
// 기수가 바뀌면 이 파일만 갈아끼우면 된다 — 폼 쪽 import는 전부 여기를 본다.
// (이전에는 프리시즌 설정 configPre.js를 직접 물고 있어서 기수 전환 때마다 폼을 뜯어야 했음)
import { COHORT5, PROGRAM5 } from './season5';

export const ACTIVE = {
  cohortCode: COHORT5.cohortCode,

  // 무료 여부 — false면 보증금 동의 step이 살아나고 /pay 입금 페이지가 열린다.
  isFree: false,
  deposit: PROGRAM5.deposit,
  depositLabel: PROGRAM5.depositLabel,   // "10만원" — 신청폼/입금/완료 페이지 문구용

  teamSize: COHORT5.teamSize,
  totalSpots: COHORT5.totalSpots,
  durationDays: COHORT5.durationDays,

  // 신청 마감 — 이 시각 이후 접수분은 대기명단으로 태깅된다.
  deadline: COHORT5.officialDeadline,
  backdoorKey: COHORT5.backdoorKey,   // /apply?pass=<키> — 마감 뒤 결원 충원용
  deadlineLabel: COHORT5.deadlineLabel,

  startLabel: `${COHORT5.startDate} 시작`,
  startDateLabel: COHORT5.startDate,   // "시작"이라는 말이 앞에 이미 있는 자리용
  resultLabel: COHORT5.resultDate,        // 합격 발표
  depositDeadlineLabel: COHORT5.depositDeadline,
  otLabel: COHORT5.otDate,
  otTimeLabel: COHORT5.otTime,
  finalLabel: COHORT5.finalDate,

  // 러닝 시간표 요약 — 신청서 일정 동의 step에서 사용.
  minutesStart: PROGRAM5.startMinutes,
  minutesPeak: PROGRAM5.peakMinutes,
  peakDay: PROGRAM5.peakDay,
  passCount: PROGRAM5.passCount,
  finalDistanceKm: PROGRAM5.finalDistanceKm,
  successRate: PROGRAM5.successRate,
  prizeTeam1st: PROGRAM5.prizeTeam1st,
};

export default ACTIVE;
