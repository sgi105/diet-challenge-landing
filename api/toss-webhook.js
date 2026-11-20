// 토스페이먼츠 웹훅 — 결제 상태 변경(PAYMENT_STATUS_CHANGED) 수신.
// 상점관리자에서 직접 취소하거나 가상계좌 입금 등으로 상태가 바뀌면 toss_orders.status 를 맞춘다
// (정원 집계 count_applicants_public 이 DONE 만 세므로, 취소가 바로 남은 자리에 반영된다).
//
// 보안: 이 웹훅 본문은 서명이 없다 → 본문을 믿지 않고 paymentKey 로 토스 결제 조회 API 를 다시 불러 진짜 상태만 쓴다.
// 토스 API 키 접근 정책(국내 IP만) 때문에 서울 리전 고정.
// env: TOSS_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, META_CAPI_INTERNAL_SECRET(텔레그램 취소 알림용)
export const config = { runtime: 'edge', regions: ['icn1'] };

const ok = (body = { ok: true }) => new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });

async function sb(path, init = {}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
}

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });
  let body;
  try { body = await req.json(); } catch { return ok({ ok: false, why: 'bad_json' }); }
  // 토스는 200 이 아니면 재전송한다 — 우리 쪽에서 처리할 수 없는 건 200 으로 끝낸다.
  if (body?.eventType !== 'PAYMENT_STATUS_CHANGED') return ok({ ok: true, skipped: body?.eventType || 'unknown' });
  const paymentKey = body?.data?.paymentKey;
  if (!paymentKey || typeof paymentKey !== 'string' || paymentKey.length > 200) return ok({ ok: false, why: 'no_key' });

  const secret = process.env.TOSS_SECRET_KEY;
  if (!secret || !process.env.SUPABASE_URL) return ok({ ok: false, why: 'no_env' });

  // 진짜 상태는 토스에서 다시 조회
  const res = await fetch(`https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`, {
    headers: { Authorization: `Basic ${btoa(`${secret}:`)}` },
  });
  const pay = await res.json().catch(() => ({}));
  if (!res.ok) {
    // 없는 결제(404)·잘못된 요청(400)은 재전송해도 소용없으니 200 으로 끝낸다. 그 밖(권한·장애)은 500 → 토스 재전송.
    const code = pay?.code || '';
    if (res.status === 404 || res.status === 400) return ok({ ok: false, why: 'lookup', status: res.status, code });
    console.error('toss lookup failed', res.status, code);
    return new Response(JSON.stringify({ ok: false, why: 'lookup', status: res.status, code }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // 우리 주문만 갱신(없는 주문은 무시)
  const sel = await sb(`toss_orders?order_id=eq.${encodeURIComponent(pay.orderId)}&select=order_id,status,is_test,name,phone,amount`);
  const rows = sel.ok ? await sel.json() : [];
  const row = rows[0];
  if (!row) return ok({ ok: true, skipped: 'unknown_order' });
  if (row.status === pay.status) return ok({ ok: true, unchanged: pay.status });

  const upd = await sb(`toss_orders?order_id=eq.${encodeURIComponent(pay.orderId)}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status: pay.status, raw: pay }),
  });
  if (!upd.ok) return new Response('update failed', { status: 500 });

  // 실결제 건의 취소·입금은 텔레그램으로 알린다
  const notifySecret = process.env.META_CAPI_INTERNAL_SECRET;
  const kind = /CANCELED/.test(pay.status) ? 'canceled' : (row.status === 'WAITING_FOR_DEPOSIT' && pay.status === 'DONE') ? 'paid' : null;
  if (kind && !row.is_test && notifySecret) {
    try {
      await fetch(`${process.env.SUPABASE_URL}/functions/v1/toss-paid-notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-internal-secret': notifySecret },
        body: JSON.stringify({
          kind, name: row.name, phone: row.phone,
          amount: kind === 'canceled' ? (pay.cancels || []).reduce((s, c) => s + (c.cancelAmount || 0), 0) : pay.totalAmount,
          method: pay.method, provider: pay.easyPay?.provider || '',
          approvedAt: kind === 'canceled' ? (pay.cancels?.[pay.cancels.length - 1]?.canceledAt || '') : pay.approvedAt,
          orderId: pay.orderId,
        }),
      });
    } catch { /* ignore */ }
  }
  return ok({ ok: true, from: row.status, to: pay.status });
}
