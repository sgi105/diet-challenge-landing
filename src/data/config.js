// 마감/혜택 만료 같은 시점 데이터는 KST(+09:00) 명시 필수.
// 오프셋 없는 ISO 문자열은 브라우저 로컬 타임존으로 파싱돼서 viewer마다 다른 순간을 가리킴.
export const COHORT = {
  applyOpenAt: '2026-05-25T18:00:00+09:00',
  startDate: '2026-06-01',
  deadline: '2026-05-29T00:00:00+09:00', // UI 표기 "5/28(목) 23:59" — 실제 마감은 5/29 00:00 KST (사용자 1분 여유)
  referralDeadline: '2026-05-29T00:00:00+09:00',
  otDate: '2026-05-31',
  finalDate: '2026-06-21',
  totalSpots: 30,
  filledSpots: 0,
  dDayBenefitExpireAt: '2026-05-27T23:59:59+09:00',
  // 첫날 신청 보너스: 오픈(2026-05-25 18:00 KST) ~ 2026-05-26 23:59 KST 한정 + 1만원 환급
  firstDayBonusExpireAt: '2026-05-26T00:00:00+09:00',
  firstDayBonusAmount: 10000,
};

export const PROGRAM = {
  deposit: 200000,
  rewardSolo: 200000,
  rewardTeam: 220000,
  rewardTeam1st: 220000,
  rewardTeam1stShoesValue: 150000,
  durationDays: 21,
  missionRate: 90,
  totalPrize: 1050000,
  teamSize: 3,
  teamCount: 10,
  finalDistanceKm: 5,
  rewardGrandPrize: 'bali_ticket',
  grandPrizeLabel: '발리 왕복 항공권',
};
