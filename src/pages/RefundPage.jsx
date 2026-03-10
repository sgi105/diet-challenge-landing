import { Link } from 'react-router-dom';

export default function RefundPage() {
  return (
    <div className="bg-bg-primary min-h-screen px-6 py-12 max-w-lg mx-auto">
      <Link to="/" className="text-accent-green text-sm mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-2xl font-extrabold mb-8">환불정책</h1>
      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">1. 챌린지 시작 전 환불</h2>
          <p>챌린지 시작일 이전에 취소를 요청하시면 예치금 전액을 환불해 드립니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>시작일 3일 전까지: 전액 환불</li>
            <li>시작일 2일 전 ~ 시작일: 전액 환불 (단, 결제 수수료 제외)</li>
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
            <li>예치금 전액 환급</li>
            <li>성공 보너스 40,000원 추가 지급</li>
            <li>환급은 챌린지 종료 후 7일 이내 처리</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">4. 성공 기준</h2>
          <div className="bg-bg-card rounded-xl p-4 border border-border mt-2">
            <p className="text-text-primary font-semibold">미션 수행률 90% 이상 + 5kg 감량</p>
            <p className="mt-2 text-text-muted">두 조건을 모두 충족해야 성공으로 인정됩니다.</p>
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

        <p className="text-text-muted pt-4">시행일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
