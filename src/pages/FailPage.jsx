import { useSearchParams } from 'react-router-dom';
import { requestPayment } from '../lib/tossPayments';

export default function FailPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  const handleRetry = async () => {
    try {
      await requestPayment();
    } catch (error) {
      if (error.code === 'USER_CANCEL') return;
      console.error('결제 오류:', error);
    }
  };

  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-accent-orange/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-text-primary mb-3">
          결제가 완료되지 않았습니다
        </h1>
        <p className="text-text-secondary leading-relaxed mb-8">
          아직 포기하지 마세요.
          <br />
          다시 시도하면 <span className="text-accent-green font-semibold">30일 후 24만원</span>이 기다립니다.
        </p>

        {message && (
          <div className="bg-bg-card rounded-xl p-4 border border-border mb-8">
            <p className="text-text-muted text-xs">
              {message}
              {code && <span className="ml-1">({code})</span>}
            </p>
          </div>
        )}

        <button
          onClick={handleRetry}
          className="w-full bg-accent-green text-bg-primary font-bold py-4 rounded-xl mb-3 hover:brightness-110 transition"
        >
          다시 결제하기
        </button>

        <a
          href="/"
          className="block text-text-muted text-sm hover:text-text-secondary transition"
        >
          메인으로 돌아가기
        </a>
      </div>
    </div>
  );
}
