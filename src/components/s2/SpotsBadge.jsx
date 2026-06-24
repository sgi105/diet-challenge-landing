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
    return wrap(
      <div className="w-[290px] max-w-full">
        <div className="flex justify-between items-baseline mb-2.5">
          <span className="text-accent-orange text-[13px] font-extrabold tracking-wide animate-pulse">🔥 마감 임박</span>
          <span className="text-text-primary text-[13px] font-extrabold">
            딱 <span className="text-accent-green text-[19px] font-black">{spots.remaining}자리</span> 남음
          </span>
        </div>
        <div className="flex gap-[3px]">
          {Array.from({ length: TOTAL_SPOTS }, (_, i) => (
            <div key={i} className={`flex-1 h-4 rounded-[3px] ${i < spots.filled ? 'bg-accent-orange' : 'bg-white/15'}`} />
          ))}
        </div>
        <p className="text-white/55 text-[11.5px] font-semibold mt-2.5">30명 중 {spots.filled}명 신청 완료</p>
      </div>
    );
  }
  return wrap(
    <span className="text-[13px] font-extrabold tracking-wide text-text-secondary">
      정원 30명 중 <span className="text-accent-green">{spots.remaining}자리</span> 남음
    </span>
  );
}
