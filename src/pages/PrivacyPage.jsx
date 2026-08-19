import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="bg-bg-primary min-h-screen px-6 py-12 max-w-lg mx-auto">
      <Link to="/" className="text-accent-green text-sm mb-8 inline-block">&larr; 돌아가기</Link>
      <h1 className="text-2xl font-extrabold mb-8">개인정보 처리방침</h1>
      <div className="space-y-6 text-text-secondary text-sm leading-relaxed">
        <p>
          무사(이하 "회사")는 이용자의 개인정보를 소중히 다루며, 개인정보보호법 및 관련 법령을 준수합니다.
        </p>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">사업자 정보</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            <dl className="divide-y divide-border text-xs">
              <div className="grid grid-cols-[100px_1fr] gap-2 px-3 py-2.5">
                <dt className="text-text-muted">상호</dt>
                <dd className="text-text-primary">무사 SAMURAI</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 px-3 py-2.5">
                <dt className="text-text-muted">대표</dt>
                <dd className="text-text-primary">신가인</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 px-3 py-2.5">
                <dt className="text-text-muted">사업자등록번호</dt>
                <dd className="text-text-primary">593-03-01517</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 px-3 py-2.5">
                <dt className="text-text-muted">주소</dt>
                <dd className="text-text-primary">서울특별시 광진구 용마산로1길 11-4, 501호 (중곡동)</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 px-3 py-2.5">
                <dt className="text-text-muted">대표전화</dt>
                <dd className="text-text-primary">010-4240-3121</dd>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-2 px-3 py-2.5">
                <dt className="text-text-muted">이메일</dt>
                <dd><a href="mailto:justinshin3610@gmail.com" className="text-accent-green underline">justinshin3610@gmail.com</a></dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">1. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              챌린지 지원서: 이름, 나이, 성별, 휴대폰 번호, 직업, 거주 지역, 러닝 경력,
              지원 동기, 목표(단기·최종 목표 및 목표 기록), 현재 러닝 기록,
              오리엔테이션 참석 가능 여부, 인스타그램 ID, 카카오톡 ID,
              추천인 및 함께 지원하는 지인의 이름
            </li>
            <li>회원 가입·운영: 이름, 이메일, 나이, 프로필 사진</li>
            <li>챌린지 운영: 키·체중 등 건강 정보, 운동 인증 기록 및 사진</li>
            <li>보증금 입금·환급 시: 입금자명, 환급 계좌 정보</li>
            <li>경품 발송 시 별도 수집: 이름, 주소, 연락처</li>
            <li>자동 수집: 접속 로그, 쿠키, IP 주소, 기기 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">2. 개인정보의 이용 목적</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>지원서 심사를 통한 참가자 선발 및 팀 배정</li>
            <li>합격 발표·입금 안내 등 문자 및 메시지 발송</li>
            <li>챌린지 운영 및 미션·점수 결산</li>
            <li>코치 매칭 및 피드백 제공</li>
            <li>보증금 환급 처리</li>
            <li>경품 발송 및 본인 확인</li>
            <li>서비스 개선 및 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>이용자가 회원 탈퇴를 요청하거나, <strong className="text-text-primary">챌린지 종료 후 1년</strong>이 경과한 경우 지체 없이 파기합니다.</p>
          <p className="mt-2">단, 관계 법령에 따라 보존이 필요한 경우(전자상거래법 등)에는 해당 기간 동안 보존합니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>계약 또는 청약 철회에 관한 기록: 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
            <li>소비자 불만 또는 분쟁 처리에 관한 기록: 3년</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">4. 개인정보 처리 위탁</h2>
          <p>회사는 원활한 운영을 위해 아래 사업자에 개인정보 처리를 위탁합니다.</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Supabase — 데이터베이스 저장·관리</li>
            <li>Vercel — 앱 호스팅·배포</li>
            <li>솔라피(Solapi) — 합격·안내 문자 발송 시 이름·휴대폰 번호 전달</li>
            <li>텔레그램 — 신규 지원 발생 시 운영자 알림 전달</li>
            <li>경품 협찬사 — 경품 발송 시 이름·주소·연락처 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">5. 개인정보의 제3자 제공</h2>
          <p>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 경우는 예외로 합니다.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 자신의 개인정보에 대해 열람·정정·삭제·처리 정지를 요청할 수 있습니다.</p>
          <p className="mt-2">앱 내 프로필 페이지의 "회원 탈퇴 요청" 기능, 또는 코치에게 메시지를 보내거나 아래 이메일로 요청해주세요.</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">7. 개인정보 보호 책임자</h2>
          <p>성명: 신가인</p>
          <p>이메일: justinshin3610@gmail.com</p>
          <p>연락처: 010-4240-3121</p>
        </section>

        <section>
          <h2 className="text-text-primary font-bold text-base mb-2">8. 개인정보의 파기</h2>
          <p>보유 기간이 경과하거나 처리 목적이 달성된 경우, 해당 개인정보는 복구할 수 없는 방법으로 지체 없이 파기합니다.</p>
        </section>

        <p className="text-text-muted pt-4">시행일: 2026년 8월 20일</p>
      </div>
    </div>
  );
}
