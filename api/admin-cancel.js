// 운영자 전용 — 테스트 결제 취소 (서울 리전에서 토스 취소 API 호출).
// 토스 API 키는 국내 IP·허용 IP에서만 동작해서 상점관리자에 못 들어갈 때(해외) 쓰는 비상용.
// 헤더 x-admin-token = ADMIN_CANCEL_TOKEN(env). 안전장치: toss_orders 에 있는 주문만, 1만원 이하만.
export const config = { runtime: 'edge', regions: ['icn1'] };

const json = (s, b) => new Response(JSON.stringify(b), { status: s, headers: { 'Content-Type': 'application/json' } });

export default async function handler(req) {
  const token = process.env.ADMIN_CANCEL_TOKEN;
  if (req.method !== 'POST' || !token || req.headers.get('x-admin-token') !== token) return json(404, { ok: false });
  const { orderId, reason } = await req.json().catch(() => ({}));
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetch(`${url}/rest/v1/toss_orders?order_id=eq.${encodeURIComponent(String(orderId || ''))}&select=order_id,payment_key,amount,status`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const rows = await r.json().catch(() => []);
  const o = rows?.[0];
  if (!o) return json(404, { ok: false, message: 'order not found' });
  if (Number(o.amount) > 10000) return json(400, { ok: false, message: 'amount too large for this endpoint' });
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(o.payment_key)}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${process.env.TOSS_SECRET_KEY}:`)}`, 'Content-Type': 'application/json', 'Idempotency-Key': `cancel-${o.order_id}` },
    body: JSON.stringify({ cancelReason: String(reason || '테스트 결제 취소').slice(0, 200) }),
  });
  const pay = await res.json().catch(() => ({}));
  if (res.ok) {
    await fetch(`${url}/rest/v1/toss_orders?order_id=eq.${encodeURIComponent(o.order_id)}`, {
      method: 'PATCH',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: pay.status, raw: pay }),
    });
  }
  return json(res.status, { ok: res.ok, status: pay.status, code: pay.code, message: pay.message, cancels: (pay.cancels || []).map((c) => ({ amount: c.cancelAmount, at: c.canceledAt, status: c.cancelStatus })) });
}
