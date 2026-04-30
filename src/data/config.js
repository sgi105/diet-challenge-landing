// 마감/혜택 만료 같은 시점 데이터는 KST(+09:00) 명시 필수.
// 오프셋 없는 ISO 문자열은 브라우저 로컬 타임존으로 파싱돼서 viewer마다 다른 순간을 가리킴.
export const COHORT = {
  startDate: '2026-05-04',
  deadline: '2026-04-27T23:59:59+09:00',
  referralDeadline: '2026-04-28T14:00:00+09:00',
  otDate: '2026-05-03',
  finalDate: '2026-05-31',
  totalSpots: 30,
  filledSpots: 0,
  dDayBenefitExpireAt: '2026-04-26T23:59:59+09:00',
};

export const PROGRAM = {
  deposit: 200000,
  rewardSolo: 200000,
  rewardTeam: 240000,
  rewardTeam1st: 400000,
  durationWeeks: 4,
  missionRate: 90,
  totalPrize: 1680000,
  teamSize: 3,
  teamCount: 10,
  finalDistanceKm: 5,
};
