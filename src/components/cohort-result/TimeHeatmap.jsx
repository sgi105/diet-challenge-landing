import AnimateOnScroll from '../ui/AnimateOnScroll';
import stats from '../../data/season0-stats.json';

const HOUR_BUCKETS = [
  { label: '새벽\n5-8', hours: [5, 6, 7] },
  { label: '오전\n8-12', hours: [8, 9, 10, 11] },
  { label: '낮\n12-17', hours: [12, 13, 14, 15, 16] },
  { label: '저녁\n17-22', hours: [17, 18, 19, 20, 21] },
  { label: '밤\n22-5', hours: [22, 23, 0, 1, 2, 3, 4] },
];

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

export default function TimeHeatmap() {
  const raw = stats.hourlyByWeekday;

  // Build matrix [weekday][bucket] = count
  const matrix = WEEKDAYS.map((_, w) => HOUR_BUCKETS.map((b) => {
    const wRow = raw[w] || {};
    return b.hours.reduce((sum, h) => sum + (wRow[h] || 0), 0);
  }));

  const flat = matrix.flat();
  const max = Math.max(...flat, 1);

  // Find peak bucket for insight
  let peakBucketIdx = 0;
  let peakBucketTotal = 0;
  HOUR_BUCKETS.forEach((_, bi) => {
    const total = WEEKDAYS.reduce((s, _w, wi) => s + matrix[wi][bi], 0);
    if (total > peakBucketTotal) {
      peakBucketTotal = total;
      peakBucketIdx = bi;
    }
  });

  function cellColor(count) {
    if (count === 0) return 'rgba(255,255,255,0.06)';
    const intensity = count / max;
    // Lime green at full intensity
    const alpha = 0.18 + intensity * 0.82;
    return `rgba(200, 255, 77, ${alpha})`;
  }

  return (
    <AnimateOnScroll className="max-w-md mx-auto w-full">
      <div className="bg-bg-card rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-card-ink text-sm font-extrabold">언제 운동했나</p>
          <p className="text-card-ink-faint text-[10px] font-semibold">요일 × 시간대</p>
        </div>
        <p className="text-card-ink-muted text-[11px] mb-3">
          전체 {stats.summary.totalAttendance}건 · KST 기준
        </p>

        {/* column headers */}
        <div className="grid grid-cols-[2rem_repeat(5,1fr)] gap-1 mb-1">
          <span />
          {HOUR_BUCKETS.map((b, i) => (
            <span
              key={i}
              className="text-[9px] font-bold text-card-ink-muted text-center leading-tight whitespace-pre-line"
            >
              {b.label}
            </span>
          ))}
        </div>

        {WEEKDAYS.map((day, w) => (
          <div key={day} className="grid grid-cols-[2rem_repeat(5,1fr)] gap-1 mb-1">
            <span className="text-[10px] font-extrabold text-card-ink-muted self-center">
              {day}
            </span>
            {HOUR_BUCKETS.map((_, bi) => {
              const c = matrix[w][bi];
              return (
                <div
                  key={bi}
                  className="aspect-square rounded-[3px] flex items-center justify-center"
                  style={{ background: cellColor(c) }}
                  title={`${day} ${HOUR_BUCKETS[bi].label.replace('\n', ' ')}시: ${c}건`}
                >
                  <span
                    className={`text-[9px] tabular-nums font-extrabold ${
                      c / max > 0.5 ? 'text-bg-primary' : 'text-card-ink-muted'
                    }`}
                  >
                    {c || ''}
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        <p className="mt-3 text-[11px] text-card-ink-muted leading-relaxed">
          🔥 피크 — <span className="font-extrabold text-card-ink">
            {HOUR_BUCKETS[peakBucketIdx].label.replace('\n', ' ')}시
          </span>{' '}
          ({peakBucketTotal}건)
        </p>
      </div>
    </AnimateOnScroll>
  );
}
