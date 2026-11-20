import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Shell, Card, Line, Head, Product, CtaButton, Hint } from './halfPayUi';
import { won } from './halfWon';
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

  // 화면 = 앱 /half-apply 와 같은 밝은 결제창 (시안 A 머리 + 시안 B 상품·금액 카드) — 11/20 가인 "원래 페이지 UI 기반으로"
  const seat = order?.phase === 'early' && order?.seat_no && order.seat_no <= 10 ? order.seat_no : null;
  const testTag = TOSS_IS_TEST && <div className="mx-5 mt-3 text-[11px] font-black text-[#c2410c]">테스트 결제 — 실제로 청구되지 않아요</div>;

  if (lookupState !== 'ok' || !order) {
    return (
      <Shell cta={lookupState === 'phone' && (
        <CtaButton onClick={() => { setError(''); load({ phone }); }} disabled={phone.replace(/\D/g, '').length < 10}>내 신청 찾기</CtaButton>
      )}>
        {testTag}
        <Head badge="하프 결제" title={lookupState === 'loading' ? '신청 확인 중…' : <>앱에서 신청할 때 쓴<br />휴대폰 번호를 적어줘</>} />
        {lookupState === 'phone' && (
          <Card>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" inputMode="numeric" autoComplete="tel"
              className="w-full min-h-[48px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] px-3.5 text-[16px] text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#f97316]" />
          </Card>
        )}
        {error && <p className="mx-5 mt-3 text-[13px] font-bold text-[#dc2626] break-keep">{error}</p>}
      </Shell>
    );
  }

  const head = order.paid
    ? <Head badge="결제 완료 · 확정" ok title="하프 확정!" sub="1/23(토) 오전 9시 북극곰 마라톤 · 앱으로 돌아가면 돼" />
    : order.cancelled
      ? <Head badge="취소된 신청" title="취소된 신청이야" sub="코치에게 1:1로 문의해줘" />
      : !order.live
        ? <Head badge="결제 마감" title={<>결제 마감이 지났어</>} sub="신청한 날 자정까지였어. 앱에서 다시 신청하면 새로 결제할 수 있어" />
        : <Head badge="신청 완료 · 결제 대기" title={seat ? <>선착순 <em className="not-italic text-[#ea580c]">{seat}번</em> 잡았어<br />오늘 자정까지 결제해줘</> : <>신청 접수됐어<br />오늘 자정까지 결제해줘</>}
            sub={seat ? '지나면 선착순 자리 빠져' : '지나면 신청이 빠져'} />;

  return (
    <Shell cta={payable && (
      <>
        <CtaButton onClick={onPay} disabled={!canPay}>{paying ? '결제창 여는 중…' : `${won(order.amount)} 결제하기`}</CtaButton>
        <Hint>{!ready && !error ? '결제수단 불러오는 중…' : !agree ? '아래 약관 동의에 체크해줘' : '결제하면 바로 확정 안내가 와'}</Hint>
      </>
    )}>
      {testTag}
      {head}
      <Product />
      <Card>
        <Line k="신청자" v={order.name} />
        <div className="border-t border-[#e2e8f0] mt-1.5 pt-2.5 flex justify-between items-baseline">
          <span className="font-extrabold">결제 금액</span>
          <b className="text-[30px] font-black text-[#ea580c] tabular-nums">{won(order.amount)}</b>
        </div>
      </Card>

      {payable && (
        <>
          <Card className="!px-0 !py-1 overflow-hidden">
            <div id="toss-payment-methods" />
            <div id="toss-agreement" />
          </Card>
          <Card>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-[3px] w-[18px] h-[18px] accent-[#f97316]" />
              <span className="text-[13px] text-[#475569] leading-[1.6] break-keep">
                <Link to="/terms" className="underline">이용약관</Link> · <Link to="/refund" className="underline">환불정책</Link> · <Link to="/privacy" className="underline">개인정보처리방침</Link>을 확인했고 동의해요.
              </span>
            </label>
          </Card>
          <Card className="text-[13px] text-[#475569] leading-[1.7]">
            📅 1/23(토) 오전 9시 출발<br />
            📍 서울 신정교 아래 영롱이 억새구장<br />
            🛡️ 시작하고 2주 안에 안 맞으면 전액 환불
          </Card>
        </>
      )}
      {error && <p className="mx-5 mt-3 text-[13px] font-bold text-[#dc2626] break-keep">{error}</p>}
    </Shell>
  );
}
