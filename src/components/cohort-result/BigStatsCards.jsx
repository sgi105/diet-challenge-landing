import { useEffect, useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import stats from '../../data/season0-stats.json';

function CountUp({ target, isVisible, decimals = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    const start = performance.now();
    const dur = 1400;
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(eased * target);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [isVisible, target]);
  return <span>{decimals ? val.toFixed(decimals) : Math.floor(val).toLocaleString()}</span>;
}

export default function BigStatsCards() {
  const { ref, isVisible } = useScrollReveal();
  const s = stats.summary;
  const ratePct = s.rate * 100;

  return (
    <div ref={ref} className="grid grid-cols-3 gap-2 max-w-md mx-auto w-full">
      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-bg-card rounded-2xl p-4 h-full flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <p className="text-card-ink text-2xl md:text-3xl font-black tabular-nums leading-none">
            <CountUp target={s.cohortSize} isVisible={isVisible} />
            <span className="text-card-ink text-base font-extrabold ml-0.5">명</span>
            <span className="text-card-ink-muted text-sm font-bold">/{s.cohortSize}</span>
          </p>
          <p className="text-card-ink-muted text-[11px] font-bold mt-2 leading-tight">
            21일<br />완주 성공
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in" delay={0.08}>
        <div className="bg-accent-green rounded-2xl p-4 h-full flex flex-col items-center justify-center text-center shadow-[0_8px_28px_rgba(200,255,77,0.32)]">
          <p className="text-bg-primary text-2xl md:text-3xl font-black tabular-nums leading-none">
            <CountUp target={ratePct} isVisible={isVisible} decimals={1} />
            <span className="text-bg-primary text-base font-extrabold ml-0.5">%</span>
          </p>
          <p className="text-bg-primary/75 text-[11px] font-bold mt-2 leading-tight">
            평균<br />출석률
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in" delay={0.16}>
        <div className="bg-bg-card rounded-2xl p-4 h-full flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          <p className="text-card-ink text-2xl md:text-3xl font-black tabular-nums leading-none">
            <CountUp target={s.totalAttendance} isVisible={isVisible} />
            <span className="text-card-ink text-base font-extrabold ml-0.5">회</span>
          </p>
          <p className="text-card-ink-muted text-[11px] font-bold mt-2 leading-tight">
            누적 운동<br />인증
          </p>
        </div>
      </AnimateOnScroll>
    </div>
  );
}
