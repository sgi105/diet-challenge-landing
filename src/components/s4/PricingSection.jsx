import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import { useSeason4Status, COPY4 } from '../../hooks/useSeason4Status';
import { PROGRAM4 } from '../../data/season4';

const included = [
  '21일 매일 러닝 인증 (앱)',
  'OT 줌 세션 (러닝 가이드)',
  '5인 1팀 카톡방 + 팀 점검 콜',
  '마지막 날 파이널 5K 레이스 운영',
  `개인 미션 ${PROGRAM4.successRate}% 완료 시 20만원 전액 환급`,
  '6팀 실시간 순위 대항전',
  '1등 팀 전원 → 10만원 상당 혜택',
];

export default function PricingSection({ onCTA }) {
  const status = useSeason4Status();
  const copy = COPY4[status];
  const isUpcoming = status === 'upcoming';
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">DEPOSIT</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          참가비가 아니야.
        </h2>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-8 text-text-primary leading-tight">
          <span className="text-accent-green">예치금</span>이야.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-bg-card rounded-[28px] p-8 text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)] border-4 border-accent-green">
          <p className="font-kr text-2xl md:text-3xl font-black text-bg-primary mb-2 leading-tight">보증금 — 성공하면<br />이게 다 무료</p>
          <p className="text-card-ink-muted text-base mb-8 font-bold">20만 원</p>

          <div className="text-left space-y-3 mb-8">
            {included.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-accent-green text-bg-primary text-sm font-extrabold flex items-center justify-center shrink-0">✓</span>
                <span className="text-card-ink-muted text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>

          <Button onClick={onCTA} disabled={isUpcoming} className="w-full shadow-[0_8px_24px_rgba(30,60,255,0.3)] flex flex-col items-center justify-center leading-tight" size="md">
            <span className="block">{copy.cta.pricing}</span>
            <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
          </Button>

          <p className="text-card-ink-faint text-xs mt-4 font-semibold">
            5인 1팀 매칭 · 8/24(월) 시작 · 21일
          </p>
          <p className="text-card-ink-faint text-xs mt-2 font-semibold">
            🛡️ 합격 후 OT 전 전액 환불 가능
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
