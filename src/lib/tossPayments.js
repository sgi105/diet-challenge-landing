// 토스페이먼츠 결제위젯(v2, 주문서형) — 시즌7 참가비 결제(/s7/join).
//
// 키: 개발자센터 > API 키 > "주문서형, 결제창형 연동 키".
//   VITE_TOSS_CLIENT_KEY  (클라이언트 키, 공개돼도 됨)
//   TOSS_SECRET_KEY       (서버 전용 · Vercel env · api/toss-confirm.js 에서만 쓴다. 절대 VITE_ 로 두지 말 것)
// 계약 전에는 테스트 키(test_gck_...)를 쓴다 — 결제가 가상으로만 이뤄지고 돈이 빠지지 않는다.
// env 가 없으면 토스 공식 문서의 공개 샘플 테스트 키로 동작한다(미리보기·심사 준비용).
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

export const DOCS_TEST_CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';
export const TOSS_CLIENT_KEY = import.meta.env.VITE_TOSS_CLIENT_KEY || DOCS_TEST_CLIENT_KEY;
export const TOSS_IS_TEST = TOSS_CLIENT_KEY.startsWith('test_');

export async function createWidgets() {
  const toss = await loadTossPayments(TOSS_CLIENT_KEY);
  // 비회원 결제 — 카드사 심사 요건(회원가입 없이 결제 가능)
  return toss.widgets({ customerKey: ANONYMOUS });
}

export function newOrderId(cohortCode) {
  // 토스 orderId 규칙: 6-64자, 영문·숫자·-·_ 만.
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return `${cohortCode.slice(0, 20)}-${rand}`;
}
