// 하프 연장(1000 런클럽 시즌6) 결제 — /half/pay 페이지 전용 서버.
//   action=lookup  : 결제 대상 찾기 (u = 앱 user_id, 또는 phone)
//   action=confirm : 금액·상태 대조 → 토스 결제 승인 → half_s6_mark_toss (paid_at = 승인 시각, 확정 메시지 자동)
// 금액은 DB(half_orders_s6.amount)가 정한다. 이미 결제됐거나 마감이 지난 신청은 승인 전에 막는다(고객 카드는 청구 안 됨).
// env: TOSS_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, META_CAPI_INTERNAL_SECRET(텔레그램 알림)
export const config = { runtime: 'edge', regions: ['icn1'] }; // 토스 API 키 = 국내 IP만

const DOCS_TEST_SECRET_KEY = 'test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6';
const GRACE_MS = 10 * 60 * 1000; // 자정 직전에 결제창을 연 사람 — 승인 요청이 자정을 조금 넘겨도 받는다
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

async function rpc(fn, args) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`${fn} ${res.status} ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

async function lookup(u, phone) {
  const args = { p_uid: UUID_RE.test(String(u || '')) ? u : null, p_phone: phone ? String(phone).slice(0, 20) : null };
  return rpc('half_s6_pay_lookup', args);
}

// 페이지에 보여줄 것만 (이름은 가운데 가림)
function publicView(o) {
  if (!o?.found) return { found: false, reason: o?.reason || 'no_order' };
  const n = String(o.name || '');
  const masked = n.length <= 1 ? n : n.length === 2 ? `${n[0]}*` : `${n[0]}${'*'.repeat(n.length - 2)}${n[n.length - 1]}`;
  return { found: true, uid: o.uid, name: masked, amount: o.amount, paid: o.paid, cancelled: o.cancelled, live: o.live, deadline: o.deadline, seat_no: o.seat_no, phase: o.phase };
}

async function notify(payload) {
  const url = process.env.SUPABASE_URL;
  const secret = process.env.META_CAPI_INTERNAL_SECRET;
  if (!url || !secret) return 'skipped';
  try {
    const r = await fetch(`${url}/functions/v1/toss-paid-notify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-internal-secret': secret }, body: JSON.stringify(payload),
    });
    return r.ok ? 'ok' : 'failed';
  } catch { return 'failed'; }
}

async function recordOrder(row) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  try {
    const r = await fetch(`${url}/rest/v1/toss_orders`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(row),
    });
    return r.ok ? 'ok' : 'failed';
  } catch { return 'failed'; }
}

export default async function handler(req) {
  if (req.method !== 'POST') return json(405, { ok: false, message: 'POST only' });
  let b;
  try { b = await req.json(); } catch { return json(400, { ok: false, message: 'bad json' }); }

  if (b?.action === 'lookup') {
    try { return json(200, { ok: true, order: publicView(await lookup(b.u, b.phone)) }); }
    catch (e) { console.error(e); return json(500, { ok: false, message: '신청 정보를 불러오지 못했어요' }); }
  }
  if (b?.action !== 'confirm') return json(400, { ok: false, message: 'bad action' });

  const { u, paymentKey, orderId } = b;
  const amount = Number(b.amount);
  if (!UUID_RE.test(String(u || '')) || !paymentKey || !/^half6-[A-Za-z0-9_-]{6,58}$/.test(String(orderId || ''))) {
    return json(400, { ok: false, message: '결제 정보가 올바르지 않아요. 결제는 승인되지 않았어요.' });
  }
  let o;
  try { o = await lookup(u, null); } catch (e) { console.error(e); return json(500, { ok: false, message: '신청 정보를 불러오지 못했어요. 결제는 승인되지 않았어요.' }); }
  if (!o?.found) return json(404, { ok: false, message: '하프 신청 내역을 찾지 못했어요. 결제는 승인되지 않았어요.' });
  if (o.paid) return json(409, { ok: false, code: 'ALREADY_PAID', message: '이미 결제가 확인된 신청이에요. 이번 결제는 승인되지 않았어요.' });
  if (o.cancelled) return json(409, { ok: false, message: '취소된 신청이에요. 결제는 승인되지 않았어요.' });
  if (!(o.amount > 0) || amount !== o.amount) return json(400, { ok: false, message: '결제 금액이 신청 금액과 달라요. 결제는 승인되지 않았어요.' });
  if (Date.now() > new Date(o.deadline).getTime() + GRACE_MS) {
    return json(409, { ok: false, code: 'EXPIRED', message: '결제 마감(신청한 날 자정)이 지났어요. 결제는 승인되지 않았어요. 앱에서 다시 신청해줘.' });
  }

  const secret = process.env.TOSS_SECRET_KEY || DOCS_TEST_SECRET_KEY;
  const isTest = secret.startsWith('test_');
  const res = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${secret}:`)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentKey, orderId, amount: o.amount }),
  });
  const pay = await res.json().catch(() => ({}));
  if (!res.ok) return json(res.status, { ok: false, code: pay.code, message: pay.message || '결제 승인 실패' });

  let marked = { updated: false };
  if (pay.status === 'DONE') {
    try {
      marked = await rpc('half_s6_mark_toss', {
        p_uid: u, p_order_id: pay.orderId, p_payment_key: paymentKey, p_amount: pay.totalAmount,
        p_approved_at: pay.approvedAt, p_method: pay.easyPay?.provider ? `${pay.method}(${pay.easyPay.provider})` : pay.method,
      });
    } catch (e) { console.error('mark failed', e); marked = { updated: false, error: true }; }
  }
  const recorded = await recordOrder({
    order_id: pay.orderId, payment_key: paymentKey, cohort_code: 'half_s6', amount: pay.totalAmount, status: pay.status,
    method: pay.method, name: String(o.name || '').slice(0, 50), phone: String(o.phone || '').slice(0, 11), is_test: isTest,
    approved_at: pay.approvedAt, raw: pay,
  });
  const notified = isTest ? 'skipped' : await notify({
    product: 'half_s6', kind: 'paid', name: o.name, phone: o.phone, amount: pay.totalAmount, method: pay.method,
    provider: pay.easyPay?.provider || pay.card?.issuerCode || '', approvedAt: pay.approvedAt, orderId: pay.orderId,
    meta: marked.updated ? '하프 확정 자동 반영' : '⚠️ 자동 확정 실패 — /half-orders 에서 직접 확인',
  });

  return json(200, {
    ok: true, status: pay.status, method: pay.method, totalAmount: pay.totalAmount, approvedAt: pay.approvedAt,
    orderId: pay.orderId, receiptUrl: pay.receipt?.url || null, confirmed: !!marked.updated, seat_no: marked.seat_no ?? null,
    recorded, notified,
  });
}
