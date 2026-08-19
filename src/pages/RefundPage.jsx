import { Link } from 'react-router-dom';
import { ACTIVE } from '../data/activeCohort';

// 환불/환급 정책 — 현재 액티브 기수(activeCohort.js) 기준.
// 금액·성공 기준은 랜딩·지원서와 반드시 같은 값을 써야 해서 ACTIVE에서 끌어온다.
export default function RefundPage() {
  return (
    <div className="bg-bg-primary min-h-screen px-6 py-12 max-w-lg mx-auto">
      <Link to="/" className="text-accent-green text-sm mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-2xl font-extrabold mb-8">환불정책</h1>
      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">1. 챌린지 시작 전 환불</h2>
          <p>합격 후 오리엔테이션(OT) 전까지 취소를 요청하시면 예치금 전액을 환불해 드립니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>OT({ACTIVE.otLabel} {ACTIVE.otTimeLabel}) 시작 전까지: 전액 환불</li>
            <li>OT 이후 ~ 챌린지 시작({ACTIVE.startDateLabel}) 전: 전액 환불 (단, 송금 수수료 제외)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">2. 챌린지 진행 중 환불</h2>
          <p>챌린지가 시작된 이후에는 원칙적으로 환불이 불가합니다.</p>
          <p className="mt-2">다만, 다음의 경우 환불이 가능합니다:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>회사의 귀책 사유로 서비스 제공이 불가한 경우: 전액 환불</li>
            <li>의료적 사유 (진단서 제출 시): 잔여 기간 비례 환불</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">3. 챌린지 성공 시 환급</h2>
          <p>성공 기준을 충족한 경우:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>예치금 {ACTIVE.deposit.toLocaleString()}원 전액 환급</li>
            <li>최종 1등 팀은 팀원 전원에게 {ACTIVE.prizeTeam1st} 별도 지급</li>
            <li>환급은 챌린지 종료 후 7일 이내 처리</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">4. 성공 기준</h2>
          {/* bg-card는 흰색이므로 text-primary(흰 글씨)를 쓰면 글자가 사라진다. 카드용 색으로 쓸 것. */}
          <div className="bg-bg-card rounded-xl p-4 mt-2">
            <p className="text-card-ink font-semibold">
              {ACTIVE.durationDays}일 미션 수행률 {ACTIVE.successRate}% 이상 + 파이널 {ACTIVE.finalDistanceKm}K 레이스 완주
            </p>
            <p className="mt-2 text-card-ink-muted">
              두 조건을 모두 충족해야 성공으로 인정됩니다. {ACTIVE.durationDays}일 중 최대 {ACTIVE.passCount}회의 미완료는
              수행률 계산에서 인정됩니다.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">5. 챌린지 실패 시</h2>
          <p>성공 기준을 충족하지 못한 경우 예치금은 반환되지 않습니다. 몰수된 예치금은 성공자 보너스 및 서비스 운영에 사용됩니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">6. 환불 신청 방법</h2>
          <p>이메일: justinshin3610@gmail.com</p>
          <p className="mt-2">환불 처리는 신청일로부터 영업일 기준 3~5일 소요됩니다.</p>
        </section>

        <p className="text-text-muted pt-4">시행일: 2026년 8월 19일</p>
      </div>
    </div>
  );
}
