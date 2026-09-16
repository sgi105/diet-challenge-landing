import AnimateOnScroll from '../ui/AnimateOnScroll';
import { PROGRAM5, COHORT5 } from '../../data/season5';

const man = (won) => `${Math.round(won / 10000)}만`;

// 완주 기준 인증 일수 — 21일 중 (수행률 90% / 최대 2회 패스) 둘 중 더 엄격한 쪽
const requiredDays = Math.max(
  Math.ceil((COHORT5.durationDays * PROGRAM5.successRate) / 100),
  COHORT5.durationDays - PROGRAM5.passCount
);

// 팀 상금은 팀 합산이다 — 1인 기준으로 환산해서 보여준다.
const prizePerPerson = PROGRAM5.prizeTeam1stValue / COHORT5.teamSize;

function ScenarioCard({ icon, title, desc, value, variant, valueSize = 'text-[17px]' }) {
  const base =
    'rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.10)]';
  const styles = {
    best: 'bg-accent-green',
    even: 'bg-bg-card',
    worst: 'bg-bg-card border-2 border-accent-orange',
  };
  const titleColor = {
    best: 'text-bg-primary',
    even: 'text-card-ink',
    worst: 'text-accent-orange',
  };
  const descColor = {
    best: 'text-bg-primary/75',
    even: 'text-card-ink-muted',
    worst: 'text-accent-orange/80',
  };

  return (
    <div className={`${base} ${styles[variant]}`}>
      <span className="text-2xl shrink-0 leading-none">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-black leading-tight break-keep ${titleColor[variant]}`}>{title}</p>
        <p className={`text-[11.5px] font-bold leading-snug mt-0.5 break-keep ${descColor[variant]}`}>
          {desc}
        </p>
      </div>
      <span
        className={`ml-auto shrink-0 ${valueSize} font-black tabular-nums whitespace-nowrap ${titleColor[variant]}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function MoneyMechanicSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">REWARD</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight break-keep">
          일어날 수 있는 건 <span className="text-accent-green">딱 3가지</span>
        </h2>
        <p className="text-text-secondary text-center text-base mb-8 break-keep">
          참가비는 무료. 보증금 {PROGRAM5.depositLabel}만 걸어.
        </p>
      </AnimateOnScroll>

      <div className="max-w-sm mx-auto w-full space-y-2.5">
        <AnimateOnScroll animation="animate-scale-in">
          <ScenarioCard
            variant="best"
            icon="🏆"
            title="완주하고 팀도 1등"
            desc={`보증금 ${PROGRAM5.depositLabel} 환급 + 팀 상금 ${man(PROGRAM5.prizeTeam1stValue)}원은 팀 전체 금액 · ${COHORT5.teamSize}명이 나눠 가짐`}
            value={`1인 +${man(prizePerPerson)}`}
            valueSize="text-[13px]"
          />
        </AnimateOnScroll>

        <AnimateOnScroll animation="animate-scale-in" delay={0.05}>
          <ScenarioCard
            variant="even"
            icon="✅"
            title="완주"
            desc={`낸 ${PROGRAM5.depositLabel} 그대로 환급`}
            value="±0"
          />
        </AnimateOnScroll>

        <AnimateOnScroll animation="animate-scale-in" delay={0.1}>
          <ScenarioCard
            variant="worst"
            icon="❌"
            title="중간에 포기"
            desc={`${PROGRAM5.depositLabel} 몰수`}
            value={`-${man(PROGRAM5.deposit)}`}
          />
        </AnimateOnScroll>

        <AnimateOnScroll delay={0.15}>
          <p className="text-text-secondary text-xs font-extrabold text-center mt-3 leading-relaxed break-keep">
{COHORT5.durationDays}일 중 {requiredDays}일 인증 + 파이널 {PROGRAM5.finalDistanceKm}K 완주 = 완주 인정
            <br />못 뛰는 날 {PROGRAM5.passCount}번은 봐줌
          </p>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
