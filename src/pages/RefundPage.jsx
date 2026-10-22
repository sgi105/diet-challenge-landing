import { Link } from 'react-router-dom';
import { ACTIVE } from '../data/activeCohort';

// 환불 정책 — 현재 액티브 기수(activeCohort.js) 기준. 시즌6: 참가비 무료 + 보증금(카드 결제) · 성공 시 결제 취소로 환급.
// 금액·성공 기준은 랜딩·지원서와 반드시 같은 값을 써야 해서 ACTIVE에서 끌어온다.
export default function RefundPage() {
  return (
    <div className="bg-bg-primary min-h-screen px-6 py-12 max-w-lg mx-auto">
      <Link to="/" className="text-accent-green text-sm mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-2xl font-extrabold mb-8">환불정책</h1>
      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">1. 챌린지 시작 전 환불</h2>
          <p>참가비는 무료이며, 보증금({ACTIVE.depositLabel})을 결제한 뒤 오리엔테이션(OT) 시작 전까지 취소를 요청하시면 전액 환불해 드립니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>OT({ACTIVE.otLabel} {ACTIVE.otTimeLabel}) 시작 전까지: 전액 환불</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">2. 챌린지 진행 중 환불</h2>
          <p>OT 이후에는 원칙적으로 환불이 불가합니다.</p>
          <p className="mt-2">다만, 다음의 경우 환불이 가능합니다:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>회사의 귀책 사유로 서비스 제공이 불가한 경우: 전액 환불</li>
            <li>의료적 사유 (진단서 제출 시): 잔여 기간 비례 환불</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">3. 챌린지 성공 시 보증금 환급</h2>
          <p>성공 기준을 충족한 경우 보증금 {ACTIVE.depositLabel}을 전액 환급합니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>환급 방법과 일정은 챌린지 종료 시 개별 안내합니다</li>
            <li>챌린지 종료 후 7일 이내 처리</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">4. 성공 기준</h2>
          {/* bg-card는 흰색이므로 text-primary(흰 글씨)를 쓰면 글자가 사라진다. 카드용 색으로 쓸 것. */}
          <div className="bg-bg-card rounded-xl p-4 mt-2">
            <p className="text-card-ink font-semibold">
              {ACTIVE.joinDays
                ? <>합류일({ACTIVE.startDateLabel})부터 {ACTIVE.finalLabel}까지 {ACTIVE.joinDays}일 중 {ACTIVE.joinSuccessDays}일 이상 미션 인증 + 마지막 날 {ACTIVE.finalDistanceKm}km 테스트 완주</>
                : <>{ACTIVE.durationDays}일 중 {ACTIVE.successDays}일 이상 미션 인증 + 파이널 {ACTIVE.finalDistanceKm}K 레이스 완주</>}
            </p>
            <p className="mt-2 text-card-ink-muted">
              두 조건을 모두 충족해야 성공으로 인정됩니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">5. 성공 기준 미달 시</h2>
          <p>성공 기준을 충족하지 못한 경우 보증금은 1·2항의 경우를 제외하고 반환되지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">6. 환불 신청 방법</h2>
          <p>이메일: justinshin3610@gmail.com · 인스타그램 DM @bali_tarzan</p>
          <p className="mt-2">환불은 신청일로부터 영업일 기준 3-5일 안에 처리됩니다.</p>
        </section>

        <p className="text-text-muted pt-4">시행일: 2026년 10월 22일</p>
      </div>
    </div>
  );
}
