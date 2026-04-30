import { Link } from 'react-router-dom';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import { useCohortStatus, COPY, COPY_REFERRAL } from '../../hooks/useCohortStatus';

const included = [
  '4주 매일 러닝 인증 (앱)',
  'OT 줌 세션 (러닝 + 식단 가이드)',
  '3인 1팀 카톡방 + 매주 점검 콜',
  '5/31 5K 파이널 운영',
  '개인 미션 90% 완료 시 20만원 환급',
  '팀 전원 성공 시 +4만원 (24만)',
  '우승팀 시 +20만원 (40만 ≈ 러닝화)',
];

export default function PricingSection({ onCTA, variant = 'main' }) {
  const status = useCohortStatus(variant);
  const copy = (variant === 'referral' ? COPY_REFERRAL : COPY)[status];
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">DEPOSIT</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          참가비가 아닙니다.
        </h2>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-8 text-text-primary leading-tight">
          <span className="text-accent-green">예치금</span>입니다.
        </h2>
      </AnimateOnScroll>

      {/* Proof-of-success: 직전 30일 다이어트 기수 11명 전원 성공 */}
      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-6 mb-6 shadow-[0_12px_30px_rgba(0,0,0,0.15)] border-l-[6px] border-accent-green">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🎯</span>
            <p className="text-bg-primary font-extrabold text-lg">직전 다이어트 기수 11명 — 전원 성공</p>
          </div>
          <p className="text-card-ink-muted text-sm leading-relaxed">
            평균 미션 수행률 <span className="text-card-ink font-bold">95%</span>. 한 명도 빠짐없이 모두 성공했습니다.
            <br />
            <span className="text-card-ink font-bold">시즌 0는 같은 팀 시스템을 4주 러닝에 그대로 적용합니다.</span>
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-bg-card rounded-[28px] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)] border-4 border-accent-green">
          <p className="text-5xl md:text-6xl font-black text-card-ink mb-2 font-display">200,000<span className="text-2xl">원</span></p>
          <p className="text-card-ink-muted text-sm mb-8">
            성공 시 전액 환급 + <span className="text-bg-primary font-bold">팀 성과에 따라 최대 20만원 보너스</span>
          </p>

          <div className="text-left space-y-3 mb-8">
            {included.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-accent-green text-bg-primary text-sm font-extrabold flex items-center justify-center shrink-0">✓</span>
                <span className="text-card-ink-muted text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          <Button onClick={onCTA} className="w-full shadow-[0_8px_24px_rgba(30,60,255,0.3)] flex flex-col items-center justify-center leading-tight" size="md">
            <span className="block">{copy.cta.pricing}</span>
            <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
          </Button>

          <p className="text-card-ink-faint text-xs mt-4 font-semibold">
            2026년 5월 4일 시작 · 3인 1팀 매칭 (4주 + 5/31 5K 파이널)
          </p>
          <p className="text-card-ink-faint text-xs mt-2 font-semibold">
            🛡️ 합격 후 OT 전 <Link to="/refund" className="underline hover:text-bg-primary transition-colors">전액 환불</Link> 가능
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
