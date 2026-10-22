// 페이앱 결제창 호출 — 지원서 참가비 카드 결제.
//
// 페이앱 JS(payapp-lite.js)는 결국 lite.payapp.kr/pay 로 hidden form 을 POST 하는 게 전부라
// (jQuery 포함 95KB) 스크립트 없이 같은 폼을 직접 만들어 현재 창(_self)으로 보낸다.
// 모바일 인앱 브라우저에서 팝업이 막히는 문제도 같이 피한다.
//
// 결제 결과의 정본은 서버 통보(Edge Function payapp-feedback)다. returnurl 로 돌아온 화면은
// DB 에 반영됐는지만 확인해서 보여준다.
//
// env:
//   VITE_PAYAPP_USERID   비우면 실계정(sgi105). 로컬 테스트는 payapptest 로 — 테스트 결제는 몇 분 뒤 자동 취소된다.

import { ACTIVE } from '../data/activeCohort';

const PAY_URL = 'https://lite.payapp.kr/pay';
const USERID = import.meta.env.VITE_PAYAPP_USERID || 'sgi105';
const FEEDBACK_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/payapp-feedback`;

// 카드 + 간편결제만. 계좌이체·가상계좌·휴대폰은 뺀다(즉시 결제 확정 + 픽셀 구매 이벤트 일원화).
const PAY_TYPES = 'card,kakaopay,naverpay,tosspay,payco,applepay,smilepay';

export const PAYAPP_IS_TEST = USERID === 'payapptest';

export function startPayment({ applicationId, phone, name }) {
  const params = {
    userid: USERID,
    shopname: '무사 SAMURAI',
    goodname: ACTIVE.feeGoodName || '21일 팀 러닝 챌린지 참가비',
    price: String(ACTIVE.fee),
    recvphone: String(phone || '').replace(/\D/g, ''),
    memo: name ? `${name} 님 참가 신청` : '',
    openpaytype: PAY_TYPES,
    var1: applicationId,
    feedbackurl: FEEDBACK_URL,
    checkretry: 'y',
    returnurl: `${window.location.origin}/apply/paid?id=${applicationId}`,
    redirect: 'self',
    redirecturl: `${window.location.origin}/apply/paid?id=${applicationId}`,
    skip_cstpage: 'y',
    smsuse: 'n',
    redirectpay: '1',
  };

  const form = document.createElement('form');
  form.method = 'post';
  form.action = PAY_URL;
  form.target = '_self';
  form.acceptCharset = 'utf-8';
  for (const [k, v] of Object.entries(params)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
