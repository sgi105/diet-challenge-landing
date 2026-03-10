import { Link } from 'react-router-dom';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';

const included = [
  '30일 매일 운동 미션 제공',
  'OT 식단 방법론 교육',
  '카카오톡 인증 채팅방',
  '성공 시 24만원 환급',
];

export default function PricingSection({ onCTA }) {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">
          참가비가 아닙니다.
        </h2>
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-8">
          <span className="text-accent-green">예치금</span>입니다.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-bg-card border-2 border-accent-green rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(0,255,136,0.1)]">
          <p className="text-5xl font-extrabold text-text-primary mb-2">200,000<span className="text-2xl">원</span></p>
          <p className="text-text-secondary text-sm mb-8">
            성공 시 전액 환급 + <span className="text-accent-green font-semibold">40,000원 보너스</span>
          </p>

          <div className="text-left space-y-3 mb-8">
            {included.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-accent-green">✓</span>
                <span className="text-text-secondary text-sm">{item}</span>
              </div>
            ))}
          </div>

          <Button onClick={onCTA} className="w-full whitespace-nowrap" size="md">
            지금 예치하고 도전 시작하기
          </Button>

          <p className="text-text-muted text-xs mt-4">
            🔒 카카오페이 · 토스페이 등 간편결제 가능
          </p>
          <p className="text-text-muted text-xs mt-2">
            매주 월요일 새 기수 시작 (서비스 제공 기간: 시작일로부터 30일)
          </p>
          <p className="text-text-muted text-xs mt-2">
            🛡️ 시작 전 <Link to="/refund" className="underline hover:text-text-secondary transition-colors">전액 환불</Link> 가능 · 성공하면 24만원 돌려드립니다
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
