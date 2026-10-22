// 지금 신청을 받는 기수 = 261019_team_run_season6 (10/26 본 시즌 시작 · 28일).
// 신청 폼(ApplyPage) · 결제 완료(ApplyPaidPage) · 완료 페이지(ApplyDonePage)가 공유하는 단일 출처.
//
// 기수가 바뀌면 이 파일만 갈아끼우면 된다 — 폼 쪽 import는 전부 여기를 본다.
// 시즌5 값은 season5.js 에 그대로 있다(이 파일만 시즌6으로 바꿈).
import { COHORT6, PROGRAM6, BONUS6 } from './season6';

export const ACTIVE = {
  cohortCode: COHORT6.cohortCode,

  // 무료 여부 — true면 결제 없이 제출 → 완료 페이지.
  isFree: false,
  // 보증금(참가비는 무료). 해내면 결제 취소로 전액 환급.
  deposit: PROGRAM6.deposit,
  depositLabel: PROGRAM6.depositLabel,

  // 지원서 안에서 카드로 받는 금액(페이앱). 값이 있으면 보증금 동의 step 대신 제출 직후 결제창으로 간다.
  // null 이면 예전 흐름(제출 → 완료 페이지 → 합격 후 계좌 입금).
  // 서버 금액 대조값(Edge secret PAYAPP_PRICE)과 반드시 같이 바꿀 것.
  fee: PROGRAM6.deposit,
  feeLabel: PROGRAM6.depositLabel,
  feeGoodName: `${COHORT6.durationDays}일 팀 러닝 챌린지 보증금`,

  teamSize: COHORT6.teamSize,
  totalSpots: COHORT6.totalSpots,
  durationDays: COHORT6.trialDays,   // 신규 기준 무료 체험 25일(지원서·결제 완료 화면 카피)

  // 신청 마감 — 이 시각 이후엔 /notify 로 넘긴다.
  deadline: COHORT6.officialDeadline,
  guideDeadline: BONUS6.guideDeadline,
  guideUrl: BONUS6.guideUrl,
  backdoorKey: COHORT6.backdoorKey,   // /apply?pass=<키> — 마감 뒤 결원 충원용
  deadlineLabel: COHORT6.deadlineLabel,

  chatInviteLabel: COHORT6.chatInvite,
  startLabel: `${COHORT6.startDate} 시작`,
  startDateLabel: COHORT6.startDate,
  otLabel: COHORT6.otDate,
  otTimeLabel: COHORT6.otTime,
  finalLabel: COHORT6.finalDate,

  // 러닝 시간표 요약 — 신청서 일정 안내 step에서 사용.
  minutesStart: PROGRAM6.startMinutes,
  minutesPeak: PROGRAM6.peakMinutes,
  peakDay: PROGRAM6.peakDay,
  deloadFromDay: PROGRAM6.deloadFromDay,
  deloadMinutes: PROGRAM6.deloadMinutes,
  passCount: PROGRAM6.passCount,
  successDays: PROGRAM6.successDays,
  joinDays: PROGRAM6.joinDays,
  joinSuccessDays: PROGRAM6.joinSuccessDays,
  finalDistanceKm: PROGRAM6.finalDistanceKm,
};

export default ACTIVE;
