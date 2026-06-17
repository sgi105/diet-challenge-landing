import { useEffect, useState } from 'react';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import ApplicantAvatar from '../ui/ApplicantAvatar';
import { listApplicantsPublic } from '../../lib/applyApi';
import { COHORT2 } from '../../data/config2';

const RUN_LABELS = {
  full_marathon: '풀마라톤',
  half_marathon: '하프',
  run_10km: '10km',
  run_5km: '5km',
  run_1km: '1km',
  almost_none: '러닝 시작',
};

function relTime(ts) {
  const ms = Date.now() - new Date(ts).getTime();
  if (ms < 60000) return '방금';
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export default function LiveApplicantsSection() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const json = await listApplicantsPublic(COHORT2.cohortCode);
        if (alive) setData(json);
      } catch (e) {
        if (alive) setError(e.message || String(e));
      }
    }
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (error || !data || !data.count) return null;

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center">
          <span className="pill text-accent-green">LIVE · 실시간</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          지금<br />지원하는 사람들
        </h2>
        <p className="text-text-muted text-center text-xs mb-8">
          선착순 30명 · 같은 조건이면 일찍 지원한 사람 우선
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-5 shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest">RECENT APPLICANTS</p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-accent-orange">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" />
              LIVE
            </span>
          </div>
          {/* 전체 지원자 스크롤 — 8명까지 보이고 그 이상은 내부 스크롤 */}
          <div
            className="space-y-4 max-h-[520px] overflow-y-auto pr-1"
            style={{ scrollbarWidth: 'thin' }}
          >
            {data.recent.map((r, i) => (
              <div key={i} className="flex gap-3">
                <ApplicantAvatar name={r.name} instagram={r.instagram} size={36} className="text-xs mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <p className="text-card-ink text-sm font-bold truncate">
                      {r.name} · {r.age}세
                      <span className="text-card-ink-faint font-semibold ml-1.5">
                        {r.region}{r.region && ' · '}{RUN_LABELS[r.running_exp] || ''}
                      </span>
                    </p>
                    <span className="text-card-ink-faint text-[10px] font-semibold shrink-0">
                      {relTime(r.created_at)}
                    </span>
                  </div>
                  {r.motivation && (
                    <p className="text-card-ink-muted text-[12px] leading-relaxed line-clamp-2">
                      "{r.motivation}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {data.recent.length > 8 && (
            <p className="text-card-ink-faint text-[10px] text-center mt-3 font-semibold">
              ↓ 스크롤해서 전체 보기
            </p>
          )}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
