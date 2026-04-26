import { Link } from 'react-router-dom';

export default function ApplyDonePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="bg-bg-card rounded-[28px] p-8 max-w-md w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        <div className="text-5xl mb-6">✅</div>
        <h2 className="font-kr text-3xl font-black text-card-ink mb-4 leading-tight">
          지원 완료!
        </h2>
        <p className="text-card-ink-muted leading-relaxed mb-3">
          합격 결과는 <span className="text-bg-primary font-bold">4/28(화) 16:00</span> 문자 및
          <br />
          인스타 단톡방으로 안내됩니다.
        </p>
        <p className="text-card-ink-faint text-sm font-semibold mb-8">
          합격 시 4/28(화) 23:59까지 입금하셔야 선발 확정됩니다.
        </p>
        <Link to="/" className="inline-block bg-bg-primary text-white font-bold py-3 px-6 rounded-2xl hover:brightness-110 transition-all">
          ← 메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
