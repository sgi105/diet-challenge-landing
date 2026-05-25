import { useSearchParams } from 'react-router-dom';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  return (
    <div className="bg-bg-primary min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-accent-green/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-text-primary mb-3">
          예치 완료!
        </h1>
        <p className="text-text-secondary leading-relaxed mb-8">
          200,000원이 성공적으로 예치되었습니다.
          <br />
          <span className="text-accent-green font-semibold">30일 후 240,000원</span>을 돌려받을 준비가 되었습니다.
        </p>

        <div className="bg-bg-card rounded-2xl p-6 border border-border text-left space-y-4 mb-8">
          <h2 className="font-bold text-text-primary text-center mb-4">다음 단계</h2>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent-green/20 text-accent-green text-sm font-bold flex items-center justify-center">1</span>
            <div>
              <p className="text-text-primary font-semibold text-sm">카카오톡 오픈채팅 참여</p>
              <p className="text-text-muted text-xs">아래 버튼을 눌러 챌린지 단톡방에 입장하세요.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent-green/20 text-accent-green text-sm font-bold flex items-center justify-center">2</span>
            <div>
              <p className="text-text-primary font-semibold text-sm">OT 참여 (챌린지 시작 전)</p>
              <p className="text-text-muted text-xs">식단 원리와 미션 수행 방법을 안내드립니다.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-7 h-7 rounded-full bg-accent-green/20 text-accent-green text-sm font-bold flex items-center justify-center">3</span>
            <div>
              <p className="text-text-primary font-semibold text-sm">30일 미션 시작</p>
              <p className="text-text-muted text-xs">매일 앱으로 미션이 제공됩니다. 90% 이상 완료하세요.</p>
            </div>
          </div>
        </div>

        <a
          href="https://open.kakao.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-[#FEE500] text-[#191919] font-bold py-4 rounded-xl text-center mb-3 hover:brightness-95 transition"
        >
          카카오톡 오픈채팅 참여하기
        </a>

        <a
          href="/"
          className="block text-text-muted text-sm hover:text-text-secondary transition"
        >
          메인으로 돌아가기
        </a>

        {paymentId && (
          <div className="mt-8 bg-bg-card rounded-xl p-4 border border-border">
            <p className="text-text-muted text-xs">
              결제번호: {paymentId}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
