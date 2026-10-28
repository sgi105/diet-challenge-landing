// 261130_team_run_season7 모집 설정 SOT. (season6.js fork — 시즌6 파일은 그대로 둔다 · 시즌6 랜딩은 /s6 아카이브)
// 일정 · 정원 · 프로그램 · 가격의 단일 출처. 카피에서 날짜/숫자를 직접 쓰지 말고 여기를 참조할 것.
// 오프셋 없는 ISO 문자열은 브라우저 로컬 타임존으로 파싱되어 viewer마다 다른 순간을 가리킴 → +09:00 명시 필수.
//
// 시즌7 구조 (가인 2026-10-27):
//   상품 = 90일 하프마라톤 프로그램, 그중 첫 28일 = 1만원 체험(참가비 10,000원 · 환급 없음).
//   보증금·환급·몰수 구조는 쓰지 않는다(PG 정책). 랜딩·약관·결제창에 "보증금/환급"이라는 말을 쓰지 말 것.
//   Day 1 = 11/30(월) · Day 28 = 12/27(일) 5km 테스트 · Day 29 = 12/28(월) 근력 시작 · 하프 = Day 91 = 2027-02-28(일).
//   모집 오픈 전엔 랜딩 = 오픈 알림 신청 모드. 결제는 /s7/join(공개 링크)에서 미리 받는다(사전 참가 확정).
//   환불(가인 2026-10-27 추천안): OT 전 전액 · 시작 후 7일 이내 남은 일수 일할 · 7일 경과 후 환불 불가.
//
// 요일 확정(2026년 달력 검증): 11/30 = 월, 12/20 = 일, 12/27 = 일, 12/28 = 월, 2027-02-28 = 일.
// TODO(가인 확인): 모집 오픈일·마감일 · OT 시간 · 단톡방 초대 시각 — 지금 값은 시즌6 패턴을 따른 임시값.

// 모집 스위치 — false 면 날짜와 상관없이 "오픈 알림 신청" 모드(upcoming). 모집을 열 때 true 로.
export const RECRUIT_OPEN = false;

export const COHORT7 = {
  cohortCode: "261130_team_run_season7",

  officialOpen: "2026-11-16T00:00:00+09:00",      // 임시 — RECRUIT_OPEN 이 false 면 쓰이지 않는다
  officialDeadline: "2026-11-30T00:00:00+09:00",  // 임시 — 11/29(일) 자정 마감
  openLabel: "곧",
  deadlineLabel: "11/29(일) 자정",
  chatInvite: "11/30(월) 오전",
  startDate: "11/30(월)",
  otDate: "11/30(월)",
  otTime: "저녁 7시 30분",
  finalDate: "12/27(일)",

  backdoorKey: "refill1130",

  totalSpots: 50,
  teamSize: 5,
  teamCount: 10,
  durationDays: 28,
  trialDays: 28,      // 체험 = Day 1-28 전체(신규 합류 오프셋 없음)
  joinDay: 1,
  strengthStart: "12/28(월)",
  halfDate: "2/28(일)",
};

// 가격 · 환불 · 성공 기준.
export const PROGRAM7 = {
  fee: 10000,
  feeLabel: "1만원",
  feeGoodName: "90일 하프 프로그램 첫 28일 체험 (시즌7)",   // 결제창 상품명
  successDays: 25,      // 28일 중 25일 인증 + 파이널 5K = 미션 성공(보상과 무관)
  passCount: 3,
  joinDays: 28,
  joinSuccessDays: 25,
  startMinutes: 5,
  joinStartMinutes: 5,
  successMinutes: 10,
  peakMinutes: 25,
  peakDay: 21,
  deloadFromDay: 22,
  deloadMinutes: 10,
  finalDistanceKm: 5,
};

// 환불정책 SOT — /refund · 약관 · 결제 페이지가 같이 본다.
export const REFUND7 = {
  fullUntil: "OT 시작 전",
  proRataDays: 7,          // 시작 후 7일 이내 = 남은 일수 일할 환불
  summary: "OT 전 전액 환불 · 시작 후 7일 이내 남은 일수만큼 환불 · 7일 이후 환불 불가",
};

// 시즌7은 얼리버드 보너스 없음(미정). BonusSection 은 랜딩에서 뺀다. 공용 컴포넌트 호환용으로 모양만 남긴다.
export const BONUS7 = {
  formSpots: 0,
  formTitle: "",
  formDesc: "",
  formIcon: "",
  guideTitle: "",
  guideDesc: "",
  guideIcon: "",
  guideDeadline: "2026-11-30T00:00:00+09:00",
  guideDeadlineLabel: "",
  guideUrl: "",
};

export const DAY_MINUTES7 = Array.from({ length: COHORT7.durationDays }, (_, i) => {
  const day = i + 1;
  if (day >= PROGRAM7.deloadFromDay && day < COHORT7.durationDays) return PROGRAM7.deloadMinutes;
  return Math.min(PROGRAM7.startMinutes + i, PROGRAM7.peakMinutes);
});

export const WEEKS7 = [
  { label: "Week 1", title: "몸 깨우기", desc: `${PROGRAM7.startMinutes}분에서 시작 · 하루 1분씩` },
  { label: "Week 2", title: "조금씩 더 길게", desc: "12분 → 18분" },
  { label: "Week 3", title: `${PROGRAM7.peakMinutes}분까지`, desc: `19분 → 12/20에 ${PROGRAM7.peakMinutes}분` },
  { label: "Week 4", title: "회복 → 5km 테스트", desc: `평일 ${PROGRAM7.deloadMinutes}분으로 쉬고 마지막 날 5km`, highlight: true },
];

export const SCHEDULE7 = [
  { label: "모집 마감", value: COHORT7.deadlineLabel, highlight: true },
  { label: "참가 확정", value: "참가비 결제하면 바로", highlight: false },
  { label: "단톡방 초대", value: COHORT7.chatInvite, highlight: false },
  { label: "첫 러닝 · 온라인 OT (줌)", value: `${COHORT7.startDate} ${COHORT7.otTime}`, highlight: false },
  { label: "28일 체험 끝 · 5km 테스트", value: COHORT7.finalDate, highlight: false },
];

// ── v2 랜딩(하프마라톤 목적지 프레임) 시즌6 값 ──
// 증거·영상·후기 정렬·다음 단계(90일)는 시즌5 v2 상수 그대로 쓴다(season5v2.js).

// 상품 = 90일 하프마라톤 프로그램, 그중 첫 28일 = 1만원 체험. 90일 이어가기 가격은 랜딩에 쓰지 않는다.

// 여정 3단계 — 첫 단계 = 28일 1만원 체험.
export const JOURNEY7 = [
  { label: "28일", title: "1만원 체험 · 습관", now: true },
  { label: '90일', title: '하프마라톤 훈련', now: false },
  { label: '21.0975km', title: '완주', now: false, goal: true },
];

// 히어로 90일 막대 — 시안 SOT: design-references/s6-90day-4week-trial-5.html ① (가인 2026-10-22).
// 계단 두 칸([28일] → [90일])은 "28일 하고 90일 더"로 읽혀서, 90일 막대 하나 안에 앞 28일만 칠한다.
// 단위는 전부 "일"로 통일(4주 X — 가인 "일수가 통일돼야 알아듣기 쉽다").
export const HERO_BAR7 = {
  lead: '90일 하프마라톤 프로그램',
  leadMark: "첫 28일은 1만원으로 시작해",
  tag: "1만원 체험",
  freeDays: 28,       // 1만원 체험 일수(11/30-12/27)
  restDays: 63,       // 12/28-2/28 (Day 29-91 · 하프 일요일)
  totalDays: 90,
  // 눈금은 DAY 번호 대신 날짜 — 신규의 첫날은 프로그램 Day 4라 DAY 1 표기가 헷갈린다.
  ticks: ["11/30", "12/27", "2/28"],
  freeLabel: '습관 만들기',
  restLabel: '러닝 + 근력 → 하프 + 몸 🏁',
  restLead: "12/28부터",
};

// 모집 중 버튼 문구 — 전부 통일. 가격은 버튼에 박는다(1만원).
export const CTA_LABEL7 = "1만원으로 시작하기";
// 모집 오픈 전(알림 모드) 버튼
export const NOTIFY_LABEL7 = "시즌7 오픈 알림 받기";
export const JOIN_LINK_LABEL7 = "알림 말고 지금 바로 참가 확정하기";

// 랜딩 후기 5개 (가인 2026-10-23 UVP 기준 재선정). 순서 = 노출 순서.
//   작심삼일 → 같이 하니 됨 → 28일 하루도 안 쉼 → 10분에서 하프까지 → 초보도 됨 → 몸이 바뀜 흐름.
// 여기 넣는 글은 landing_testimonial_picks(현재 버전)에도 있어야 카드가 뜬다. 강조 구간도 거기 highlights.
export const TESTIMONIAL_IDS7 = [
  'de42cced-c11d-4684-898b-495ade932fad', // 박주형 — 번번히 작심삼일 → 온라인이어도 같이 뛰는 기분 · 팀 점수 덕분
  '64638e8d-ed54-4144-ad69-432bc55a442a', // 이지연 — 28일 하루도 안 쉼 · 혼자라면 절대 못 함 · 처음 5km 5분대
  'a2e56ece-42e3-48c8-be39-6ab0867165c8', // 박견낭 — 딱 10분 → 5km → 하프도 할 만하겠다
  '379c0ddf-42ce-4c47-a927-7d7b7ad5f528', // 조국화 — 1km도 힘들던 초보 → 3주 뒤 20분 완주
  'c728889e-594d-4335-800d-d75878b3d779', // 한혜진 — 인생의 전환점 · 살 빼고 나이키 티
];

// 긴 후기는 원문 문장만 골라 보여준다(가인 2026-10-23 "필요없는 부분 자르기"). 단어는 안 바꾸고 빠진 자리는 … 로 표시.
// 문장은 원문에 그 순서 그대로 있어야 한다 — 하나라도 안 맞으면 그 카드는 원문 전체로 보여준다.
export const TESTIMONIAL_EXCERPTS7 = {
  'de42cced-c11d-4684-898b-495ade932fad': [
    '런클럽을 가입하고 든든한 팀원들도 생겼고, 지금 12일째 매일 달리고 있어!!',
    '예전에도 매일 달려보려고 시도한적이 있지만 번번히 작심삼일이었는데',
    '근데 온라인 런클럽에서 매일 서로의 러닝을 공유하니까 같이 뛰는 기분도 들고, 팀 점수 시스템 덕분에 매일 뛰러 나갈 동기가 생긴 것 같아🔥',
  ],
  '64638e8d-ed54-4144-ad69-432bc55a442a': [
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
