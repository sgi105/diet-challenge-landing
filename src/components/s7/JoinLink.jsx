import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { JOIN_LINK_LABEL7 } from '../../data/season7';
import { JOIN_PATH7 } from '../../hooks/useSeason7Status';

// 오픈 알림 모드에서 결제 페이지(/s7/join)로 가는 공개 링크 — 실제 상품 페이지라 숨기진 않되,
// 랜딩 맨 밑(푸터 위)에 한 번만 작고 흐리게 둔다(가인 2026-10-28).
export default function JoinLink({ placement = 'unknown', className = '' }) {
  return (
    <div className={`px-6 pt-2 pb-6 max-w-lg mx-auto text-center ${className}`}>
      <Link
        to={JOIN_PATH7}
        onClick={() => track('s7_join_link_click', { placement })}
        className="text-[11px] font-medium text-text-muted/60 underline underline-offset-2 decoration-white/15 hover:text-text-muted"
      >
        {JOIN_LINK_LABEL7}
      </Link>
    </div>
  );
}
