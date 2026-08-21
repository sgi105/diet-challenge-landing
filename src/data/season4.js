// 시즌4 (260824_team_run) 모집 설정 SOT.
// 일정 · 정원 · 프로그램 · 보상의 단일 출처. 카피에서 날짜/숫자를 직접 쓰지 말고 여기를 참조할 것.
// 오프셋 없는 ISO 문자열은 브라우저 로컬 타임존으로 파싱되어 viewer마다 다른 순간을 가리킴 → +09:00 명시 필수.
//
// 요일 확정(2026년 달력 검증): 8/19 = 수, 8/21 = 금, 8/24 = 월, 9/13 = 일.
export const COHORT4 = {
  // TODO 시즌4 코호트 코드 확정 대기 — DB 시드 위임에서 확정되면 여기 맞출 것
  cohortCode: '260824_team_run',

  // 1단계 오픈 대기: 지금 ~ 8/19(수) 08:00
  // 2단계 모집: 8/19(수) 08:00 ~ 8/21(금) 14:00
  // 3단계 마감: 8/21(금) 14:00 ~ · 결원 대기 명단
  officialOpen: '2026-08-19T08:00:00+09:00',
  officialDeadline: '2026-08-21T14:00:00+09:00',

  // 합격/입금/OT/시작 — 일정표·FAQ용
  resultDate: '8/21(금) 오후 3시',   // 합격 발표 — 마감(14:00) 1시간 뒤
  depositDeadline: '8/21(금) 자정',  // 입금 마감 — 발표 당일 자정까지
  otDate: '8/23(일)',            // 온라인 OT (줌)
  otTime: '오전 7시',             // OT 시각 (KST) — 이 자리에서 팀 배정까지 진행
  startDate: '8/24(월)',         // 챌린지 Day 1
  finalDate: '9/13(일)',         // 파이널 5K 레이스 (Day 21)

  totalSpots: 30,
  teamSize: 5,     // 5인 1팀
  teamCount: 6,    // 30명 / 5인 = 6팀
  durationDays: 21,
};

// 보상 구조 (시즌4):
// - 참가비 무료 / 보증금 20만원
// - 21일 미션 90% 이상 + 파이널 완주 → 20만원 전액 환급 (21일 중 최대 2회 미완료 패스)
// - 1등 팀 전원 → 10만원 상당 혜택 (구체 품목 미정 — 정해지면 prizeTeam1st 문구만 교체)
export const PROGRAM4 = {
  deposit: 200000,
  rewardSolo: 200000,
  successRate: 90,      // 성공 기준 미션 수행률 (%)
  passCount: 2,         // 21일 중 봐주는 미완료 횟수
  startMinutes: 10,     // Day 1 러닝 시간
  peakMinutes: 20,      // Day 11부터 유지되는 최대 러닝 시간
  peakDay: 11,          // 20분에 도달하는 날
  finalDistanceKm: 5,   // 파이널 레이스 거리
  prizeTeam1st: '10만원 상당 혜택',
  prizeTeam1stValue: 100000,
};

// 21일 러닝 시간표 — Day 1 10분 → 하루 1분씩 증가 → Day 11에 20분 → Day 21까지 20분 유지.
export const DAY_MINUTES = Array.from({ length: COHORT4.durationDays }, (_, i) =>
  Math.min(PROGRAM4.startMinutes + i, PROGRAM4.peakMinutes)
);

// 랜딩 SCHEDULE 카드에 그대로 뿌리는 일정표.
export const SCHEDULE4 = [
  { label: '모집 마감', value: '8/21(금) 14:00', highlight: true },
  { label: '합격 발표', value: COHORT4.resultDate, highlight: false },
  { label: '입금 마감', value: COHORT4.depositDeadline, highlight: false },
  { label: '온라인 OT (줌) · 팀 배정', value: `${COHORT4.otDate} ${COHORT4.otTime}`, highlight: false },
  { label: '챌린지 시작', value: COHORT4.startDate, highlight: false },
  { label: '파이널 5K 레이스', value: COHORT4.finalDate, highlight: false },
];

// 3주 흐름 — SystemSection 카드.
export const WEEKS4 = [
  { label: 'Week 1', title: '몸 깨우기', desc: '10분에서 시작 · 하루 1분씩' },
  { label: 'Week 2', title: '20분 도달', desc: 'Day 11부터 매일 20분' },
  { label: 'Week 3', title: '5K 파이널', desc: '마지막 날 5km 완주', highlight: true },
];
