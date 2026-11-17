// /diet — 식단 없이 100일 애슬릿 프로그램 1:1 상담 랜딩 (가인 2026-11-17)
// 시안 SOT: design-references/diet100-landing-v2.html
// 가격(250만원)은 랜딩·미리보기·문자 어디에도 쓰지 않는다 — 상담 때만.
// 런클럽 기수(activeCohort/season7)와 무관. 신청은 diet_consults 표(diet_consult_apply 함수)로만.

export const KEYWORD = '애슬릿';

// 다이어트 영수증 — 업계 평균 시세로 계산한 예시(가인 2026-11-17).
// PT 10회 35-80만원 · 위고비 한 달 40만원대 · 한약 회당 8만원대 시세를 바탕으로 가인 제시 금액에 맞춤.
export const RECEIPT = [
  { label: 'PT 6개월 (주 2회)', amount: '300만원' },
  { label: '헬스장 5년 (반은 안 감)', amount: '300만원' },
  { label: '필라테스 · 운동 수업', amount: '200만원' },
  { label: '다이어트 보조제 · 쉐이크', amount: '200만원' },
  { label: '위고비 · 다이어트 한약', amount: '120만원' },
  { label: '식단 도시락 3개월', amount: '100만원' },
];
export const RECEIPT_TOTAL = '1,220만원';

export const AZ = [
  { icon: '🧠', title: '마인드셋', desc: '“나는 원래 안 돼”를 뿌리부터 바꾸기' },
  { icon: '📖', title: '독서', desc: '믿음을 바꾸는 책, 같이 읽고 얘기하기' },
  { icon: '✍️', title: '일지', desc: '매일 기록으로 나를 이해하기' },
  { icon: '⏱️', title: '시간 관리', desc: '시간 없다고? 시간 만드는 법까지' },
  { icon: '🏃', title: '매일 운동', desc: '내 수준에 맞춘 100일 루틴' },
  { icon: '🏆', title: '팀 · 대회', desc: '같이 준비하고 같이 나가기' },
];

// 영상 후기 3개 — 4월 다이어트 챌린지 참가자. 문구는 녹취(public/testimonials/N.txt) 원문 기준.
export const REVIEWS = [
  {
    src: '/testimonials/3.mp4#t=1',
    tag: '-5kg',
    name: '한혜진',
    quote: ['“맨날 운동? 제 인생에', '절대 있을 수 없는 일', '이었어요”'],
    who: '한혜진 · 프리랜서 · 75.8kg → 70.3kg',
  },
  {
    src: '/testimonials/1.mp4',
    poster: '/testimonials/1.jpg',
    tag: '체지방 +15kg에서 시작',
    name: '고우빈',
    quote: ['“저녁 열한 시에 침대에서 일어나', '양재천으로 미친듯이 뛰어', ' 나가요”'],
    who: '고우빈 · 스타트업 운영 · 6개월간 체지방 15kg 증가 후 참가',
  },
  {
    src: '/testimonials/2.mp4#t=1',
    tag: '루틴 생김',
    name: '김지원',
    quote: ['“만나는 사람마다', '왜 이렇게 홀쭉해졌냐고', '”'],
    who: '김지원 · 매일 계단 100층 루틴',
  },
];

// 상담 신청서 — 한 화면에 한 질문. 하나만 고르는 질문도 '다음'을 눌러야 넘어간다(가인 2026-11-17).
// value 는 DB에 그대로 저장되는 값(문자에도 그대로 나감).
export const SPENT_ITEMS = ['PT · 헬스장', '필라테스 · 요가', '식단 도시락 · 쉐이크', '한약 · 약 · 보조제', '주사 · 시술'];

export const QUESTIONS = [
  { key: 'gender', type: 'single', layout: 'two', title: '성별이 어떻게 돼?',
    options: [{ label: '여성', value: 'female' }, { label: '남성', value: 'male' }] },
  { key: 'age', type: 'number', title: '나이는?', hint: '만 나이 말고 그냥 지금 나이', placeholder: '예) 32' },
  { key: 'spentRange', type: 'single', title: ['여태까지 다이어트에', '쓴 돈, 대충 얼마야?'], hint: '아래 전부 합쳐서. 정확하지 않아도 돼',
    chips: SPENT_ITEMS,
    options: ['100만원 미만', '100만 - 300만원', '300만 - 500만원', '500만 - 1,000만원', '1,000만원 이상'] },
  { key: 'spentOn', type: 'multi', title: '어디에 돈 써봤어?', hint: '해당하는 거 다 골라줘', options: SPENT_ITEMS },
  { key: 'tried', type: 'multi', title: '여태 해본 다이어트 방법은?', hint: '해당하는 거 다 골라줘',
    options: ['식단 조절 · 단식', '혼자 헬스 · 홈트', '러닝', '그룹 운동 · 챌린지'] },
  { key: 'hardest', type: 'single', title: ['그중에 뭐가', '제일 어려웠어?'], hint: '딱 하나만',
    options: ['꾸준히 하기 (작심삼일)', '먹고 싶은 거 참기', '시간이 없음', '혼자라 동기가 안 생김', '빼고 나서 요요'] },
  { key: 'worry', type: 'text', title: ['가장 궁금하거나 걱정되는 거', '딱 하나만 적어줘'], hint: '“나 같은 사람도 될까?” 이런 것도 좋아', placeholder: '편하게 적어줘' },
  { key: 'name', type: 'name', title: '뭐라고 부르면 돼?', hint: '연락할 때 부를 이름', placeholder: '이름' },
  { key: 'phone', type: 'phone', title: '연락 받을 번호', hint: '내가 확인하고 이 번호로 직접 연락할게' },
];
