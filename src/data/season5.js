// 260921_team_run_season5 모집 설정 SOT. (season4.js fork)
// 일정 · 정원 · 프로그램 · 보상의 단일 출처. 카피에서 날짜/숫자를 직접 쓰지 말고 여기를 참조할 것.
// 오프셋 없는 ISO 문자열은 브라우저 로컬 타임존으로 파싱되어 viewer마다 다른 순간을 가리킴 → +09:00 명시 필수.
//
// 요일 확정(2026년 달력 검증): 9/16 = 수, 9/18 = 금, 9/19 = 토, 9/21 = 월, 9/22 = 화, 10/11 = 일.
// 이번 기수는 OT가 시작 다음 날(화)이다 — Day 1(월)은 팀 없이 개인 러닝, 팀 배정은 OT에서.
export const COHORT5 = {
  cohortCode: '260921_team_run_season5',

  // 1단계 오픈 대기: 지금 - 9/16(수) 20:00
  // 2단계 모집: 9/16(수) 20:00 - 9/19(토) 24:00 (1차 20:00 마감 → 마감 전 1회 연장 공지, 시작일은 9/21 유지)
  // 3단계 마감: 9/19(토) 24:00 - · 결원 대기 명단
  officialOpen: '2026-09-16T20:00:00+09:00',
  officialDeadline: '2026-09-20T00:00:00+09:00',

  // 합격/입금/시작/OT — 일정표·FAQ용
  openLabel: '9/16(수) 저녁 8시',
  deadlineLabel: '9/19(토) 자정',
  resultDate: '9/20(일) 오전 10시',     // 합격 발표 — 마감 다음 날 오전
  depositDeadline: '9/20(일) 밤 10시',  // 입금 마감 — 시작(9/21) 전날 밤
  startDate: '9/21(월)',               // 챌린지 Day 1
  otDate: '9/22(화)',                  // 온라인 OT (줌) — 시작 다음 날
  otTime: '저녁 7시 30분',              // OT 시각 (KST) — 이 자리에서 팀 배정
  finalDate: '10/11(일)',              // 파이널 5K 레이스 (Day 21)

  totalSpots: 30,
  teamSize: 5,     // 5인 1팀
  teamCount: 6,    // 30명 / 5인 = 6팀
  durationDays: 21,
};

// 보상 구조:
// - 참가비 무료 / 보증금 10만원
// - 21일 중 18일 이상 인증 + 파이널 완주 → 10만원 전액 환급 (21일 중 최대 3회 미완료 패스, 가인 2026-09-19)
// - 우승팀 → 팀 합산 현금 10만원 (1인당 아님)
export const PROGRAM5 = {
  deposit: 100000,
  depositLabel: '10만원',
  rewardSolo: 100000,
  successRate: 85,      // 성공 기준 미션 수행률 (%) — 21일×85% 올림 = 18일
  passCount: 3,         // 21일 중 봐주는 미완료 횟수
  startMinutes: 10,     // Day 1 러닝 시간
  peakMinutes: 20,      // Day 11부터 유지되는 최대 러닝 시간
  peakDay: 11,          // 20분에 도달하는 날
  finalDistanceKm: 5,   // 파이널 레이스 거리
  prizeTeam1st: '팀 상금 현금 10만원',
  prizeTeam1stValue: 100000,
};

// 오픈 당일 선착순 보너스 (단톡방 런칭 메시지 SOT와 일치시킬 것).
// - 1대1 러닝폼 분석: 신청 선착순 15명
// - Road to 1% 가이드: 오픈 당일 자정(9/17 00:00)까지 신청한 모두
export const BONUS5 = {
  formSpots: 15,
  formTitle: '1대1 러닝폼 영상 분석',
  formDesc: '네 러닝 영상 보내주면 자세 직접 봐줄게',
  formIcon: '🎥',
  guideTitle: 'Road to 1%: 100일 하프마라톤 완주 마스터가이드',
  guideDesc: '누적 조회수 200만 · 100시간 넘게 만든 러닝 팁 전부',
  guideIcon: '📖',
  guideDeadline: '2026-09-17T00:00:00+09:00',
  guideDeadlineLabel: '오늘 자정',
};

// 21일 러닝 시간표 — Day 1 10분 → 하루 1분씩 증가 → Day 11에 20분 → Day 21까지 20분 유지.
export const DAY_MINUTES = Array.from({ length: COHORT5.durationDays }, (_, i) =>
  Math.min(PROGRAM5.startMinutes + i, PROGRAM5.peakMinutes)
);

// 랜딩 SCHEDULE 카드에 그대로 뿌리는 일정표. 시간 순서대로 — 이번엔 시작(월)이 OT(화)보다 먼저.
export const SCHEDULE5 = [
  { label: '모집 마감', value: '9/19(토) 24:00', highlight: true },
  { label: '합격 발표', value: COHORT5.resultDate, highlight: false },
  { label: '입금 마감', value: COHORT5.depositDeadline, highlight: false },
  { label: '챌린지 시작', value: COHORT5.startDate, highlight: false },
  { label: '온라인 OT (줌) · 팀 배정', value: `${COHORT5.otDate} ${COHORT5.otTime}`, highlight: false },
  { label: '파이널 5K 레이스', value: COHORT5.finalDate, highlight: false },
];

// 3주 흐름 — SystemSection 카드.
export const WEEKS5 = [
  { label: 'Week 1', title: '몸 깨우기', desc: '10분에서 시작 · 하루 1분씩' },
  { label: 'Week 2', title: '20분 도달', desc: 'Day 11부터 매일 20분' },
  { label: 'Week 3', title: '5K 파이널', desc: '마지막 날 5km 완주', highlight: true },
];
