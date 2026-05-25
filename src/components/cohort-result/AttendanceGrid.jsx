import { useState } from 'react';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import stats from '../../data/season0-stats.json';

const PREVIEW_COUNT = 12;

export default function AttendanceGrid() {
  const [expanded, setExpanded] = useState(false);
  const members = stats.members;
  const matrix = stats.attendanceMatrix;
  const shown = expanded ? members : members.slice(0, PREVIEW_COUNT);
  const hidden = members.length - PREVIEW_COUNT;

  return (
    <AnimateOnScroll className="max-w-md mx-auto w-full">
      <div className="bg-bg-card rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-card-ink text-sm font-extrabold">출석 그리드</p>
          <p className="text-card-ink-faint text-[10px] font-semibold">30명 × 21일</p>
        </div>

        {/* day axis */}
        <div className="flex items-center gap-1.5 mb-2 pl-12">
          {Array.from({ length: 21 }, (_, i) => i + 1).map((d) => (
            <span
              key={d}
              className={`text-[8px] font-bold tabular-nums w-[10px] text-center ${
                d % 7 === 0 || d === 1 ? 'text-card-ink-muted' : 'text-transparent'
              }`}
            >
              {d}
            </span>
          ))}
        </div>

        <div className={expanded ? 'space-y-1.5' : 'space-y-1.5'}>
          {shown.map((m) => {
            const row = matrix[m.id] || [];
            const count = row.filter(Boolean).length;
            return (
              <div key={m.id} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 w-10 shrink-0">
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover bg-card-border"
                      loading="lazy"
                    />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-card-border flex items-center justify-center text-[9px] font-extrabold text-card-ink">
                      {m.initial}
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-card-ink-muted">{m.initial}★</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  {row.map((cell, i) => (
                    <span
                      key={i}
                      className={`w-[10px] h-[10px] rounded-[2px] block ${
                        cell ? 'bg-accent-green' : 'bg-card-border'
                      }`}
                      title={`day${i + 1} ${cell ? '인증' : '미인증'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] tabular-nums font-extrabold text-card-ink w-8 text-right">
                  {count}/21
                </span>
              </div>
            );
          })}
        </div>

        {hidden > 0 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 w-full text-center text-[11px] font-extrabold text-bg-primary py-2 rounded-lg bg-bg-card-hover hover:bg-card-border transition"
          >
            {expanded ? '접기' : `전체 ${members.length}명 보기 ↓`}
          </button>
        )}

        <p className="mt-3 text-[10px] text-card-ink-faint leading-relaxed">
          <span className="inline-block w-2 h-2 bg-accent-green rounded-sm mr-1 align-middle" />
          인증 완료
          <span className="inline-block w-2 h-2 bg-card-border rounded-sm ml-3 mr-1 align-middle" />
          미인증
        </p>
      </div>
    </AnimateOnScroll>
  );
}
