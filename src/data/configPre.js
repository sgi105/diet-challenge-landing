// 시즌3 프리시즌 — "작심삼일: 3일 만에 뿌시기 챌린지" 무료 프리시즌 설정 SOT.
// 본편(260727 시즌3, 유료) 앞에 진행하는 무료 3일 챌린지.
// 랜딩·신청 카피 / 일정 / 미션 스킴 / 보상 / 톡방 링크의 단일 출처.
export const PRESEASON = {
  cohortCode: '260723_pre_run_3d',
  isFree: true,          // 결제·보증금 없음
  teamSize: 5,           // 5인 1팀

  title: '작심삼일: 3일 만에 뿌시기 챌린지',
  subs: [
    '무료 · 보증금 없음',
    '10 - 11 - 12분, 매일 조금씩 뛰면 성공',
    '5인 1팀, 팀 전원 완주하면 전원 스타벅스 기프티콘',
  ],

  // 3일 미션 스킴 — 시간만 채우면 성공(페이스·거리 자유). 요일 검증 완료.
  missions: [
    { day: 1, date: '7/23', weekday: '목', minutes: 10 },
    { day: 2, date: '7/24', weekday: '금', minutes: 11 },
    { day: 3, date: '7/25', weekday: '토', minutes: 12 },
  ],

  // 마지막 날(Day 3) 아침 파이널 이벤트 — 다같이 마지막 러닝 + 완주 축하.
  finale: { date: '7/25', weekday: '토', time: '오전 7시', label: '파이널 이벤트' },

  startLabel: '7/23(목) 시작',

  // 보상: 팀 5명 전원 3일 완주 시 → 전원 스타벅스 기프티콘 (개인 아님, 팀 전원 조건).
  rewardHeadline: '팀 전원 완주하면, 전원 스타벅스',
  rewardText: '5인 1팀 — 팀원 5명이 모두 3일을 완주하면 팀 전원에게 스타벅스 기프티콘을 쏜다.',

  // 완료 페이지 CTA — 인스타 톡방 입장 링크.
  TALK_LINK: 'https://ig.me/j/AbbPoz-hk6k6Q_TP/',
};

export default PRESEASON;
