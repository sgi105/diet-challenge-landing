import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { JOIN_LINK_LABEL7, PROGRAM7, COHORT7 } from '../../data/season7';
import { JOIN_PATH7 } from '../../hooks/useSeason7Status';

// 오픈 알림 모드에서 "지금 바로 참가 확정"으로 가는 공개 링크 — 결제가 열려 있는 실제 상품 페이지(/s7/join).
// 카드사 심사도 이 경로로 상품·가격·환불정책·결제창을 확인한다. 숨기지 말 것(가인 2026-10-27 "랜딩에 링크로 공개").
export default function JoinLink({ placement = 'unknown', className = '' }) {
  return (
    <Link
      to={JOIN_PATH7}
      onClick={() => track('s7_join_link_click', { placement })}
      className={`block text-center text-[13px] font-extrabold text-text-secondary underline underline-offset-4 decoration-white/30 hover:text-accent-green ${className}`}
    >
      {JOIN_LINK_LABEL7} →
      <span className="block text-[11px] font-bold text-text-muted no-underline mt-1">
        참가비 {PROGRAM7.feeLabel} · {COHORT7.startDate} 시작 · 28일
      </span>
    </Link>
  );
}
