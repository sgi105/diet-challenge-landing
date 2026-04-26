import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="px-6 py-12 pb-32 max-w-lg mx-auto border-t border-border">
      <div className="text-text-muted text-xs space-y-2 text-center">
        <p className="text-text-primary font-bold tracking-wide">무사 SAMURAI</p>
        <p>대표: 신가인 | 사업자등록번호: 593-03-01517</p>
        <p>주소: 서울특별시 광진구 용마산로1길 11-4, 501호(중곡동)</p>
        <p>대표전화: 010-4240-3121</p>
        <p>이메일: justinshin3610@gmail.com</p>
        <div className="flex justify-center gap-4 mt-4">
          <Link to="/terms" className="hover:text-accent-green transition-colors">이용약관</Link>
          <Link to="/privacy" className="hover:text-accent-green transition-colors">개인정보처리방침</Link>
          <Link to="/refund" className="hover:text-accent-green transition-colors">환불정책</Link>
        </div>
        <p className="mt-4 opacity-60">© 2026 무사. All rights reserved.</p>
      </div>
    </footer>
  );
}
