import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TOSS_IS_TEST } from '../../lib/tossPayments';
import { halfApi } from './HalfPayPage';

// 토스 인증 성공 → 서버(api/half-pay confirm)가 승인 + 하프 확정까지 한 번에. 이 화면이 '확인 페이지'.
export default function HalfPaySuccessPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ phase: 'confirming' });
  const once = useRef(false);
  const u = params.get('u') || '';

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    (async () => {
      try {
        const data = await halfApi({ action: 'confirm', u, paymentKey: params.get('paymentKey'), orderId: params.get('orderId'), amount: Number(params.get('amount')) });
        setState({ phase: 'done', data });
      } catch (e) { setState({ phase: 'error', message: e.message }); }
    })();
  }, [params, u]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {state.phase === 'confirming' && <p className="text-text-secondary font-bold">결제 확인 중… 창을 닫지 말아줘</p>}
        {state.phase === 'error' && (
          <>
            <h1 className="text-2xl font-extrabold text-accent-orange mb-3">결제를 완료하지 못했어</h1>
            <p className="text-text-secondary text-sm mb-6 break-keep">{state.message}</p>
            <Link to={`/half/pay?u=${u}`} className="text-accent-green font-bold underline">다시 시도하기</Link>
          </>
        )}
        {state.phase === 'done' && (
          <>
            <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6 text-4xl">🏃</div>
            <h1 className="text-3xl font-extrabold text-text-primary mb-3">{state.data.confirmed ? '하프 확정!' : '결제 완료!'}</h1>
            {TOSS_IS_TEST && <p className="text-accent-orange text-xs font-black mb-3">테스트 결제 — 실제로 청구되지 않았어요</p>}
            <p className="text-text-secondary leading-relaxed mb-6 break-keep">
              {state.data.totalAmount?.toLocaleString()}원 결제가 완료됐어.{' '}
              {state.data.confirmed ? '1:1 메시지로 확정 안내도 보냈어. 이제 앱으로 돌아가면 돼.' : '확정 처리는 코치가 곧 해줄게. 1:1 메시지를 기다려줘.'}
            </p>
            <div className="bg-bg-card rounded-2xl p-5 text-left space-y-2 text-sm">
              <p className="text-card-ink"><b>목표 대회</b> · 1/23(토) 오전 9시 북극곰 마라톤</p>
              <p className="text-card-ink-muted text-xs pt-2">주문번호 {state.data.orderId}</p>
              {state.data.receiptUrl && <a href={state.data.receiptUrl} target="_blank" rel="noreferrer" className="text-card-ink underline text-xs">영수증 보기</a>}
            </div>
            <p className="text-text-muted text-xs mt-4">환불은 <Link to="/refund" className="underline">환불정책</Link> 기준으로 처리해요.</p>
          </>
        )}
      </div>
    </div>
  );
}
