// 260921_team_run_season5 랜딩 v2 전용 상수.
// v1(season5.js)은 일정·정원·보상 SOT 그대로 재사용하고, 여기엔 v2에서 새로 쓰는 것만 둔다.
//   - 하프마라톤 목적지 프레임 (21일 → 90일 → 완주)
//   - "작심삼일 → 21일" 지속성 증거 (실측)
// v1 파일을 건드리지 않으므로 라이브 랜딩(/ , /s5)에는 영향이 없다.

// 여정 3단계 — 21일이 왜 첫 관문인지를 설명 없이 보여주는 그림.
// 21일은 90일 훈련을 소화할 기초 체력과 습관을 만드는 준비 구간이다(선발/시험이 아님).
export const JOURNEY = [
  { label: '21일', title: '기초 체력 · 습관', now: true },
  { label: '90일', title: '하프마라톤 훈련', now: false },
  { label: '21.0975km', title: '완주', now: false, goal: true },
];

// 지속성 증거 — 러닝 기수 5개 누적, 신규 참가자만 (2026-09-18 가인 확인).
//   신규 = 이전에 러닝 기수(team_run)를 한 번도 안 한 사람. cohort_memberships.is_extended는 기수마다
//   제대로 안 채워져 있어서 쓰면 안 된다(260824 신규가 25명으로 잘못 나옴 → 실제 9명).
//   이월 멤버는 보증금이 없어 완주율이 구조적으로 낮으므로 모수에서 뺀다.
//   완주 판정은 앱 기록만으로 재현이 안 된다(260504는 28일·패스 3번, 초기 패스 기록 불일치, 파이널 5K 미기록)
//   → 앱 기록으로 후보를 뽑고 가인이 실제 정산 기준으로 확정했다.
//   260504 28/30 · 260601 29/29 · 260629 20/21 · 260727 1/1 · 260824 8/9
//   모수 제외 2명: 260601 중도 이탈 1 · 260629 탈퇴 계정 1
export const PROOF = {
  cohortCount: 5,
  newTotal: 90,
  finished: 86,
  consistencyRate: 96,      // 86 / 90 = 95.6%
  // 혼자 할 때 — 컬럼비아대 뉴스(2020.1) 행동의학 Donald Edmondson 교수: "새해 결심을 30일 뒤까지 지키는 사람은 약 25%".
  //   논문 수치가 아니라 인터뷰 발언이고, 운동 결심만이 아니라 새해 결심 전체 기준 — 표기를 이보다 세게 쓰지 말 것.
  //   (예전 값 19%는 Norcross 1988의 2년 유지율이라 우리 21일과 기간이 안 맞아 교체. 같은 연구의 1달 수치는 55%.)
  soloSuccessRate: 25,
  soloBasis: '새해 결심 · 한 달 뒤까지 지킨 사람',
  soloSource: 'Columbia University 뉴스 (2020), 행동의학 Donald Edmondson 교수',
  teamBasis: 'TARZAN 챌린지 · 신규 90명 중 86명 완주',
};

// 21일 다음 단계. 가격·시작일은 랜딩에 쓰지 않는다 —
// 지금 파는 건 21일이고, 90일 금액을 미리 꺼내면 판단이 흐려진다.
// 주차 구성 SOT = public/guide/half-12week-plan.html (90일 챌린지 커리큘럼과 동일).
//   4주 주기 3블록 · 주간 거리 +10% · 일요일 롱런(주간 30%) · 5주차부터 수요일 템포런 · 4·8주차 디로딩(25%↓)
export const NEXT_STEP = {
  title: '90일 하프마라톤 챌린지',
  goal: '하프마라톤을 완주할 수 있는 몸과 체력 만들기',
  weeks: [
    { label: '1-4주', desc: '이지런 + 일요일 롱런 · 4주차 회복' },
    { label: '5-8주', desc: '수요일 템포런 추가 · 8주차 회복' },
    { label: '9-12주', desc: '11주차 15km 롱런 → 12주차 21km' },
  ],
};

// 히어로 카피 바로 밑 세로 영상 두 칸 (가로로 나란히). 4:5 · 1080×1350 · mp4 무음 · 6-10초 반복 · 개당 2-4MB.
// 비포/애프터 구분은 영상 안에서 보여준다 — 칸에는 라벨을 달지 않는다.
// 파일은 public/s5v2/ 에 넣고 src(mp4)와 poster(첫 프레임 jpg)를 적으면 된다.
// src가 비어 있으면 자리 표시로 렌더된다. 얼굴·실명 노출은 본인 동의 받은 것만.
// 왼쪽 = BEFORE(러닝·몸 둘 다 담긴 비포), 오른쪽 = AFTER(러닝·몸 둘 다 담긴 애프터).
// 원본(아이폰 HEVC .mov)은 raw-videos/s5v2/ (이전 버전은 -v1) — 안드로이드·PC 크롬이 HEVC를 못 틀어서 H.264로 변환해 둠.
// 칸 폭이 166px라 576×720(4:5)이면 레티나 3배까지 충분. 소리 트랙 제거 · faststart.
// 재변환: ffmpeg -i raw-videos/s5v2/X.mov -an -c:v libx264 -pix_fmt yuv420p -crf 23 -preset slow
//         -vf scale=576:720 -movflags +faststart public/s5v2/X.mp4   (포스터 = 첫 프레임 jpg)
export const HERO_MEDIA = [
  // ?v=N — 파일명이 같아서 영상 교체 시 브라우저·CDN 캐시가 옛 영상을 줄 수 있다. 교체할 때마다 올릴 것.
  { src: '/s5v2/before.mp4?v=2', poster: '/s5v2/before.jpg?v=2', label: 'BEFORE' },
  { src: '/s5v2/after.mp4?v=2', poster: '/s5v2/after.jpg?v=2', label: 'AFTER', accent: true },
];

// 히어로 계단 — "하프마라톤 훈련" 큰 틀 안에 첫 21일(습관)이 입구로 들어간 그림.
// 시안 SOT: design-references/s5v2-hero-stairs-10.html — 디자인 S2(일수 크게) + 문장 S9 (가인 2026-09-19)
// 오해 방지(90일까지 한꺼번에 신청하는 걸로 읽히지 않게): 총 일수(111일) 안 씀 · 첫 계단에 "여기서 시작" · 버튼 "21일 챌린지 지원하기".
// 21일 → 90일은 누구나 갈 수 있다(인증 미달이어도 90일 참가 가능 · 보증금만 못 돌려받음).
export const HERO_STAIRS = {
  // 계단 위 문장 — 시안 SOT: design-references/s5v2-stairs-lead-10.html ③ (왼쪽 정렬 캡션)
  lead: '하프마라톤 훈련',
  leadMark: '첫 21일은 습관부터',
  startTag: '여기서 시작',
  first: { days: '21일', label: '습관 만들기' },
  next: { days: '90일', label: '본격 훈련 → 하프 완주' },
};

// 21일 흐름 카드 — v1(season5.js WEEKS5)과 문구만 다르다. 라이브에 영향 안 가게 v2 전용으로 둔다.
export const WEEKS_V2 = [
  { label: 'Week 1', title: '몸 깨우기', desc: '10분에서 시작 · 1분씩 증가' },
  { label: 'Week 2', title: '권장 20분', desc: '성공 기준은 그대로 10분' },
  { label: 'Week 3', title: '5K 파이널', desc: '마지막 날 5km 완주', highlight: true },
];

// 모집 중 지원 버튼 문구 — v2 모든 버튼 통일. 헤드라인의 90일과 헷갈리지 않게 지원 대상(21일)을 박는다.
// 오픈 전/마감 문구는 공용 COPY5 그대로 쓴다.
export const CTA_LABEL_V2 = '21일 챌린지 지원하기';

// 공감 섹션 "나도 똑같았어." 밑 짧은 리액션 영상(가인 절레절레). 4:5 · 무음 · 반복.
// 원본은 raw-videos/s5v2/ → 576×720 H.264 로 변환해 public/s5v2/shake.mp4 로. 비어 있으면 자리 표시.
// 원본은 아이폰 HDR(HLG · 10bit) — 그대로 변환하면 색이 바래서 zscale+tonemap(hable)으로 SDR 변환 후 인코딩.
//   ffmpeg -i raw-videos/s5v2/shake.MOV -an -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,
//   zscale=t=bt709:m=bt709:r=tv,format=yuv420p,crop=1080:1350:0:250,scale=576:720" -c:v libx264 -crf 24 -movflags +faststart
export const PAIN_MEDIA = { src: '/s5v2/shake.mp4?v=1', poster: '/s5v2/shake.jpg?v=1' };

// 후기 정렬(v2) — "함께해서 꾸준히 할 수 있었다"를 1순위로 (가인 2026-09-19).
// 바로 앞 공감 섹션이 "혼자 했기 때문이야 → 같이 하면 결국 하게 돼"라서, 후기가 그 말을 증언하게 한다.
// 점수는 합산: 함께 + 꾸준이 둘 다 있는 후기가 맨 앞. (v1 기본은 "초보도 됐다" 우선)
export const TESTIMONIAL_SIGNALS_V2 = [
  { score: 5, re: /함께|같이|팀원|팀\s?분|혼자가\s?아닌|으쌰|여러분|응원|다독|코치님/ },
  { score: 4, re: /꾸준|매일|습관|끝까지|쌓이|아니었으면|핑계|변명/ },
  { score: 2, re: /초보|처음|못\s?뛰|안\s?뛰|뛰기(가)?\s?너무\s?싫|싫은데|절대|100미터/ },
  { score: 1, re: /\d+\s?(키로|km|킬로)|\d+\s?분대|페이스|지구력|체력|근육량|인바디/ },
];
