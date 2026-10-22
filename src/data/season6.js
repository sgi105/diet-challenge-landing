// 261019_team_run_season6 모집 설정 SOT. (season5.js fork — 시즌5 파일은 그대로 둔다)
// 일정 · 정원 · 프로그램 · 보상의 단일 출처. 카피에서 날짜/숫자를 직접 쓰지 말고 여기를 참조할 것.
// 오프셋 없는 ISO 문자열은 브라우저 로컬 타임존으로 파싱되어 viewer마다 다른 순간을 가리킴 → +09:00 명시 필수.
//
// 시즌6 구조 (가인 2026-10-22):
//   10/19-10/25 = 프리시즌(이월 멤버만) · 10/26(월) Day 1 - 11/22(일) Day 28 본 시즌.
//   참가비 무료 + 보증금 1만원 — 지원서 안에서 카드·간편결제 → 즉시 참가 확정(선발 없음).
//   "돈이 걸려야 제대로 한다". 해내면 보증금 전액 환급. 환급 방법(결제 취소 / 계좌)은 미정 — 랜딩·약관에 방법을 쓰지 말 것(가인 2026-10-22).
//   팀 상금 없음. (10/22 오전엔 참가비 9,900 + 리워드 1만원 안이었다가 같은 날 보증금 구조로 바꿈)
//
// 요일 확정(2026년 달력 검증): 10/25 = 일, 10/26 = 월, 10/27 = 화, 11/22 = 일.
export const COHORT6 = {
  cohortCode: '261019_team_run_season6',

  // 모집: 배포 즉시 - 10/25(일) 24:00. 오픈 전 단계 없음.
  officialOpen: '2026-10-22T00:00:00+09:00',
  officialDeadline: '2026-10-26T00:00:00+09:00',

  openLabel: '지금',
  deadlineLabel: '10/25(일) 자정',
  chatInvite: '10/25(일) 저녁',        // 결제자 단톡방 초대 — 마감 날 저녁에 한 번에 (가인 2026-10-22)
  startDate: '10/26(월)',              // 본 시즌 Day 1
  otDate: '10/26(월)',                 // 온라인 OT (줌) — 시작 당일 저녁 (가인 2026-10-22: 화→월)
  otTime: '저녁 7시 30분',
  finalDate: '11/22(일)',              // 파이널 5K (Day 28)

  // 마감 뒤 결원 충원용 백도어 — /apply?pass=<이 값>
  backdoorKey: 'refill1026',

  totalSpots: 50,
  teamSize: 5,     // 5인 1팀
  teamCount: 10,   // 최대 10팀
  durationDays: 28,
};

// 보상 구조:
// - 참가비 무료 · 보증금 1만원 (카드·간편결제, 지원서 제출 직후)
// - 28일 중 25일 이상 인증 + 파이널 5K 완주 → 보증금 전액 환급(방법 미정)
// - 포기하면 보증금 몰수 · 팀 상금 없음
export const PROGRAM6 = {
  deposit: 10000,
  depositLabel: '1만원',
  successDays: 25,      // 28일 중 성공 기준 인증 일수
  passCount: 3,         // 28일 중 봐주는 미완료 횟수
  // 90일 플랜 SOT = 가인 13주 표(2026-10-22): 1-3주 시간 기반(5→25분, 하루 1분씩) · 4주 평일 10분 + 5km 테스트.
  startMinutes: 5,      // Day 1 권장 러닝 시간
  successMinutes: 10,   // 성공 기준선 — 권장 시간과 별개로 끝까지 10분 이상
  peakMinutes: 25,      // 최대 러닝 시간
  peakDay: 21,          // 하루 1분씩 → Day 21에 25분
  deloadFromDay: 22,    // 4주차(Day 22-27)는 평일 10분 회복
  deloadMinutes: 10,
  finalDistanceKm: 5,   // 파이널 레이스 거리 (Day 28)
};

// 오픈 선착순 보너스 — 시즌5와 같은 두 가지 (가인 2026-10-22 "둘 다 유지").
// - 1대1 러닝폼 분석: 결제 완료 선착순 15명
// - Road to 1% 가이드: 오픈 다음 날 자정까지 결제한 모두
export const BONUS6 = {
  formSpots: 15,
  formTitle: '1대1 러닝폼 영상 분석',
  formDesc: '영상 보내면 자세 직접 봐줄게',
  formIcon: '🎥',
  guideTitle: '90일 하프마라톤 완주 가이드',
  guideDesc: '조회수 200만 러닝 팁 전부 담았어',
  guideIcon: '📖',
  guideDeadline: '2026-10-24T00:00:00+09:00',
  guideDeadlineLabel: '10/23(금) 자정',
};

// 28일 러닝 시간표 — Day 1 10분 → 하루 1분씩 → Day 16에 25분 → Day 21까지 유지
// → Day 22-27 디로딩 10분 → Day 28 파이널 5K. 앱 미션 설정과 맞출 것.
export const DAY_MINUTES6 = Array.from({ length: COHORT6.durationDays }, (_, i) => {
  const day = i + 1;
  if (day >= PROGRAM6.deloadFromDay && day < COHORT6.durationDays) return PROGRAM6.deloadMinutes;
  return Math.min(PROGRAM6.startMinutes + i, PROGRAM6.peakMinutes);
});

// 4주 흐름 — SystemSection 카드.
export const WEEKS6 = [
  { label: 'Week 1', title: '몸 깨우기', desc: `${PROGRAM6.startMinutes}분에서 시작 · 하루 1분씩` },
  { label: 'Week 2', title: '조금씩 더 길게', desc: '12분 → 18분' },
  { label: 'Week 3', title: `${PROGRAM6.peakMinutes}분까지`, desc: `19분 → Day ${PROGRAM6.peakDay}에 ${PROGRAM6.peakMinutes}분` },
  { label: 'Week 4', title: '회복 → 5km 테스트', desc: `평일 ${PROGRAM6.deloadMinutes}분으로 쉬고 마지막 날 5km`, highlight: true },
];

// 랜딩 SCHEDULE 카드 — 시간 순서대로.
export const SCHEDULE6 = [
  { label: '모집 마감', value: COHORT6.deadlineLabel, highlight: true },
  { label: '참가 확정', value: '보증금 결제하면 바로', highlight: false },
  { label: '단톡방 초대', value: COHORT6.chatInvite, highlight: false },
  { label: '챌린지 시작', value: COHORT6.startDate, highlight: false },
  { label: '온라인 OT (줌)', value: `${COHORT6.otDate} ${COHORT6.otTime}`, highlight: false },
  { label: '파이널 5K 레이스', value: COHORT6.finalDate, highlight: false },
];

// ── v2 랜딩(하프마라톤 목적지 프레임) 시즌6 값 ──
// 증거·영상·후기 정렬·다음 단계(90일)는 시즌5 v2 상수 그대로 쓴다(season5v2.js).

// 상품 = 90일 하프마라톤 프로그램, 그중 첫 4주(28일)가 무료 체험 (가인 2026-10-22).
// 체험 끝나면 원하는 사람만 추가 결제(90일 총액 49만원 = 보증금 1만원 포함)로 이어간다 — 자동 결제 없음.
// 90일 가격은 랜딩에 쓰지 않는다(지금 결정할 건 무료 체험뿐).

// 여정 3단계 — 첫 단계 = 28일 무료 체험.
export const JOURNEY6 = [
  { label: '28일', title: '무료 체험 · 습관', now: true },
  { label: '90일', title: '하프마라톤 훈련', now: false },
  { label: '21.0975km', title: '완주', now: false, goal: true },
];

// 히어로 90일 막대 — 시안 SOT: design-references/s6-90day-4week-trial-5.html ① (가인 2026-10-22).
// 계단 두 칸([28일] → [90일])은 "28일 하고 90일 더"로 읽혀서, 90일 막대 하나 안에 앞 28일만 칠한다.
// 단위는 전부 "일"로 통일(4주 X — 가인 "일수가 통일돼야 알아듣기 쉽다").
export const HERO_BAR6 = {
  lead: '90일 하프마라톤 프로그램',
  leadMark: '첫 28일은 무료로 체험해',
  tag: '무료 체험',
  freeDays: 28,
  totalDays: 90,
  freeLabel: '습관 만들기',
  restLabel: '본격 훈련 → 하프 완주 🏁',
};

// 모집 중 버튼 문구 — 전부 통일. 보증금은 가격 섹션·지원서에서 안내한다.
export const CTA_LABEL6 = '무료로 시작하기';

// 랜딩 후기 5개 (가인 2026-10-22 "랜딩 메시지와 제일 잘 맞는 다섯 개만"). 순서 = 노출 순서.
//   혼자선 안 됨 → 같이 하면 됨 → 초보도 됨 → 몸이 바뀜 흐름.
export const TESTIMONIAL_IDS6 = [
  'c5106217-8e4c-4516-8708-4dbd05adb7f5', // 이혜윤 — 뛰기 싫던 사람이 먼저 뛰러 나가고 싶어짐 · 코치·팀원 덕분
  'd79318ad-583a-4566-af40-f9f48f5c79c5', // 박민아 — 챌린지 아니었으면 절대 안 뛰었을 것
  'fb19fb71-ca85-479e-88cf-993bd41dc99c', // 신연우 — 혼자가 아닌 팀원과 함께해서 포기하고 싶을 때 버팀
  'ab8b8c3f-f8b2-4725-8203-df1f802480d6', // 김신현 — 100미터도 힘들었는데 4-5km가 쉬워짐
  '335ed228-3428-4378-abb2-2259328e7ec4', // 한소현 — 몸 라인이 달라짐 · 부지런해짐
];
