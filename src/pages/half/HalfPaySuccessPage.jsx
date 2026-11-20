import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TOSS_IS_TEST } from '../../lib/tossPayments';
import { halfApi } from './HalfPayPage';
import { Shell, Card, Line, Head, Product } from './halfPayUi';
import { won } from './halfWon';

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

  // 화면 = 앱 /half-apply 확정 화면과 같은 밝은 결제창 스타일 (11/20 가인)
  if (state.phase === 'confirming') return <Shell><Head badge="결제 확인 중" title={<>결제 확인 중…<br />창을 닫지 말아줘</>} /></Shell>;
  if (state.phase === 'error') return (
    <Shell>
      <Head badge="결제 미완료" title="결제를 완료하지 못했어" sub={state.message} />
      <Card><Link to={`/half/pay?u=${u}`} className="flex items-center justify-center min-h-[48px] rounded-xl bg-[#0f172a] text-white font-black">다시 시도하기</Link></Card>
    </Shell>
  );
  const d = state.data;
  return (
    <Shell>
      {TOSS_IS_TEST && <div className="mx-5 mt-3 text-[11px] font-black text-[#c2410c]">테스트 결제 — 실제로 청구되지 않았어요</div>}
      <Head badge={d.confirmed ? '결제 완료 · 확정' : '결제 완료'} ok title={d.confirmed ? '하프 확정!' : '결제 완료!'}
        sub={d.confirmed ? '1:1 메시지로 확정 안내도 보냈어. 이제 앱으로 돌아가면 돼' : '확정 처리는 코치가 곧 해줄게. 1:1 메시지를 기다려줘'} />
      <Product />
      <Card>
        <Line k="결제 금액" v={won(d.totalAmount)} />
        <Line k="목표 대회" v="1/23(토) 오전 9시 북극곰 마라톤" />
        <Line k="주문번호" v={<span className="text-[12px] text-[#64748b]">{d.orderId}</span>} />
        {d.receiptUrl && <a href={d.receiptUrl} target="_blank" rel="noreferrer" className="mt-1.5 flex items-center justify-center min-h-[44px] rounded-xl border border-[#e2e8f0] text-[13.5px] font-bold text-[#334155]">영수증 보기</a>}
      </Card>
      <p className="mx-5 mt-3 text-[11.5px] text-[#94a3b8]">환불은 <Link to="/refund" className="underline">환불정책</Link> 기준으로 처리해요.</p>
    </Shell>
  );
}
