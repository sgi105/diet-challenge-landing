import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import Footer from '../../components/layout/Footer';
import { COHORT7, CONTINUE7 } from '../../data/season7';
import { createWidgets, newOrderId, TOSS_IS_TEST } from '../../lib/tossPayments';

// 시즌7 상품 2 — 90일 프로그램 이어하기(49만원) 결제 페이지 (/s7/continue). 랜딩에는 링크하지 않고 직접 안내용(가인 2026-11-20).
// 토스 정책: 라이브(줌) 형태 서비스는 상품에 넣지 않는다. 환불 기준은 /refund 상품 2 와 같다.
// 결제 승인은 서버(api/toss-confirm, product='s7_continue')에서 하고 금액을 서버가 다시 대조한다.
const INCLUDES = [
  `하프마라톤(${CONTINUE7.endDate}) 완주 목표 레벨별 러닝 프로그램`,
  `${CONTINUE7.startDate}부터 매일 푸시업 근력 루틴`,
  `${COHORT7.teamSize}인 1팀 · 앱 러닝 인증 · 팀 피드`,
  '단톡방 · 코치 Q&A · 공지',
];

function normalizePhone(v) {
  return String(v || '').replace(/\D/g, '').slice(0, 11);
}

export default function ContinuePage() {
  const [widgets, setWidgets] = useState(null);
  const [ready, setReady] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const rendered = useRef(false);

  useEffect(() => {
    document.title = '90일 하프 프로그램 이어하기 · 49만원';
    track('s7_continue_view');
    let alive = true;
    (async () => {
      try {
        const w = await createWidgets();
        if (!alive) return;
        await w.setAmount({ currency: 'KRW', value: CONTINUE7.fee });
        if (!rendered.current) {
          rendered.current = true;
          await Promise.all([
            w.renderPaymentMethods({ selector: '#toss-payment-methods', variantKey: 'DEFAULT' }),
            w.renderAgreement({ selector: '#toss-agreement', variantKey: 'AGREEMENT' }),
          ]);
        }
        if (alive) { setWidgets(w); setReady(true); }
      } catch (e) {
        if (alive) setError(`결제창을 불러오지 못했어요. 새로고침해 주세요. (${e?.message || e})`);
      }
    })();
    return () => { alive = false; };
  }, []);

  const phoneDigits = normalizePhone(phone);
  const canPay = ready && name.trim().length >= 2 && /^01\d{8,9}$/.test(phoneDigits) && agreeRefund && !paying;

  const onPay = async () => {
    if (!canPay) return;
    setError('');
    setPaying(true);
    const orderId = newOrderId(CONTINUE7.orderCohort);
    try {
      sessionStorage.setItem(`s7_order_${orderId}`, JSON.stringify({ name: name.trim(), phone: phoneDigits }));
    } catch { /* ignore */ }
    track('s7_continue_pay_click');
    try {
      const origin = window.location.origin;
      const q = `name=${encodeURIComponent(name.trim())}&phone=${phoneDigits}`;
      await widgets.requestPayment({
        orderId,
        orderName: CONTINUE7.goodName,
        customerName: name.trim(),
        customerMobilePhone: phoneDigits,
        successUrl: `${origin}/s7/continue/success?${q}`,
        failUrl: `${origin}/s7/continue/fail`,
      });
    } catch (e) {
      // 구매자가 결제창을 닫은 경우 등 — 에러 코드는 SDK 문서 참고
      setError(e?.message || '결제가 취소됐어요.');
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/10 max-w-lg mx-auto">
        <Link to="/" className="text-text-muted text-sm hover:text-accent-green font-semibold">← 시즌7 소개</Link>
        {TOSS_IS_TEST && <span className="text-[10px] font-black text-accent-orange border border-accent-orange rounded-full px-2 py-0.5">테스트 결제</span>}
      </header>

      <main className="px-6 py-8 max-w-lg mx-auto">
        <p className="text-accent-green text-[11px] font-black tracking-widest">TARZAN 시즌7</p>
        <h1 className="font-kr text-[28px] font-black text-text-primary leading-tight mt-2 break-keep">
          90일 하프마라톤 프로그램<br />이어하기
        </h1>
        <p className="text-text-secondary text-sm font-bold mt-2 break-keep">28일 체험 다음 {CONTINUE7.durationDays}일 · 하프마라톤 완주까지</p>

        {/* 상품 정보 */}
        <section className="bg-bg-card rounded-[20px] p-5 mt-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <div className="flex items-baseline justify-between border-b border-black/10 pb-3">
            <p className="text-card-ink font-black">{CONTINUE7.goodName}</p>
          </div>
          <dl className="text-sm mt-3 space-y-2">
            <div className="flex justify-between"><dt className="text-card-ink-muted">제공 기간</dt><dd className="text-card-ink font-bold">{CONTINUE7.startDate} - {CONTINUE7.endDate} ({CONTINUE7.durationDays}일)</dd></div>
            <div className="flex justify-between"><dt className="text-card-ink-muted">진행 방식</dt><dd className="text-card-ink font-bold">100% 온라인 (앱 · 단톡방)</dd></div>
            <div className="flex justify-between"><dt className="text-card-ink-muted">참가비</dt><dd className="text-card-ink font-black text-lg">{CONTINUE7.fee.toLocaleString()}원</dd></div>
          </dl>
          <ul className="mt-4 space-y-1.5 text-sm text-card-ink">
            {INCLUDES.map((t) => <li key={t}>✓ {t}</li>)}
          </ul>
          <p className="text-card-ink-muted text-xs mt-3">일시불 1회 결제 · 자동 결제 없음</p>
        </section>

        {/* 참가자 정보 */}
        <section className="mt-8 space-y-3">
          <p className="text-text-muted text-[11px] font-extrabold tracking-widest">참가자 정보</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" autoComplete="name"
            className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="휴대폰 번호 (010...)" inputMode="numeric" autoComplete="tel"
            className="w-full rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-text-primary placeholder:text-text-muted outline-none focus:border-accent-green" />
          <p className="text-text-muted text-xs">시즌7 참가 때 쓴 번호로 적어줘. 안내는 이 번호로 보내요.</p>
        </section>

        {/* 결제수단 · 토스 약관 */}
        <section className="mt-8 rounded-[20px] bg-white overflow-hidden">
          <div id="toss-payment-methods" />
          <div id="toss-agreement" />
        </section>

        {/* 환불정책 — 결제 버튼 바로 위에 명확히 표시(전자상거래법 제17조 제6항) */}
        <section className="mt-6 rounded-2xl border border-white/15 p-4 text-sm">
          <p className="text-text-primary font-black mb-2">환불 기준</p>
          <ul className="space-y-1 text-text-secondary">
            <li>· 시작일({CONTINUE7.startDate}) 전: 전액 환불</li>
            <li>· 시작일부터 {CONTINUE7.proRataDays}일 이내: 남은 일수만큼 일할 환불</li>
            <li>· 그 이후: 남은 일수 금액에서 위약금 {Math.round(CONTINUE7.penaltyRate * 100)}%를 뺀 금액 환불</li>
          </ul>
          <label className="flex items-start gap-2 mt-3 cursor-pointer">
            <input type="checkbox" checked={agreeRefund} onChange={(e) => setAgreeRefund(e.target.checked)} className="mt-1 accent-[#c8ff4d]" />
            <span className="text-text-secondary text-[13px]">
              위 환불 기준과 <Link to="/terms" className="underline">이용약관</Link> · <Link to="/refund" className="underline">환불정책</Link> · <Link to="/privacy" className="underline">개인정보처리방침</Link>을 확인했고 동의해요.
            </span>
          </label>
        </section>

        {error && <p className="text-accent-orange text-sm font-bold mt-4">{error}</p>}

        <button
          onClick={onPay}
          disabled={!canPay}
          className={`w-full mt-5 rounded-2xl py-4 font-extrabold text-lg transition-all ${canPay ? 'bg-accent-green text-bg-primary shadow-[0_12px_40px_rgba(200,255,77,0.4)] hover:brightness-110' : 'bg-white/15 text-text-muted cursor-not-allowed'}`}
        >
          {paying ? '결제창 여는 중…' : `${CONTINUE7.fee.toLocaleString()}원 결제하기`}
        </button>
        {!ready && !error && <p className="text-text-muted text-xs text-center mt-2">결제수단 불러오는 중…</p>}
      </main>

      <Footer />
    </div>
  );
}
