// 261019_team_run_season6 FAQ — 28일 · 5인 1팀 · 하루 10분 이상이면 성공(권장 10-25분, 마지막 주 디로딩)
// · 참가비 무료 · 보증금 1만원(28일 중 25일 + 파이널 5K → 전액 환급) · 선발 없음 · 팀 상금 없음.
// 날짜·숫자는 season6.js 에서 가져온다.
import { COHORT6, PROGRAM6 } from './season6';

const D = COHORT6.trialDays; // 신규 기준 무료 체험 25일

export const faqItems = [
  {
    question: `무료인데 보증금 ${PROGRAM6.depositLabel}은 왜 받아요?`,
    answer: `${D}일 체험은 진짜 무료야. 근데 공짜면 아무도 안 뛰어. 돈이 걸려야 제대로 하거든. 못 뛴 날 ${PROGRAM6.passCount}번 빼고 매일 인증하고 마지막 날 5km 테스트까지 뛰면 보증금 ${PROGRAM6.depositLabel} 전액 돌려줄게.`,
  },
  {
    question: '무료 체험 끝나면 자동으로 결제돼요?',
    answer: '아니. 자동 결제 없어. 25일 해보고 90일 하프마라톤 프로그램까지 이어가고 싶은 사람만 따로 신청하면 돼. 안 이어가도 아무 일 없어.',
  },
  {
    question: '헬스장 가야 해요?',
    answer: `아니. 처음 ${D}일은 러닝 습관만 만들고, ${COHORT6.strengthStart}부터 매일 푸시업을 더해. 하루 5분으로 시작하고 도구도 필요 없어. 집이든 공원이든 바닥만 있으면 돼.`,
  },
  {
    question: '러닝 초보인데 가능한가요?',
    answer: `첫날은 딱 ${PROGRAM6.joinStartMinutes}분이야. 걷다 뛰다 해도 돼. 권장 시간은 하루 1분씩 늘어서 11/15에 ${PROGRAM6.peakMinutes}분이 되는데 ${PROGRAM6.successMinutes}분만 뛰어도 그날 미션은 성공이야. OT에서 호흡법이랑 페이스 다 알려줄게.`,
  },
  {
    question: '하루에 얼마나 뛰어야 해요?',
    answer: `권장은 첫날(${COHORT6.startDate}) ${PROGRAM6.joinStartMinutes}분에서 하루 1분씩 늘어서 11/15에 ${PROGRAM6.peakMinutes}분이야. 마지막 주는 몸 회복하라고 ${PROGRAM6.deloadMinutes}분으로 줄이고 ${COHORT6.finalDate}에 5km 테스트를 뛰어. 성공 기준은 처음부터 끝까지 ${PROGRAM6.successMinutes}분 이상. 거리도 페이스도 자유야.`,
  },
  {
    question: '직장인이라 시간이 없어요',
    answer: `하루 ${PROGRAM6.successMinutes}분이면 성공이야. 출근 전이든 점심이든 퇴근 후든 편할 때 뛰면 돼. 시간이 없는 게 아니라 걸린 게 없었던 거야.`,
  },
  {
    question: `${D}일 동안 하루도 못 빠지나요?`,
    answer: `${PROGRAM6.passCount}번까지는 봐줄게. ${COHORT6.startDate} 합류부터 ${COHORT6.finalDate}까지 ${PROGRAM6.joinDays}일 중 ${PROGRAM6.joinSuccessDays}일만 채우면 돼. 살다 보면 아프거나 일정 겹치는 날 있잖아. 그것까지 계산해둔 거야.`,
  },
  {
    question: '신청하면 바로 참가할 수 있나요?',
    answer: `응. 선발 없어. 신청서 쓰고 보증금 결제하면 그 자리에서 무료 체험 시작이 확정돼. 정원 ${COHORT6.totalSpots}명이라 차면 그때 마감돼. 마감은 ${COHORT6.deadlineLabel}.`,
  },
  {
    question: '해외에서도 할 수 있어요?',
    answer: '지금은 국내 거주자만 받고 있어. 한국 휴대폰 번호로 신청해줘.',
  },
  {
    question: '일정이 어떻게 돼요?',
    answer: `모집은 ${COHORT6.deadlineLabel}까지야. 온라인 OT는 ${COHORT6.otDate} ${COHORT6.otTime}이고, 단톡방은 모집 마감 후 한 번에 초대해. 하프마라톤은 90일째야.`,
  },
  {
    question: '환불 되나요?',
    answer: `OT(${COHORT6.otDate}) 전까지 말해주면 보증금 전액 환불해줄게. OT 이후엔 끝까지 해내야 돌려받을 수 있어.`,
  },
  {
    question: '100% 온라인이면 어떻게 같이 뛰어요?',
    // 따옴표 안 = 참가자가 가인에게 직접 한 말(가인 2026-10-22 확인). 예전 FAQ의 "오프라인에서 만난 적 없는데 가장 가깝게 느껴진다"는 이 말을 각색한 것이라 원래 표현으로 되돌렸다.
    answer: '앱에 매일 러닝 인증을 올리면 팀원들이 댓글로 응원해. 단톡방에서 페이스 공유하고 주간 라이브로 같이 점검해. "만나지 않았는데도 함께하는 느낌이 들어서 좋았다"는 게 직전 기수 후기야.',
  },
  {
    question: '파이널 레이스는 뭐예요?',
    answer: `${D}일째 마지막 날에 다 같이 5km를 뛰는 거야. 어디서 뛰든 상관없어. 각자 동네에서 뛰고 기록을 올리면 돼. ${D}일 동안 쌓은 게 여기서 나와.`,
  },
];
