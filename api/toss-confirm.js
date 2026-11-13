// 토스페이먼츠 결제 승인 — /s7/join 결제의 정본.
// 1) 금액을 서버 상수(PROGRAM7.fee)와 대조 → 2) 토스 결제 승인 API 호출 → 3) (env 있으면) toss_orders 에 기록.
//
// env (Vercel):
//   TOSS_SECRET_KEY            주문서형 연동 시크릿 키. 없으면 토스 문서의 공개 테스트 시크릿 키(테스트 결제만 가능).
//   SUPABASE_URL               기록용 — 없으면 기록은 건너뛴다(테스트 단계).
//   SUPABASE_SERVICE_ROLE_KEY  기록용 서버 키
//   META_CAPI_INTERNAL_SECRET  메타 전환(Purchase) 서버 전송용 — Supabase meta-capi 함수의 INTERNAL_CAPI_SECRET 과 같은 값.
//                              실결제(라이브 키)·결제완료(DONE)일 때만 보낸다. 같은 시크릿으로 toss-paid-notify(텔레그램 알림)도 호출. event_id = toss-<orderId> (결제 완료 화면 픽셀과 같은 값 → 메타가 한 건으로 합침)
// 실결제 전환 체크리스트: TOSS_SECRET_KEY/VITE_TOSS_CLIENT_KEY 를 라이브 키로 · toss_orders 마이그레이션 적용 · 위 Supabase env 설정.
import { PROGRAM7, COHORT7 } from '../src/data/season7.js';

// 토스 API 키 접근 정책(기본: 대한민국 IP만 허용) 때문에 서울 리전에서만 실행한다. 다른 리전(예: 싱가포르)에서 호출하면 승인 거절됨 (2026-11-11 확인).
export const config = { runtime: 'edge', regions: ['icn1'] };

const DOCS_TEST_SECRET_KEY = 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6';

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

// 메타 Conversions API 로 Purchase 1건(서버 전송). 실패해도 결제 흐름은 막지 않는다.
async function sendMetaPurchase({ orderId, amount, phone, fbp, fbc, clientIp, clientUa, sourceUrl }) {
  const url = process.env.SUPABASE_URL;
  const secret = process.env.META_CAPI_INTERNAL_SECRET;
  if (!url || !secret) return 'skipped';
  try {
    const res = await fetch(`${url}/functions/v1/meta-capi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
      body: JSON.stringify({
        event_name: 'Purchase',
        event_id: `toss-${orderId}`,
        event_source_url: sourceUrl,
        phone, phone_country: 'KR',
        fbp, fbc,
        client_ip: clientIp, client_ua: clientUa,
        custom_data: { currency: 'KRW', value: amount, content_name: 's7_fee' },
      }),
    });
    if (!res.ok) console.error('meta purchase failed', res.status, (await res.text()).slice(0, 300));
    return res.ok ? 'ok' : 'failed';
  } catch (e) {
    console.error('meta purchase error', String(e));
    return 'failed';
  }
}

// 이번 기수 결제 인원(DB count_applicants_public — 랜딩 남은 자리와 같은 기준). 실패하면 null.
async function paidCount(cohortCode) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/count_applicants_public`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_cohort: cohortCode }),
    });
    if (!res.ok) return null;
    const n = Number(await res.json());
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// 텔레그램 결제 알림(Supabase toss-paid-notify). 실패해도 결제 흐름은 막지 않는다.
async function notifyTelegram(payload) {
  const url = process.env.SUPABASE_URL;
  const secret = process.env.META_CAPI_INTERNAL_SECRET;
  if (!url || !secret) return 'skipped';
  try {
    const res = await fetch(`${url}/functions/v1/toss-paid-notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret },
      body: JSON.stringify(payload),
    });
    return res.ok ? 'ok' : 'failed';
  } catch {
    return 'failed';
  }
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
  const { paymentKey, orderId, amount, name, phone, cohortCode, fbp, fbc, sourceUrl } = body || {};
  if (!paymentKey || !orderId) return json(400, { ok: false, message: '결제 정보 누락' });
  if (Number(amount) !== PROGRAM7.fee) return json(400, { ok: false, message: '결제 금액이 상품 금액과 달라요' });

  const secret = process.env.TOSS_SECRET_KEY || DOCS_TEST_SECRET_KEY;

  // 정원 체크(실결제만) — 승인 전에 막으면 고객 카드는 청구되지 않는다(인증만 된 결제는 자동 소멸).
  if (!secret.startsWith('test_')) {
    const n = await paidCount(String(cohortCode || COHORT7.cohortCode).slice(0, 64));
    if (n !== null && n >= COHORT7.totalSpots) {
      return json(409, { ok: false, code: 'SOLD_OUT', message: `정원(${COHORT7.totalSpots}명)이 마감됐어요. 결제는 진행되지 않았어요.` });
    }
  }
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

  // 실결제(라이브)이고 결제 완료(DONE)인 건만 메타에 구매로 보낸다. 테스트 키·가상계좌 입금 대기는 제외.
  const meta = (!secret.startsWith('test_') && pay.status === 'DONE')
    ? await sendMetaPurchase({
        orderId: pay.orderId,
        amount: pay.totalAmount,
        phone: String(phone || '').replace(/\D/g, '').slice(0, 11),
        fbp: typeof fbp === 'string' ? fbp.slice(0, 200) : undefined,
        fbc: typeof fbc === 'string' ? fbc.slice(0, 500) : undefined,
        clientIp: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || undefined,
        clientUa: req.headers.get('user-agent') || undefined,
        sourceUrl: typeof sourceUrl === 'string' ? sourceUrl.slice(0, 1000) : undefined,
      })
    : 'skipped';

  // 실결제만 텔레그램 알림(결제 완료 또는 가상계좌 입금 대기). 테스트 키 결제는 알리지 않는다.
  let notified = 'skipped';
  if (!secret.startsWith('test_') && (pay.status === 'DONE' || pay.status === 'WAITING_FOR_DEPOSIT')) {
    const cohort = String(cohortCode || COHORT7.cohortCode).slice(0, 64);
    notified = await notifyTelegram({
      kind: pay.status === 'DONE' ? 'paid' : 'waiting',
      name: String(name || '').slice(0, 50),
      phone: String(phone || '').replace(/\D/g, '').slice(0, 11),
      amount: pay.totalAmount,
      method: pay.method,
      provider: pay.easyPay?.provider || pay.card?.issuerCode || '',
      approvedAt: pay.approvedAt || pay.requestedAt,
      orderId: pay.orderId,
      paidCount: await paidCount(cohort),
      capacity: COHORT7.totalSpots,
      meta,
    });
  }

  return json(200, {
    ok: true,
    meta,
    notified,
    orderId: pay.orderId,
    status: pay.status,
    method: pay.method,
    totalAmount: pay.totalAmount,
    approvedAt: pay.approvedAt,
    receiptUrl: pay.receipt?.url || null,
    // 가상계좌: 승인 시점엔 WAITING_FOR_DEPOSIT(입금 대기). 입금돼야 DONE.
    virtualAccount: pay.virtualAccount ? { bankCode: pay.virtualAccount.bankCode, accountNumber: pay.virtualAccount.accountNumber, dueDate: pay.virtualAccount.dueDate, customerName: pay.virtualAccount.customerName } : null,
    recorded,
  });
}
