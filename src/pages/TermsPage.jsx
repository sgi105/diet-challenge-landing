import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="bg-bg-primary min-h-screen px-6 py-12 max-w-lg mx-auto">
      <Link to="/" className="text-accent-green text-sm mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-2xl font-extrabold mb-8">이용약관</h1>
      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">제1조 (목적)</h2>
          <p>본 약관은 무사(이하 "회사")가 운영하는 웹사이트 및 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">제2조 (정의)</h2>
          <p>1. "서비스"란 회사가 제공하는 온라인 다이어트 챌린지 및 코칭 프로그램을 말합니다.</p>
          <p>2. "이용자"란 본 약관에 따라 서비스를 이용하는 자를 말합니다.</p>
          <p>3. "예치금"이란 챌린지 참여를 위해 이용자가 납부하는 금액을 말합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">제3조 (약관의 효력 및 변경)</h2>
          <p>1. 본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
          <p>2. 회사는 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 7일 전 공지합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">제4조 (서비스 이용)</h2>
          <p>1. 서비스는 만 14세 이상의 자가 이용할 수 있습니다.</p>
          <p>2. 이용자는 본 약관 및 회사가 정한 규정을 준수하여야 합니다.</p>
          <p>3. 서비스 이용을 위해 필요한 개인정보를 정확하게 제공하여야 합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">제5조 (챌린지 참여)</h2>
          <p>1. 챌린지 참여를 위해 예치금을 납부하여야 합니다.</p>
          <p>2. 성공 기준은 미션 수행률 90% 이상 및 목표 체중 감량 달성입니다.</p>
          <p>3. 성공 기준 충족 시 예치금 전액 환급 및 보너스가 지급됩니다.</p>
          <p>4. 성공 기준 미달 시 예치금은 반환되지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">제6조 (회사의 의무)</h2>
          <p>1. 회사는 안정적인 서비스 제공을 위해 최선을 다합니다.</p>
          <p>2. 회사는 이용자의 개인정보를 보호하며, 개인정보처리방침에 따라 관리합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">제7조 (이용자의 의무)</h2>
          <p>1. 이용자는 타인의 정보를 도용하거나 허위 정보를 제공해서는 안 됩니다.</p>
          <p>2. 이용자는 서비스를 통해 얻은 정보를 회사의 사전 동의 없이 상업적으로 이용할 수 없습니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">제8조 (분쟁 해결)</h2>
          <p>1. 서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 상호 협의하여 해결합니다.</p>
          <p>2. 협의가 이루어지지 않을 경우, 관할 법원에 소송을 제기할 수 있습니다.</p>
        </section>

        <p className="text-text-muted pt-4">시행일: 2025년 1월 1일</p>
      </div>
    </div>
  );
}
