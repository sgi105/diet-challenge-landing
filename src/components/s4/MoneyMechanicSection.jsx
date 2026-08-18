import { useEffect, useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import { PROGRAM4 } from '../../data/season4';

function CountUpNumber({ target, isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1500;
    const startTime = performance.now();
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [isVisible, target]);

  return <span>{count.toLocaleString()}</span>;
}

function CardLabel({ children, className = '' }) {
  return <p className={`text-[10px] font-extrabold tracking-widest mb-2 ${className}`}>{children}</p>;
}

// TODO 시즌4 1등 팀 상품 미확정 — 확정되면 아래 "1등 팀" 카드에 실물 상품 추가 (시즌2는 DARIMATI 러닝화였음)
export default function MoneyMechanicSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="px-6 py-14 max-w-lg mx-auto" ref={ref}>
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">REWARD</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          참가비 <span className="text-accent-green">무료</span>
        </h2>
        <p className="text-text-secondary text-center text-base mb-3 break-keep">
          보증금은 완주하면 <span className="text-accent-green font-extrabold">100% 환급</span>
        </p>
        <p className="text-center mb-8 leading-tight break-keep">
          <span className="text-text-secondary font-bold text-lg md:text-xl">지난 60명 환급률 </span>
          <span className="text-accent-green font-black text-3xl md:text-4xl">95%</span>
        </p>
      </AnimateOnScroll>

      <div className="max-w-sm mx-auto w-full space-y-3">

        {/* Row 1: 실패 + 개인성공 */}
        <div className="grid grid-cols-2 gap-3">
          <AnimateOnScroll animation="animate-scale-in">
            <div className="bg-bg-card rounded-2xl p-5 h-full flex flex-col border-l-4 border-accent-orange shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
              <CardLabel className="text-accent-orange">미션 실패</CardLabel>
              <p className="text-3xl font-black text-accent-orange tabular-nums">0<span className="text-sm font-semibold ml-0.5">원</span></p>
              <p className="text-card-ink-muted text-xs mt-2 leading-relaxed flex-1">20만원 전액 몰수</p>
              <p className="text-accent-orange text-xs font-bold mt-3">수익률 -100%</p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="animate-scale-in" delay={0.05}>
            <div className="bg-bg-card rounded-2xl p-5 h-full flex flex-col shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
              <CardLabel className="text-card-ink-muted">미션 성공</CardLabel>
              <p className="text-2xl font-black text-card-ink tabular-nums whitespace-nowrap">
                <CountUpNumber target={PROGRAM4.rewardSolo} isVisible={isVisible} /><span className="text-sm font-semibold ml-0.5">원</span>
              </p>
              <p className="text-card-ink-muted text-xs mt-2 leading-relaxed flex-1">20만원 예치 → 20만원 환급</p>
              <p className="text-card-ink-muted text-xs font-bold mt-3">본전 + 완주한 몸</p>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Row 2: 성공 기준 — 21일 중 2번은 봐줌 */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.15}>
          <div className="bg-accent-green rounded-2xl p-6 shadow-[0_8px_32px_rgba(200,255,77,0.35)]">
            <CardLabel className="text-bg-primary">환급 기준</CardLabel>
            <p className="text-bg-primary text-3xl font-black leading-tight tabular-nums">
              21일 중 <span className="text-4xl">19일</span>
            </p>
            <p className="text-bg-primary/80 text-sm mt-2 leading-relaxed break-keep">
              미션 {PROGRAM4.successRate}% 이상 + 파이널 5K 완주면 20만원 그대로 돌려받아.
            </p>
            <p className="text-bg-primary/75 text-[13px] font-extrabold mt-3 break-keep">
              살다 보면 못 뛰는 날 있잖아. {PROGRAM4.passCount}번까지는 봐줄게.
            </p>
          </div>
        </AnimateOnScroll>

      </div>

      <AnimateOnScroll className="mt-8">
        <div className="max-w-sm mx-auto bg-bg-card rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          <p className="text-card-ink-muted text-sm leading-relaxed text-center break-keep">
            내가 빠지면 우리 팀 순위가 내려가.<br />
            그 책임감이 <span className="text-card-ink font-bold">포기를 불가능하게</span> 만들어.
            <span className="text-card-ink-faint text-xs mt-3 block font-semibold">
              성공 기준: 21일 미션 수행률 {PROGRAM4.successRate}% 이상 + 파이널 5K 레이스 완주
            </span>
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
