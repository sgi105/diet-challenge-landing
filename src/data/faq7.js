// 261130_team_run_season7 FAQ — 90일 하프 프로그램의 첫 28일 = 1만원 체험(참가비 · 환급 없음)
// · 5인 1팀 · 하루 10분 이상이면 성공(권장 5-25분, 마지막 주 디로딩) · 선발 없음.
// 보증금·환급·몰수 표현은 쓰지 않는다(PG 정책). 날짜·숫자는 season7.js 에서 가져온다.
import { COHORT7, PROGRAM7, REFUND7 } from './season7';

const D = COHORT7.trialDays; // 28일 체험

export const faqItems = [
  {
    question: `왜 ${PROGRAM7.feeLabel}이에요?`,
    answer: `90일 하프마라톤 프로그램의 첫 ${D}일을 ${PROGRAM7.feeLabel}에 해보는 체험이야. 레벨 맞춤 프로그램, 팀 배정, 단톡방, 주간 라이브 점검까지 본 프로그램이랑 똑같이 들어가.`,
  },
  {
    question: `${D}일 끝나면 자동으로 결제돼요?`,
    answer: `아니. 자동 결제 없어. ${D}일 해보고 90일 하프마라톤 프로그램까지 이어가고 싶은 사람만 따로 신청하면 돼. 안 이어가도 아무 일 없어.`,
  },
  {
    question: '헬스장 가야 해요?',
    answer: `아니. 처음 ${D}일은 러닝 습관만 만들고, ${COHORT7.strengthStart}부터 매일 푸시업을 더해. 하루 5분으로 시작하고 도구도 필요 없어. 집이든 공원이든 바닥만 있으면 돼.`,
  },
  {
    question: '러닝 초보인데 가능한가요?',
    answer: `첫날은 딱 ${PROGRAM7.startMinutes}분이야. 걷다 뛰다 해도 돼. 권장 시간은 하루 1분씩 늘어서 12/20에 ${PROGRAM7.peakMinutes}분이 되는데 ${PROGRAM7.successMinutes}분만 뛰어도 그날 미션은 성공이야. OT에서 호흡법이랑 페이스 다 알려줄게.`,
  },
  {
    question: '하루에 얼마나 뛰어야 해요?',
    answer: `권장은 첫날(${COHORT7.startDate}) ${PROGRAM7.startMinutes}분에서 하루 1분씩 늘어서 12/20에 ${PROGRAM7.peakMinutes}분이야. 마지막 주는 몸 회복하라고 ${PROGRAM7.deloadMinutes}분으로 줄이고 ${COHORT7.finalDate}에 5km 테스트를 뛰어. 성공 기준은 처음부터 끝까지 ${PROGRAM7.successMinutes}분 이상. 거리도 페이스도 자유야.`,
  },
  {
    question: '직장인이라 시간이 없어요',
    answer: `하루 ${PROGRAM7.successMinutes}분이면 성공이야. 출근 전이든 점심이든 퇴근 후든 편할 때 뛰면 돼. 시간이 없는 게 아니라 걸린 게 없었던 거야.`,
  },
  {
    question: `${D}일 동안 하루도 못 빠지나요?`,
    answer: `${PROGRAM7.passCount}번까지는 봐줄게. ${COHORT7.startDate}부터 ${COHORT7.finalDate}까지 ${D}일 중 ${PROGRAM7.successDays}일만 채우면 미션 성공이야. 살다 보면 아프거나 일정 겹치는 날 있잖아. 그것까지 계산해둔 거야.`,
  },
  {
    question: '신청하면 바로 참가할 수 있나요?',
    answer: `응. 선발 없어. 참가비 ${PROGRAM7.feeLabel} 결제하면 그 자리에서 시즌7 참가가 확정돼. 정원 ${COHORT7.totalSpots}명이라 차면 그때 마감돼.`,
  },
  {
    question: '해외에서도 할 수 있어요?',
    answer: '지금은 국내 거주자만 받고 있어. 한국 휴대폰 번호로 신청해줘.',
  },
  {
    question: '일정이 어떻게 돼요?',
    answer: `${COHORT7.startDate}에 시작해서 ${COHORT7.finalDate}에 ${D}일 체험이 끝나. 온라인 OT는 ${COHORT7.otDate} ${COHORT7.otTime}이고, 단톡방은 ${COHORT7.chatInvite}에 한 번에 초대해. 하프마라톤은 90일째(${COHORT7.halfDate})야.`,
  },
  {
    question: '환불 되나요?',
    answer: `${REFUND7.fullUntil}(${COHORT7.otDate} ${COHORT7.otTime})에 말해주면 전액 환불해줄게. 시작 후 ${REFUND7.proRataDays}일 이내에 말해주면 남은 일수만큼 일할로 돌려주고, ${REFUND7.proRataDays}일이 지나면 환불은 어려워. 자세한 건 환불정책 페이지에 있어.`,
  },
  {
    question: '100% 온라인이면 어떻게 같이 뛰어요?',
    // 따옴표 안 = 참가자가 가인에게 직접 한 말(가인 2026-10-22 확인).
    answer: '앱에 매일 러닝 인증을 올리면 팀원들이 댓글로 응원해. 단톡방에서 페이스 공유하고 주간 라이브로 같이 점검해. "만나지 않았는데도 함께하는 느낌이 들어서 좋았다"는 게 직전 기수 후기야.',
  },
  {
    question: '파이널 레이스는 뭐예요?',
    answer: `${D}일째 마지막 날(${COHORT7.finalDate})에 다 같이 5km를 뛰는 거야. 어디서 뛰든 상관없어. 각자 동네에서 뛰고 기록을 올리면 돼. ${D}일 동안 쌓은 게 여기서 나와.`,
  },
];
