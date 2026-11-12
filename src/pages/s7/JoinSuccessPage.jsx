import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { metaTrack } from '../../lib/metaPixel';
import { COHORT7, PROGRAM7 } from '../../data/season7';
import { TOSS_IS_TEST } from '../../lib/tossPayments';

// 결제 인증 성공 → 서버(api/toss-confirm)에서 결제 승인. 승인이 끝나야 결제 완료다.
// 금액은 여기서 한 번, 서버에서 한 번 더 대조한다(클라이언트 금액 조작 방지).
// 토스 가상계좌 은행 코드(자주 쓰는 것만) — 없으면 코드 그대로 보여준다.
const VA_BANKS = { '11': '농협', '06': '국민', '20': '우리', '88': '신한', '03': '기업', '39': '경남', '32': '부산', '81': '하나', '71': '우체국', '07': '수협', '31': '대구', '34': '광주', '37': '전북', '35': '제주', '45': '새마을', '23': 'SC제일' };

export default function JoinSuccessPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState({ phase: 'confirming' });
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;
    const paymentKey = params.get('paymentKey');
    const orderId = params.get('orderId');
    const amount = Number(params.get('amount'));
    const name = params.get('name') || '';
    const phone = params.get('phone') || '';
    if (!paymentKey || !orderId || amount !== PROGRAM7.fee) {
      setState({ phase: 'error', message: '결제 정보가 올바르지 않아요. 결제는 승인되지 않았어요.' });
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/toss-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentKey, orderId, amount, name, phone, cohortCode: COHORT7.cohortCode }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.ok) throw new Error(data.message || `승인 실패 (${res.status})`);
        // 가상계좌는 입금 전까지 참가 확정이 아니다(입금 대기).
        if (data.status === 'WAITING_FOR_DEPOSIT') {
          setState({ phase: 'waiting', data });
          track('s7_join_va_issued', { test: TOSS_IS_TEST });
          return;
        }
        setState({ phase: 'done', data });
        track('s7_join_paid', { test: TOSS_IS_TEST });
        if (!TOSS_IS_TEST) metaTrack('Purchase', { currency: 'KRW', value: amount, content_name: 's7_fee' }, { eventId: `toss-${orderId}` });
      } catch (e) {
        setState({ phase: 'error', message: e.message || String(e) });
      }
    })();
  }, [params]);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {state.phase === 'confirming' && <p className="text-text-secondary font-bold">결제 확인 중…</p>}
        {state.phase === 'error' && (
          <>
            <h1 className="text-2xl font-extrabold text-accent-orange mb-3">결제를 완료하지 못했어요</h1>
            <p className="text-text-secondary text-sm mb-6 break-keep">{state.message}</p>
            <Link to="/s7/join" className="text-accent-green font-bold underline">다시 시도하기</Link>
          </>
        )}
        {state.phase === 'waiting' && (
          <>
            <div className="w-20 h-20 rounded-full bg-accent-orange/20 flex items-center justify-center mx-auto mb-6 text-4xl">🏦</div>
            <h1 className="text-3xl font-extrabold text-text-primary mb-3">입금하면 참가 확정!</h1>
            {TOSS_IS_TEST && <p className="text-accent-orange text-xs font-black mb-3">테스트 결제 — 실제로 청구되지 않았어요</p>}
            <p className="text-text-secondary leading-relaxed mb-6 break-keep">
              아래 가상계좌로 참가비 {PROGRAM7.fee.toLocaleString()}원을 입금하면 시즌7 참가가 확정돼. 입금 기한이 지나면 주문이 자동 취소돼.
            </p>
            <div className="bg-bg-card rounded-2xl p-5 text-left space-y-2 text-sm">
              <p className="text-card-ink"><b>은행</b> · {VA_BANKS[state.data.virtualAccount?.bankCode] || state.data.virtualAccount?.bankCode}</p>
              <p className="text-card-ink"><b>계좌번호</b> · {state.data.virtualAccount?.accountNumber}</p>
              <p className="text-card-ink"><b>예금주</b> · 무사</p>
              <p className="text-card-ink"><b>입금 기한</b> · {state.data.virtualAccount?.dueDate ? new Date(state.data.virtualAccount.dueDate).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
              <p className="text-card-ink-muted text-xs pt-2">주문번호 {state.data.orderId}</p>
            </div>
          </>
        )}
        {state.phase === 'done' && (
          <>
            <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6 text-4xl">🏃</div>
            <h1 className="text-3xl font-extrabold text-text-primary mb-3">시즌7 참가 확정!</h1>
            {TOSS_IS_TEST && <p className="text-accent-orange text-xs font-black mb-3">테스트 결제 — 실제로 청구되지 않았어요</p>}
            <p className="text-text-secondary leading-relaxed mb-6 break-keep">
              참가비 {PROGRAM7.fee.toLocaleString()}원 결제가 완료됐어. {COHORT7.startDate}부터 28일 같이 뛰자.
            </p>
            <div className="bg-bg-card rounded-2xl p-5 text-left space-y-2 text-sm">
              <p className="text-card-ink"><b>단톡방 초대</b> · {COHORT7.chatInvite} 문자로 보내줄게</p>
              <p className="text-card-ink"><b>첫 러닝</b> · {COHORT7.startDate} 딱 {PROGRAM7.startMinutes}분</p>
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
