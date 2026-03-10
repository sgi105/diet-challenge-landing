import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="bg-bg-primary min-h-screen px-6 py-12 max-w-lg mx-auto">
      <Link to="/" className="text-accent-green text-sm mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-2xl font-extrabold mb-8">개인정보처리방침</h1>
      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">1. 개인정보의 수집 및 이용 목적</h2>
          <p>무사(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>서비스 제공 및 챌린지 운영</li>
            <li>본인 확인 및 결제 처리</li>
            <li>코칭 피드백 및 미션 관리</li>
            <li>서비스 개선 및 맞춤 서비스 제공</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">2. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>필수: 이름, 나이, 성별</li>
            <li>결제 시: 결제 정보 (PG사를 통해 처리)</li>
            <li>자동 수집: 접속 로그, 쿠키, IP 주소</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>이용자의 개인정보는 서비스 이용 기간 동안 보유하며, 목적 달성 후 지체 없이 파기합니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>계약 또는 청약 철회에 관한 기록: 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
            <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">4. 개인정보의 제3자 제공</h2>
          <p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 경우는 예외로 합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">5. 개인정보의 파기</h2>
          <p>보유 기간이 경과하거나 처리 목적이 달성된 경우, 해당 개인정보를 지체 없이 파기합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 자신의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.</p>
          <p className="mt-2">문의: justinshin3610@gmail.com</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">7. 개인정보 보호책임자</h2>
          <p>성명: 신가인</p>
          <p>이메일: justinshin3610@gmail.com</p>
        </section>

        <p className="text-text-muted pt-4">시행일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
