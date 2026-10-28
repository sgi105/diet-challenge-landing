import { Link, useSearchParams } from 'react-router-dom';

// 결제 인증 실패/취소 → 토스가 code, message 를 붙여 보낸다.
export default function JoinFailPage() {
  const [params] = useSearchParams();
  const code = params.get('code');
  const message = params.get('message');
  const cancelled = code === 'PAY_PROCESS_CANCELED' || code === 'USER_CANCEL';
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold text-text-primary mb-3">{cancelled ? '결제를 취소했어요' : '결제가 완료되지 않았어요'}</h1>
        {!cancelled && message && <p className="text-text-secondary text-sm mb-2 break-keep">{message}</p>}
        <p className="text-text-muted text-xs mb-6">결제된 금액은 없어요.{code ? ` (${code})` : ''}</p>
        <Link to="/s7/join" className="text-accent-green font-bold underline">다시 시도하기</Link>
      </div>
    </div>
  );
}
