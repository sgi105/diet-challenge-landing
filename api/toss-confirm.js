// 토스페이먼츠 결제 승인 — /s7/join 결제의 정본.
// 1) 금액을 서버 상수(PROGRAM7.fee)와 대조 → 2) 토스 결제 승인 API 호출 → 3) (env 있으면) toss_orders 에 기록.
//
// env (Vercel):
//   TOSS_SECRET_KEY            주문서형 연동 시크릿 키. 없으면 토스 문서의 공개 테스트 시크릿 키(테스트 결제만 가능).
//   SUPABASE_URL               기록용 — 없으면 기록은 건너뛴다(테스트 단계).
//   SUPABASE_SERVICE_ROLE_KEY  기록용 서버 키
// 실결제 전환 체크리스트: TOSS_SECRET_KEY/VITE_TOSS_CLIENT_KEY 를 라이브 키로 · toss_orders 마이그레이션 적용 · 위 Supabase env 설정.
import { PROGRAM7 } from '../src/data/season7.js';

export const config = { runtime: 'edge' };

const DOCS_TEST_SECRET_KEY = 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6';

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function record(row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return 'skipped';
  const res = await fetch(`${url}/rest/v1/toss_orders`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
    body: JSON.stringify(row),
  });
  if (!res.ok) console.error('toss_orders insert failed', res.status, (await res.text()).slice(0, 300));
  return res.ok ? 'ok' : 'failed';
}

export default async function handler(req) {
  if (req.method !== 'POST') return json(405, { ok: false, message: 'POST only' });
  let body;
  try { body = await req.json(); } catch { return json(400, { ok: false, message: 'bad json' }); }
  const { paymentKey, orderId, amount, name, phone, cohortCode } = body || {};
  if (!paymentKey || !orderId) return json(400, { ok: false, message: '결제 정보 누락' });
  if (Number(amount) !== PROGRAM7.fee) return json(400, { ok: false, message: '결제 금액이 상품 금액과 달라요' });

  const secret = process.env.TOSS_SECRET_KEY || DOCS_TEST_SECRET_KEY;
  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${secret}:`)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentKey, orderId, amount: PROGRAM7.fee }),
  });
  const pay = await res.json().catch(() => ({}));
  if (!res.ok) return json(res.status, { ok: false, code: pay.code, message: pay.message || '결제 승인 실패' });

  const recorded = await record({
    order_id: orderId,
    payment_key: paymentKey,
    cohort_code: String(cohortCode || '').slice(0, 64),
    amount: pay.totalAmount,
    status: pay.status,
    method: pay.method,
    name: String(name || '').slice(0, 50),
    phone: String(phone || '').replace(/\D/g, '').slice(0, 11),
    is_test: secret.startsWith('test_'),
    approved_at: pay.approvedAt,
    raw: pay,
  });

  return json(200, {
    ok: true,
    orderId: pay.orderId,
    status: pay.status,
    method: pay.method,
    totalAmount: pay.totalAmount,
    approvedAt: pay.approvedAt,
    receiptUrl: pay.receipt?.url || null,
    recorded,
  });
}
