import { useEffect, useState } from 'react';
import { COHORT } from '../../data/config';
import { listApplicantsPublic } from '../../lib/applyApi';

export default function LiveCountStrip() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const json = await listApplicantsPublic();
        if (alive) setData(json);
      } catch {
        /* swallow — strip is non-critical */
      }
    }
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (!data || !data.count) return null;
  const ratio = Math.max(1, Math.round((data.count / COHORT.totalSpots) * 10) / 10);

  return (
    <section className="px-6 -mt-2 mb-2 max-w-lg mx-auto">
      <div className="bg-bg-card rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-accent-orange shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
          LIVE
        </span>
        <p className="text-card-ink text-sm font-bold flex-1">
          지금까지 <span className="text-bg-primary font-black">{data.count}명</span> 지원 ·{' '}
          <span className="text-card-ink-muted">30명 선발 · 경쟁률 약 {ratio}:1</span>
        </p>
      </div>
    </section>
  );
}
