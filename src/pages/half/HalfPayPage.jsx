import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
import { createWidgets, TOSS_IS_TEST } from '../../lib/tossPayments';

// 하프 연장(1000 런클럽 시즌6) 결제 — /half/pay?u=<앱 user_id>  (가인 2026-11-20)
//   앱 /half-apply 의 카드 버튼 → 기본 브라우저로 이 페이지. u 가 없으면 휴대폰 번호로 신청을 찾는다.
//   금액은 서버(api/half-pay)가 DB 신청 금액으로 정하고, 승인 직후 paid_at(=토스 승인 시각) 기록 + 확정 메시지 자동.
export const HALF_GOOD_NAME = '하프마라톤 연장 (런클럽 시즌6)';

export async function halfApi(body) {
  const res = await fetch('/api/half-pay', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw Object.assign(new Error(data.message || `요청 실패 (${res.status})`), { code: data.code });
  return data;
}

function deadlineLabel(iso) {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() - 1000);
  return d.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', weekday: 'short' }) + ' 자정';
}

export default function HalfPayPage() {
  const [params] = useSearchParams();
  const [uid, setUid] = useState(params.get('u') || '');
  const [order, setOrder] = useState(null);
  const [lookupState, setLookupState] = useState(params.get('u') ? 'loading' : 'phone');
  const [phone, setPhone] = useState('');
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState(params.get('code') && params.get('code') !== 'PAY_PROCESS_CANCELED' && params.get('code') !== 'USER_CANCEL' ? (params.get('message') || '결제가 완료되지 않았어요.') : '');
  const [paying, setPaying] = useState(false);
  const rendered = useRef(false);

  useEffect(() => { document.title = `${HALF_GOOD_NAME} 결제`; }, []);

  const load = async (body) => {
    setLookupState('loading');
    try {
      const { order: o } = await halfApi({ action: 'lookup', ...body });
      if (!o.found) {
        setLookupState('phone');
        setError(o.reason === 'ambiguous' ? '이 번호로 신청이 여러 개 있어요. 코치에게 1:1로 문의해줘.' : '이 번호로 된 하프 신청을 못 찾았어요. 앱에서 먼저 신청해줘.');
        return;
      }
      setUid(o.uid); setOrder(o); setLookupState('ok');
    } catch (e) { setLookupState('phone'); setError(e.message); }
  };
  useEffect(() => { if (params.get('u')) load({ u: params.get('u') }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const payable = order && !order.paid && !order.cancelled && order.live && order.amount > 0;
  useEffect(() => {
    if (!payable || rendered.current) return;
    rendered.current = true;
    let alive = true;
    (async () => {
      try {
        const w = await createWidgets();
        await w.setAmount({ currency: 'KRW', value: order.amount });
        await Promise.all([
          w.renderPaymentMethods({ selector: '#toss-payment-methods', variantKey: 'DEFAULT' }),
          w.renderAgreement({ selector: '#toss-agreement', variantKey: 'AGREEMENT' }),
        ]);
        if (alive) { setWidgets(w); setReady(true); }
      } catch (e) { if (alive) setError(`결제창을 불러오지 못했어요. 새로고침해 줘. (${e?.message || e})`); }
    })();
    return () => { alive = false; };
  }, [payable]); // eslint-disable-line react-hooks/exhaustive-deps

  const canPay = payable && ready && agree && !paying;
  const onPay = async () => {
    if (!canPay) return;
    setError(''); setPaying(true);
    const orderId = `half6-${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const origin = window.location.origin;
    try {
      await widgets.requestPayment({
        orderId,
        orderName: HALF_GOOD_NAME,
        successUrl: `${origin}/half/pay/success?u=${uid}`,
        failUrl: `${origin}/half/pay?u=${uid}`,
      });
    } catch (e) { setError(e?.message || '결제가 취소됐어요.'); setPaying(false); }
  };

  const input = 'w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green';
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/10 max-w-lg mx-auto">
        <span className="text-text-muted text-sm font-semibold">TARZAN 런클럽</span>
        {TOSS_IS_TEST && <span className="text-[10px] font-black text-accent-orange border border-accent-orange rounded-full px-2 py-0.5">테스트 결제</span>}
      </header>
      <main className="px-6 py-8 max-w-lg mx-auto">
        <p className="text-accent-green text-[11px] font-black tracking-widest">런클럽 시즌6</p>
        <h1 className="font-kr text-[28px] font-black text-text-primary leading-tight mt-2 break-keep">하프마라톤 연장 결제</h1>

        {lookupState === 'loading' && <p className="text-text-secondary font-bold mt-8">신청 정보 확인 중…</p>}

        {lookupState === 'phone' && (
          <section className="mt-8 space-y-3">
            <p className="text-text-secondary text-sm break-keep">앱에서 하프 신청할 때 쓴 휴대폰 번호를 적어줘.</p>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="휴대폰 번호 (010...)" inputMode="numeric" autoComplete="tel" className={input} />
            <button onClick={() => { setError(''); load({ phone }); }} disabled={phone.replace(/\D/g, '').length < 10}
              className="w-full rounded-2xl py-3.5 font-extrabold bg-accent-green text-bg-primary disabled:bg-white/15 disabled:text-text-muted">내 신청 찾기</button>
          </section>
        )}

        {lookupState === 'ok' && order && (
          <>
            <section className="bg-bg-card rounded-[20px] p-5 mt-6">
              <p className="text-card-ink font-black border-b border-black/10 pb-3">{HALF_GOOD_NAME}</p>
              <dl className="text-sm mt-3 space-y-2">
                <div className="flex justify-between"><dt className="text-card-ink-muted">신청자</dt><dd className="text-card-ink font-bold">{order.name}</dd></div>
                <div className="flex justify-between"><dt className="text-card-ink-muted">목표 대회</dt><dd className="text-card-ink font-bold">1/23(토) 북극곰 마라톤 하프</dd></div>
                <div className="flex justify-between"><dt className="text-card-ink-muted">진행 방식</dt><dd className="text-card-ink font-bold">100% 온라인 (앱 · 단톡방)</dd></div>
                {order.phase === 'early' && order.seat_no && <div className="flex justify-between"><dt className="text-card-ink-muted">선착순</dt><dd className="text-card-ink font-bold">{order.seat_no <= 10 ? `${order.seat_no}번` : `${order.seat_no}번째 (10자리 마감)`}</dd></div>}
                <div className="flex justify-between"><dt className="text-card-ink-muted">결제 금액</dt><dd className="text-card-ink font-black text-lg">{order.amount.toLocaleString()}원</dd></div>
              </dl>
              {payable && <p className="text-card-ink-muted text-xs mt-3">{deadlineLabel(order.deadline)}까지 결제하면 바로 확정 · 일시불/할부 · 자동 결제 없음</p>}
            </section>

            {order.paid && <p className="mt-6 text-accent-green font-black text-lg">이미 결제 확인됐어. 하프 확정 ✅ 앱으로 돌아가면 돼.</p>}
            {!order.paid && order.cancelled && <p className="mt-6 text-accent-orange font-bold">취소된 신청이야. 코치에게 1:1로 문의해줘.</p>}
            {!order.paid && !order.cancelled && !order.live && <p className="mt-6 text-accent-orange font-bold break-keep">결제 마감(신청한 날 자정)이 지났어. 앱에서 다시 신청하면 새로 결제할 수 있어.</p>}

            {payable && (
              <>
                <section className="mt-8 rounded-[20px] bg-white overflow-hidden">
                  <div id="toss-payment-methods" />
                  <div id="toss-agreement" />
                </section>
                <section className="mt-6 rounded-2xl border border-white/15 p-4 text-sm">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 accent-[#c8ff4d]" />
                    <span className="text-text-secondary text-[13px]">
                      <Link to="/terms" className="underline">이용약관</Link> · <Link to="/refund" className="underline">환불정책</Link> · <Link to="/privacy" className="underline">개인정보처리방침</Link>을 확인했고 동의해요.
                    </span>
                  </label>
                </section>
                <button onClick={onPay} disabled={!canPay}
                  className={`w-full mt-5 rounded-2xl py-4 font-extrabold text-lg ${canPay ? 'bg-accent-green text-bg-primary' : 'bg-white/15 text-text-muted cursor-not-allowed'}`}>
                  {paying ? '결제창 여는 중…' : `${order.amount.toLocaleString()}원 결제하기`}
                </button>
                {!ready && !error && <p className="text-text-muted text-xs text-center mt-2">결제수단 불러오는 중…</p>}
              </>
            )}
          </>
        )}
        {error && <p className="text-accent-orange text-sm font-bold mt-4 break-keep">{error}</p>}
      </main>
      <Footer />
    </div>
  );
}
