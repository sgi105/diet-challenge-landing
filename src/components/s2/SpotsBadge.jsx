import { spotsInfo, TOTAL_SPOTS } from '../../lib/spots';

// 모집 정원(30명) 남은자리 표시 — Hero/Live/Urgency 공유.
//   여유(6자리+)   → 차분한 텍스트
//   마감 임박(5↓)  → 게이지 바 (filled/30) + "마감 임박"
//   마감(0)        → 회색 비활성 배지
export default function SpotsBadge({ count, className = '' }) {
  const spots = spotsInfo(count);
  if (!spots) return null;

  const wrap = (inner) => <div className={`flex justify-center ${className}`}>{inner}</div>;

  if (spots.full) {
    return wrap(
      <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full text-[12px] font-extrabold tracking-wide border-2 border-text-muted/40 bg-text-muted/10 text-text-muted">
        정원 30명 마감
      </span>
    );
  }
  if (spots.low) {
    const pct = Math.round((spots.filled / TOTAL_SPOTS) * 100);
    return wrap(
      <div className="w-[280px]">
        <div className="flex justify-between items-center mb-2">
          <span className="text-accent-orange text-[13px] font-extrabold tracking-wide">🔥 마감 임박</span>
          <span className="text-text-primary text-[13px] font-extrabold">{spots.filled} / {TOTAL_SPOTS}</span>
        </div>
        <div className="h-2.5 bg-white/15 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-accent-orange/80 to-accent-orange" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[12.5px] text-text-secondary mt-2 text-center font-semibold">
          딱 <b className="text-accent-green">{spots.remaining}자리</b> 남았어
        </p>
      </div>
    );
  }
  return wrap(
    <span className="text-[13px] font-extrabold tracking-wide text-text-secondary">
      정원 30명 중 <span className="text-accent-green">{spots.remaining}자리</span> 남음
    </span>
  );
}
