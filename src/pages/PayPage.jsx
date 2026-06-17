import { useState } from 'react';
import { Link } from 'react-router-dom';

const BANK = '토스뱅크';
const ACCOUNT_RAW = '1000264186993'; // 검증용 — UI에는 1000-2641-8699 표시. 실제 계좌번호는 사용자 확인.
const ACCOUNT_DISPLAY = '1000 2641 8699';
const ACCOUNT_FOR_COPY = '1000-2641-8699';
const ACCOUNT_NO_DASH = '100026418699';
const HOLDER = '신가인'; // 예금주 — 사용자 확인 필요
const AMOUNT = 200000;
// 토스뱅크 코드 092
const TOSS_DEEPLINK = `supertoss://send?bank=092&accountNo=${ACCOUNT_NO_DASH}&amount=${AMOUNT}`;

export default function PayPage() {
  const [copiedKey, setCopiedKey] = useState('');

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(''), 1500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
        <Link to="/" className="text-text-muted text-sm hover:text-accent-green transition-colors font-semibold">← 메인</Link>
        <span className="w-12" />
      </header>

      <main className="flex-1 px-6 py-10 flex flex-col">
        <div className="max-w-md mx-auto w-full">
          <span className="pill text-accent-green">DEPOSIT · 보증금 입금</span>
          <h1 className="font-kr text-3xl md:text-4xl font-black mt-4 mb-2 text-text-primary leading-tight">
            보증금 <span className="text-accent-green">{AMOUNT.toLocaleString()}원</span> 입금
          </h1>
          <p className="text-text-muted text-sm mb-8">
            아래 계좌로 입금 후, 입금자명을 본인 이름으로 보내주세요.
          </p>

          {/* 메인 계좌 카드 — 한 번에 복사 */}
          <button
            type="button"
            onClick={() => copy(ACCOUNT_FOR_COPY, 'account')}
            className="w-full bg-bg-card rounded-3xl p-6 text-left shadow-[0_16px_40px_rgba(0,0,0,0.18)] hover:bg-bg-card-hover transition-colors mb-3 border-2 border-accent-green/40"
          >
            <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-2">{BANK} · {HOLDER}</p>
            <p className="text-card-ink font-extrabold text-3xl tabular-nums tracking-tight mb-3">
              {ACCOUNT_DISPLAY}
            </p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-extrabold ${copiedKey === 'account' ? 'bg-accent-green text-bg-primary' : 'bg-bg-primary text-white'}`}>
              {copiedKey === 'account' ? '✓ 복사됨' : '📋 계좌번호 복사'}
            </span>
          </button>

          {/* 금액 복사 */}
          <button
            type="button"
            onClick={() => copy(String(AMOUNT), 'amount')}
            className="w-full bg-bg-card rounded-2xl p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:bg-bg-card-hover transition-colors mb-3 flex items-center justify-between"
          >
            <div>
              <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-0.5">금액</p>
              <p className="text-card-ink font-extrabold text-xl tabular-nums">{AMOUNT.toLocaleString()}원</p>
            </div>
            <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${copiedKey === 'amount' ? 'bg-accent-green text-bg-primary' : 'bg-bg-card-hover text-card-ink-muted'}`}>
              {copiedKey === 'amount' ? '✓ 복사' : '복사'}
            </span>
          </button>

          {/* 토스로 바로 보내기 — 모바일에서 토스 앱 열림 (한 단계 적은 friction) */}
          <a
            href={TOSS_DEEPLINK}
            className="block w-full bg-accent-green text-bg-primary text-center font-extrabold py-4 rounded-2xl shadow-[0_8px_24px_rgba(200,255,77,0.3)] hover:brightness-110 transition-all mt-3"
          >
            🔵 토스로 바로 송금하기 →
          </a>
          <p className="text-text-muted text-[11px] text-center mt-2">
            토스 앱이 자동으로 열립니다 (모바일). PC라면 위 계좌번호 복사 후 송금.
          </p>

          {/* 입금 후 안내 */}
          <div className="mt-10 p-5 bg-bg-card rounded-2xl border-l-[5px] border-bg-primary">
            <p className="text-card-ink font-extrabold text-sm mb-2">📝 입금 시 확인사항</p>
            <ul className="text-card-ink-muted text-[13px] space-y-1.5 leading-relaxed">
              <li>• <span className="font-bold text-card-ink">입금자명 = 본인 실명</span> (지원서 이름과 동일하게)</li>
              <li>• 입금 마감: <span className="font-bold text-accent-orange">합격 안내 시 받은 입금 마감일까지</span></li>
              <li>• 마감까지 미입금 시 다음 순번으로 자동 이관</li>
              <li>• 영수증 발행 필요시 DM 으로 요청</li>
            </ul>
          </div>

          {/* 문의 */}
          <a
            href="https://www.instagram.com/bali_tarzan/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center mt-6 text-text-muted text-sm hover:text-accent-green"
          >
            💬 문의 · DM @bali_tarzan
          </a>
        </div>
      </main>
    </div>
  );
}
