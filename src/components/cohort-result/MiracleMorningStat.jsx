import { useEffect, useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import stats from '../../data/season0-stats.json';

function CountUp({ target, isVisible, decimals = 0 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    const start = performance.now();
    const dur = 1500;
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

export default function MiracleMorningStat() {
  const { ref, isVisible } = useScrollReveal();
  const mm = stats.summary.miracleMorning;
  const ratePct = mm.rate * 100;
  // Donut size
  const R = 44;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - mm.rate);

  return (
    <AnimateOnScroll className="max-w-md mx-auto w-full">
      <div
        ref={ref}
        className="bg-bg-card rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
      >
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-card-ink text-sm font-extrabold">미라클 모닝</p>
          <p className="text-card-ink-faint text-[10px] font-semibold">새벽-아침 5-9시</p>
        </div>
        <p className="text-card-ink-muted text-[11px] mb-4">
          전체 운동 인증 중 {mm.logs}건이 출근 직전 새벽-아침 시간대.
        </p>

        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative shrink-0 w-[110px] h-[110px]">
            <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
              <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(10,31,138,0.10)" strokeWidth="12" />
              <circle
                cx="55"
                cy="55"
                r={R}
                fill="none"
                stroke="#c8ff4d"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={isVisible ? offset : C}
                style={{ transition: 'stroke-dashoffset 1.4s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-card-ink text-3xl font-black tabular-nums leading-none">
                <CountUp target={ratePct} isVisible={isVisible} decimals={0} />
                <span className="text-base font-extrabold">%</span>
              </p>
              <p className="text-card-ink-faint text-[9px] font-bold mt-0.5">
                새벽-아침 비율
              </p>
            </div>
          </div>

          {/* Side stats */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="bg-bg-card-hover rounded-xl px-3 py-2">
              <p className="text-card-ink-muted text-[10px] font-bold">1인당 평균</p>
              <p className="text-card-ink text-xl font-black tabular-nums leading-tight">
                <CountUp target={mm.avgDaysPerPerson} isVisible={isVisible} decimals={1} />
                <span className="text-sm font-extrabold ml-0.5">일</span>
                <span className="text-card-ink-faint text-[11px] font-bold ml-1">/21일</span>
              </p>
            </div>
            <div className="bg-bg-card-hover rounded-xl px-3 py-2">
              <p className="text-card-ink-muted text-[10px] font-bold">피크 시간</p>
              <p className="text-card-ink text-xl font-black tabular-nums leading-tight">
                <CountUp target={mm.peakHour} isVisible={isVisible} />
                <span className="text-sm font-extrabold ml-0.5">시</span>
                <span className="text-card-ink-faint text-[11px] font-bold ml-1">
                  · {mm.peakHourCount}건
                </span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-card-ink-muted leading-relaxed text-center">
          🌅 출근 전 새벽-아침. 평균적으로 한 사람이{' '}
          <span className="font-extrabold text-card-ink">21일 중 {mm.avgDaysPerPerson.toFixed(1)}일</span>
          은 새벽에 뛰었다.
        </p>
      </div>
    </AnimateOnScroll>
  );
}
