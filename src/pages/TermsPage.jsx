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
          <p>1. "서비스"란 회사가 제공하는 온라인 러닝·운동 습관 챌린지 및 코칭 프로그램을 말합니다.</p>
          <p>2. "이용자"란 본 약관에 따라 서비스를 이용하는 자를 말합니다.</p>
          <p>3. "참가비"란 챌린지(프로그램) 참여를 위해 이용자가 결제하는 이용 대금을 말합니다.</p>
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
          <p>1. 챌린지 참여를 위해 참가비를 결제하여야 하며, 결제가 완료되면 참가가 확정됩니다.</p>
          <p>2. 서비스 내용, 제공 기간, 금액은 각 기수의 모집 페이지 및 결제 페이지에 명시합니다.</p>
          <p>3. 미션 성공 기준(인증 일수, 파이널 미션 등)은 프로그램 운영 기준이며, 참가비의 반환 여부와는 관계가 없습니다.</p>
          <p>4. 청약철회 및 환불은 「전자상거래 등에서의 소비자보호에 관한 법률」과 환불정책에 따릅니다.</p>
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

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">부칙</h2>
          <p>1. 본 약관은 2026년 10월 27일부터 시행합니다.</p>
          <p>2. 시행일 이전에 결제된 기수(시즌6 이전)의 결제 건에는 결제 당시 안내된 약관과 환불정책을 적용합니다.</p>
        </section>

        <p className="text-text-muted pt-4">시행일: 2026년 10월 27일</p>
      </div>
    </div>
  );
}
