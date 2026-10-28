import { Link } from 'react-router-dom';
import { COHORT7, PROGRAM7, REFUND7 } from '../data/season7';

// 환불정책 — 시즌7부터 참가비(1만원 · 환급 없음) 기준 (가인 2026-10-27 추천안).
//   OT 전 전액 · 시작 후 7일 이내 남은 일수 일할 · 7일 경과 후 환불 불가.
//   전자상거래법 제17조: 가분적 용역은 제공이 개시되지 않은 부분 철회 가능 → 시작 후 7일 이내 일할 환불로 반영.
//   철회 제한 사실은 결제 페이지·상품 페이지·이 페이지에 모두 표시한다(제17조 제6항).
// 금액·날짜는 season7.js 에서 끌어온다. 시즌6 이전(보증금) 결제분은 결제 당시 정책 적용 — 맨 아래 부칙.
export default function RefundPage() {
  const total = COHORT7.durationDays;
  return (
    <div className="bg-bg-primary min-h-screen px-6 py-12 max-w-lg mx-auto">
      <Link to="/" className="text-accent-green text-sm mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-2xl font-extrabold mb-8">환불정책</h1>
      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">1. 적용 상품</h2>
          <p>90일 하프마라톤 프로그램의 첫 {total}일 체험(시즌7, {COHORT7.startDate} - {COHORT7.finalDate}) · 참가비 {PROGRAM7.fee.toLocaleString()}원</p>
          <p className="mt-1">참가비는 서비스 이용 대금이며, 미션 성공 여부에 따라 반환되는 금액이 아닙니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">2. 환불 기준</h2>
          <div className="bg-bg-card rounded-xl p-4 mt-2 space-y-2">
            <p className="text-card-ink font-semibold">① {REFUND7.fullUntil}({COHORT7.otDate} {COHORT7.otTime}) 요청: 전액 환불</p>
            <p className="text-card-ink font-semibold">② 시작일({COHORT7.startDate})부터 {REFUND7.proRataDays}일 이내 요청: 남은 일수만큼 일할 환불</p>
            <p className="text-card-ink-muted text-xs pl-4">환불액 = 참가비 × (남은 일수 ÷ {total}일), 10원 단위 버림. 요청한 날은 이용한 날로 봅니다.</p>
            <p className="text-card-ink font-semibold">③ 시작일부터 {REFUND7.proRataDays}일이 지난 뒤: 환불 불가</p>
          </div>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">3. 예외</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>회사의 귀책 사유로 서비스를 제공하지 못한 경우: 전액 또는 제공하지 못한 기간만큼 환불</li>
            <li>서비스 내용이 표시·광고와 다르거나 계약 내용과 다르게 이행된 경우: 관련 법령에 따라 환불</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">4. 자동 결제</h2>
          <p>{total}일 체험이 끝나도 자동으로 결제되지 않습니다. 90일 프로그램을 이어가려면 따로 신청합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">5. 환불 신청 방법</h2>
          <p>이메일: justinshin3610@gmail.com · 전화: 010-4240-3121 · 인스타그램 DM @bali_tarzan</p>
          <p className="mt-2">환불은 요청일로부터 영업일 기준 3일 이내에 결제 취소로 처리합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">부칙</h2>
          <p>본 정책은 2026년 10월 27일부터 시행합니다. 시즌6 이전에 결제된 건은 결제 당시 안내된 환불정책을 적용합니다.</p>
        </section>

        <p className="text-text-muted pt-4">시행일: 2026년 10월 27일</p>
      </div>
    </div>
  );
}
