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
  if (totalKm >= 1400) return { label: '서울 ↔ 부산', detail: '4번 왕복', km: '약 1,640km' };
  if (totalKm >= 800) return { label: '서울 ↔ 부산', detail: '2번 왕복', km: '약 820km' };
  if (totalKm >= 400) return { label: '서울 ↔ 부산', detail: '한 번 왕복', km: '약 410km' };
  if (totalKm >= 100) return { label: '서울 → 대전', detail: '한 번', km: '약 150km' };
  return null;
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

  const linePath = points.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD_T + CHART_H).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD_T + CHART_H).toFixed(1)} Z`;

  const yTicks = [0, 0.5, 1].map((p) => ({
    value: Math.round(maxKm * p),
    y: PAD_T + CHART_H - p * CHART_H,
  }));

  const xTicks = [1, 5, 10, 15, 21];

  return (
    <AnimateOnScroll className="max-w-md mx-auto w-full">
      <div className="bg-bg-card rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-card-ink text-sm font-extrabold">누적 달린 거리</p>
          <p className="text-card-ink-faint text-[10px] font-semibold">day1 → day21</p>
        </div>

        <div className="mb-4 flex items-baseline gap-3">
          <div>
            <p className="text-card-ink-muted text-[10px] font-bold tracking-widest uppercase mb-0.5">
              1인당 평균
            </p>
            <p className="text-card-ink text-4xl md:text-5xl font-black tabular-nums leading-none">
              <span className="lime-mark">{perPersonKm}</span>
              <span className="text-2xl font-extrabold ml-1">km</span>
            </p>
          </div>
          <div className="text-right ml-auto">
            <p className="text-card-ink-faint text-[10px] font-bold">30명 누적</p>
            <p className="text-card-ink text-base font-extrabold tabular-nums">
              {totalKm.toLocaleString()}<span className="text-xs ml-0.5">km</span>
            </p>
          </div>
        </div>

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

          <path d={areaPath} fill="url(#cumGrad)" />
          <path
            d={linePath}
            fill="none"
            stroke="#0a1f8a"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill="#0a1f8a"
            stroke="#c8ff4d"
            strokeWidth="2"
          />

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
          <div className="mt-4 bg-accent-green/15 border border-accent-green/40 rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-2xl shrink-0">🛣️</span>
            <div className="flex-1 min-w-0">
              <p className="text-card-ink-muted text-[10px] font-bold tracking-widest uppercase">
                이게 어느 정도냐면
              </p>
              <p className="text-card-ink text-xl md:text-2xl font-black leading-tight tracking-tight">
                {familiar.label}{' '}
                <span className="text-accent-green-bright bg-bg-primary px-1.5 py-0.5 rounded-md">
                  {familiar.detail}
                </span>
              </p>
              <p className="text-card-ink-faint text-[10px] font-semibold mt-0.5">
                {familiar.km}
              </p>
            </div>
          </div>
        )}
      </div>
    </AnimateOnScroll>
  );
}
