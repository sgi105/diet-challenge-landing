import AnimateOnScroll from '../ui/AnimateOnScroll';
import { PROGRAM5, COHORT5 } from '../../data/season5';
import { WEEKS_V2 } from '../../data/season5v2';

// v2 — 21일 프로그램 자체를 보여주는 자리. (2026-09-18 반복 정리)
// 팀 배정·응원·책임감·팀 우승 상금은 공감 섹션 "같이 하면" 항목이 담당하므로 여기서 빼고
// "처음엔 쉽게 → 매일 조금씩 → 파이널 5K"라는 21일 흐름만 남긴다.
export default function SystemSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black mb-4 text-text-primary leading-tight break-keep">
          하루 10분 시작으로<br />
          <span className="text-accent-green">부담 없이</span>
        </h2>
        <p className="text-text-secondary mb-8 leading-relaxed break-keep">
          졸라 쉽게 시작해. 성공을 매일 쌓다 보면 관성이 붙어서 점점 쉬워져.
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <p className="text-text-muted text-xs font-bold tracking-widest mb-3">
          21일 흐름
        </p>
        <div className="space-y-2">
          {WEEKS_V2.map((w) => (
            <div
              key={w.label}
              className={`flex items-center gap-3 rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${
                w.highlight ? 'bg-accent-green text-bg-primary' : 'bg-bg-card text-card-ink'
              }`}
            >
              <span
                className={`text-[11px] font-extrabold tracking-widest shrink-0 w-16 ${
                  w.highlight ? 'text-bg-primary/80' : 'text-card-ink-faint'
                }`}
              >
                {w.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base leading-tight ${w.highlight ? 'text-bg-primary' : 'text-card-ink'}`}>
                  {w.title}
                </p>
                <p className={`text-sm ${w.highlight ? 'text-bg-primary/80' : 'text-card-ink-muted'}`}>
                  {w.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      {/* 러닝 시간표 — 10분에서 20분까지 어떻게 올라가는지 한눈에 */}
      <AnimateOnScroll className="mt-8">
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-4">DAILY MINUTES</p>
          <div className="flex items-end gap-[3px] h-24 mb-3">
            {Array.from({ length: COHORT5.durationDays }, (_, i) => {
              const min = Math.min(PROGRAM5.startMinutes + i, PROGRAM5.peakMinutes);
              const isFinal = i === COHORT5.durationDays - 1;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-[3px] ${isFinal ? 'bg-accent-orange' : 'bg-accent-green'}`}
                  style={{ height: `${(min / PROGRAM5.peakMinutes) * 100}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-card-ink-muted text-[11px] font-bold">
            <span>Day 1 · {PROGRAM5.startMinutes}분</span>
            <span>Day {PROGRAM5.peakDay} · {PROGRAM5.peakMinutes}분</span>
            <span className="text-accent-orange">Day {COHORT5.durationDays} · {PROGRAM5.finalDistanceKm}K</span>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
