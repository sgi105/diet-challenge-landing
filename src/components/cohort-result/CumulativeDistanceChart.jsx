import AnimateOnScroll from '../ui/AnimateOnScroll';
import stats from '../../data/season0-stats.json';

const W = 320;
const H = 180;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 28;
const CHART_W = W - PAD_L - PAD_R;
const CHART_H = H - PAD_T - PAD_B;

function compareToFamiliarRoute(totalKm) {
  // Common Korean reference distances
  if (totalKm >= 1400) return `서울→부산 4번 왕복 (~1,640km)`;
  if (totalKm >= 800) return `서울→부산 2번 왕복 (~820km)`;
  if (totalKm >= 400) return `서울→부산 한 번 왕복 (~410km)`;
  if (totalKm >= 100) return `서울→대전 한 번 (~150km)`;
  return '';
}

export default function CumulativeDistanceChart() {
  const data = stats.cumulativeDistanceByDay;
  const maxKm = Math.max(...data.map((d) => d.totalKm), 1);
  const totalKm = stats.summary.totalKm;
  const perPersonKm = stats.summary.perPersonKm;
  const familiar = compareToFamiliarRoute(totalKm);

  const xStep = CHART_W / (data.length - 1);
  const points = data.map((d, i) => ({
    x: PAD_L + i * xStep,
    y: PAD_T + CHART_H - (d.totalKm / maxKm) * CHART_H,
    day: d.day,
    totalKm: d.totalKm,
  }));

  // Build smooth area path
  const linePath = points.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD_T + CHART_H).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD_T + CHART_H).toFixed(1)} Z`;

  // Y-axis ticks (4)
  const yTicks = [0, 0.5, 1].map((p) => ({
    value: Math.round(maxKm * p),
    y: PAD_T + CHART_H - p * CHART_H,
  }));

  // X-axis ticks every 5 days + last
  const xTicks = [1, 5, 10, 15, 20, 21].filter((d, i, a) => a.indexOf(d) === i);

  return (
    <AnimateOnScroll className="max-w-md mx-auto w-full">
      <div className="bg-bg-card rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-card-ink text-sm font-extrabold">누적 달린 거리</p>
          <p className="text-card-ink-faint text-[10px] font-semibold">day1 → day21</p>
        </div>
        <p className="text-card-ink-muted text-[11px] mb-3">
          총{' '}
          <span className="font-extrabold text-card-ink tabular-nums">
            {totalKm.toLocaleString()}km
          </span>{' '}
          · 1인당 평균{' '}
          <span className="font-extrabold text-card-ink tabular-nums">{perPersonKm}km</span>
        </p>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c8ff4d" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#c8ff4d" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* y grid */}
          {yTicks.map((t, i) => (
            <g key={i}>
              <line
                x1={PAD_L}
                y1={t.y}
                x2={W - PAD_R}
                y2={t.y}
                stroke="rgba(10,31,138,0.10)"
                strokeDasharray="2 3"
              />
              <text
                x={PAD_L - 4}
                y={t.y + 3}
                textAnchor="end"
                fontSize="9"
                fontWeight="700"
                fill="rgba(10,31,138,0.5)"
              >
                {t.value.toLocaleString()}
              </text>
            </g>
          ))}

          {/* area */}
          <path d={areaPath} fill="url(#cumGrad)" />
          {/* line */}
          <path
            d={linePath}
            fill="none"
            stroke="#0a1f8a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* end point dot */}
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill="#0a1f8a"
            stroke="#c8ff4d"
            strokeWidth="2"
          />

          {/* x ticks */}
          {xTicks.map((d) => {
            const p = points[d - 1];
            return (
              <text
                key={d}
                x={p.x}
                y={H - 10}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill="rgba(10,31,138,0.5)"
              >
                {d === 1 ? 'day1' : d === 21 ? 'day21' : `d${d}`}
              </text>
            );
          })}
        </svg>

        {familiar && (
          <p className="mt-2 text-[11px] text-card-ink-muted leading-relaxed">
            🛣️ 비유 — <span className="font-extrabold text-card-ink">{familiar}</span>
          </p>
        )}
      </div>
    </AnimateOnScroll>
  );
}
