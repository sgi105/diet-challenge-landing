export default function Footer() {
  return (
    <footer className="px-6 py-12 pb-28 max-w-lg mx-auto border-t border-border">
      <div className="text-text-muted text-xs space-y-2 text-center">
        <p className="text-text-secondary font-semibold">무사</p>
        <p>대표: 신가인 | 사업자등록번호: 593-03-01517</p>
        <p>주소: 서울시 양천구 목동동로 350</p>
        <p>문의: justinshin3610@gmail.com</p>
        <div className="flex justify-center gap-4 mt-4 text-text-muted">
          <a href="#" className="hover:text-text-secondary transition-colors">이용약관</a>
          <a href="#" className="hover:text-text-secondary transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-text-secondary transition-colors">환불정책</a>
        </div>
        <p className="mt-4">© 2026 무사. All rights reserved.</p>
      </div>
    </footer>
  );
}
