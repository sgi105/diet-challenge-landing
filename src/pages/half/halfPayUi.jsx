// [849] 하프 결제 페이지 공용 UI — 앱 /half-apply 신청서(시안 B)·신청 후 화면(시안 A)과 같은 밝은 결제창 스타일 (11/20 가인)
//   시안: bali/design-references/849-apply-5options.html (B) · 849-apply-dedupe-3options.html (A)
//   값은 시안 CSS 그대로: 배경 #f8fafc · 카드 radius 18 / padding 14·16 / shadow · 주황 #f97316 / #ea580c · 초록 #059669
import { Link } from 'react-router-dom';


export function Shell({ children, cta }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col" style={{ fontFamily: '-apple-system, "Apple SD Gothic Neo", sans-serif' }}>
      <div className="flex-1 max-w-[430px] w-full mx-auto pb-6">{children}</div>
      {cta && (
        <div className="sticky bottom-0 z-10 px-4 pt-3 bg-gradient-to-b from-[#f8fafc]/0 via-[#f8fafc] to-[#f8fafc]" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
          <div className="max-w-[430px] mx-auto">{cta}</div>
        </div>
      )}
      <BizInfo />
    </div>
  );
}

export const Card = ({ children, className = '' }) => (
  <div className={`mx-4 mt-[14px] bg-white rounded-[18px] px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.08)] ${className}`}>{children}</div>
);

export const Line = ({ k, v, tone }) => (
  <div className={`flex justify-between gap-3 text-[14px] py-[7px] ${tone === 'g' ? 'text-[#059669] font-extrabold' : 'text-[#0f172a]'}`}>
    <span>{k}</span><span className="tabular-nums text-right shrink-0">{v}</span>
  </div>
);

export function Badge({ ok, children }) {
  return <span className={`inline-block text-[12px] font-black px-2.5 py-1 rounded-full ${ok ? 'bg-[#d1fae5] text-[#047857]' : 'bg-[#ffedd5] text-[#c2410c]'}`}>{children}</span>;
}

export function Head({ badge, ok, title, sub }) {
  return (
    <div className="mx-5 mt-[22px]">
      {badge && <Badge ok={ok}>{badge}</Badge>}
      <h1 className="mt-2 text-[26px] font-black leading-[1.3] break-keep">{title}</h1>
      {sub && <p className="mt-1.5 text-[14px] text-[#475569] break-keep">{sub}</p>}
    </div>
  );
}

export function Product() {
  return (
    <Card>
      <div className="flex gap-3 items-center">
        <img src="/half/finish.jpg" alt="" className="w-[58px] h-[58px] rounded-xl object-cover" style={{ objectPosition: '30% 40%' }} />
        <div className="min-w-0">
          <div className="text-[15.5px] font-black">90일 하프마라톤 프로그램</div>
          <div className="text-[12px] text-[#64748b] mt-0.5">11/23(월) - 1/23(토) · 북극곰 하프 21.1km</div>
        </div>
      </div>
    </Card>
  );
}

export const CtaButton = ({ children, ...p }) => (
  <button {...p} className="w-full min-h-[56px] rounded-2xl bg-[#f97316] text-white text-[17px] font-black disabled:bg-[#cbd5e1] disabled:text-[#64748b]">{children}</button>
);
export const Hint = ({ children }) => <div className="text-center text-[11.5px] text-[#64748b] mt-[7px]">{children}</div>;

// 사업자 정보 (전자상거래 표시 의무) — Footer 컴포넌트는 어두운 배경용이라 밝은 배경용으로 같은 내용
function BizInfo() {
  return (
    <footer className="px-6 pt-8 pb-10 max-w-[430px] mx-auto w-full border-t border-[#e2e8f0] text-center text-[11px] text-[#94a3b8] space-y-1">
      <p className="text-[#64748b] font-bold">무사 SAMURAI</p>
      <p>대표: 신가인 | 사업자등록번호: 593-03-01517</p>
      <p>주소: 서울특별시 광진구 용마산로1길 11-4, 501호(중곡동)</p>
      <p>통신판매업신고: 간이과세자 신고 면제</p>
      <p>대표전화: 010-4240-3121 · 이메일: justinshin3610@gmail.com</p>
      <p className="pt-2 space-x-3">
        <Link to="/terms" className="underline">이용약관</Link>
        <Link to="/privacy" className="underline">개인정보처리방침</Link>
        <Link to="/refund" className="underline">환불정책</Link>
      </p>
    </footer>
  );
}
