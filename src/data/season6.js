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

// 랜딩 후기 5개 (가인 2026-10-23 UVP 기준 재선정). 순서 = 노출 순서.
//   작심삼일 → 같이 하니 됨 → 28일 하루도 안 쉼 → 10분에서 하프까지 → 초보도 됨 → 몸이 바뀜 흐름.
// 여기 넣는 글은 landing_testimonial_picks(현재 버전)에도 있어야 카드가 뜬다. 강조 구간도 거기 highlights.
export const TESTIMONIAL_IDS6 = [
  'de42cced-c11d-4684-898b-495ade932fad', // 박주형 — 번번히 작심삼일 → 온라인이어도 같이 뛰는 기분 · 팀 점수 덕분
  '64638e8d-ed54-4144-ad69-432bc55a442a', // 이지연 — 28일 하루도 안 쉼 · 혼자라면 절대 못 함 · 처음 5km 5분대
  'a2e56ece-42e3-48c8-be39-6ab0867165c8', // 박견낭 — 딱 10분 → 5km → 하프도 할 만하겠다
  '379c0ddf-42ce-4c47-a927-7d7b7ad5f528', // 조국화 — 1km도 힘들던 초보 → 3주 뒤 20분 완주
  'c728889e-594d-4335-800d-d75878b3d779', // 한혜진 — 인생의 전환점 · 살 빼고 나이키 티
];

// 긴 후기는 원문 문장만 골라 보여준다(가인 2026-10-23 "필요없는 부분 자르기"). 단어는 안 바꾸고 빠진 자리는 … 로 표시.
// 문장은 원문에 그 순서 그대로 있어야 한다 — 하나라도 안 맞으면 그 카드는 원문 전체로 보여준다.
export const TESTIMONIAL_EXCERPTS6 = {
  'de42cced-c11d-4684-898b-495ade932fad': [
    '런클럽을 가입하고 든든한 팀원들도 생겼고, 지금 12일째 매일 달리고 있어!!',
    '예전에도 매일 달려보려고 시도한적이 있지만 번번히 작심삼일이었는데',
    '근데 온라인 런클럽에서 매일 서로의 러닝을 공유하니까 같이 뛰는 기분도 들고, 팀 점수 시스템 덕분에 매일 뛰러 나갈 동기가 생긴 것 같아🔥',
  ],
  '64638e8d-ed54-4144-ad69-432bc55a442a': [
    '결제취소 가능한 날까지도 아 진짜 해? 하면서 고민했던 저지만 이번 기회를 통해 28일동안 하루도 쉬지 않고 런닝을 했어요! 저 혼자라면 절대 할 수 없었던 일들이였어요.',
    '저는 이번 기회를 통해 처음으로 5km 5분대로 완주했는데 너무 행복했어요!!',
  ],
  'a2e56ece-42e3-48c8-be39-6ab0867165c8': [
    '15일 전까지만 해도 5km는 그냥 누구나 마음만 먹으면 뛰는 거리인 줄 알았다.',
    '그런데 막상 뛰어보니 숨은 턱까지 차오르고, 몸은 마음처럼 움직여주지 않고…😂ㅋㅋ 계속 그만하고 싶고.',
    '그리고 그냥 되게 되게 작은 노력을 해봤다. 딱 10분.',
    '그랬던 내가 여전히 벅차고 힘들지만 그래도 5km를 뛸 수 있게 되었고 , 앞으로 꾸준히만하면 하프도 할만 하겠단 생각이 든다.',
  ],
  '379c0ddf-42ce-4c47-a927-7d7b7ad5f528': [
    '3주 전의 나는 1km만 뛰어도 힘들어했고 5분 연속으로 달리는 것도 버거웠어.',
    '그런데 3주 동안 꾸준히 달린 결과, 오늘 파이널 레이스에서 20분을 완주하며 나의 최고 기록을 낼 수 있었어.',
    '그래서 가장 달라진 점은 ’할 수 있을까?’가 ’할 수 있다!’로 바뀐 거야.',
  ],
};
