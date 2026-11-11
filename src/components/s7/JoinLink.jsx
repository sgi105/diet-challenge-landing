import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { JOIN_LINK_LABEL7 } from '../../data/season7';
import { JOIN_PATH7 } from '../../hooks/useSeason7Status';

// 오픈 알림 모드에서 결제 페이지(/s7/join)로 가는 공개 링크 — 실제 상품 페이지라 숨기진 않되,
// 랜딩 맨 밑(푸터 위). 2026-11-11: 카드사 심사에서 숨긴 결제 경로로 보이지 않게 일반 버튼 모양으로 변경.
export default function JoinLink({ placement = 'unknown', className = '' }) {
  return (
    <div className={`px-6 pt-2 pb-6 max-w-lg mx-auto text-center ${className}`}>
      <Link
        to={JOIN_PATH7}
        onClick={() => track('s7_join_link_click', { placement })}
        className="inline-block px-5 py-2.5 rounded-xl border border-white/25 text-sm font-bold text-text-primary hover:bg-white/10 transition-all"
      >
        {JOIN_LINK_LABEL7}
      </Link>
    </div>
  );
}
