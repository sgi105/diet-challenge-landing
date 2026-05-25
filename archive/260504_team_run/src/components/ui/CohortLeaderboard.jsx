import cohort from '../../data/cohort.json';

export default function CohortLeaderboard() {
  const rows = cohort.stats.leaderboard;
  const max = Math.max(...rows.map(r => r.loss));

  return (
    <div className="bg-bg-card rounded-2xl p-5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-card-ink-faint text-[11px] font-bold tracking-wider">
          11명 전원 감량 (Day 25 / 30 기준)
        </p>
        <p className="text-card-ink-faint text-[10px] font-semibold">
          누적 -{cohort.stats.totalLossKg}kg
        </p>
      </div>
      <div className="space-y-1.5">
        {rows.map((row, i) => {
          const pct = Math.max(8, Math.round((row.loss / max) * 100));
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="text-card-ink-muted text-[11px] font-semibold w-10 shrink-0">{row.name}</span>
              <div className="flex-1 bg-bg-card-hover rounded-full h-5 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-end pr-2 text-[11px] font-extrabold text-card-ink mix-blend-difference">
                  -{row.loss}kg
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-card-ink-faint text-[10px] mt-3 text-right">
        평균 -{cohort.stats.avgLossKg}kg · 5일 더 남음
      </p>
    </div>
  );
}
