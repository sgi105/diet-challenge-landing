import { useState } from 'react';
import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { PRESEASON } from '../data/configPre';

// 프리시즌(무료 3일) 신청 완료 페이지.
// 결제·합격 개념 없음 → 인스타 톡방 입장 + 지인 초대(같은 팀) 유도.
export default function ApplyDonePage() {
  const [linkCopied, setLinkCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/apply?type=referral`;

  const handleCopy = async () => {
    track('apply_done_copy_invite');
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      return;
    } catch {
      /* fallback below */
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = inviteUrl;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* 1) 신청 완료 카드 */}
        <div className="bg-bg-card rounded-[28px] p-8 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)] text-center">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="font-kr text-3xl font-black text-card-ink mb-4 leading-tight">
            신청 완료!
          </h2>
          <p className="text-card-ink-muted leading-relaxed mb-3">
            <span className="text-bg-primary font-bold">{PRESEASON.startLabel}</span> — 딱 3일, 작심삼일 뿌시기.
          </p>
          <p className="text-card-ink-faint text-sm font-semibold">
            아래 인스타 톡방에 들어와서 <span className="text-bg-primary">자기소개부터</span> 올려줘. 그래야 시작돼!
          </p>
        </div>

        {/* 2) 톡방 입장 CTA (메인 동선) */}
        <a
          href={PRESEASON.TALK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('apply_done_open_chat')}
          className="bg-accent-green rounded-[28px] p-7 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)] block hover:brightness-105 transition-all"
        >
          <span className="inline-block bg-bg-primary/15 text-bg-primary text-[11px] font-extrabold px-3 py-1 rounded-full mb-3">STEP 1 · 제일 중요!</span>
          <h3 className="font-kr text-2xl font-black text-bg-primary mb-2 leading-tight">
            톡방 입장 → 자기소개
          </h3>
          <p className="text-bg-primary/80 text-sm leading-relaxed mb-3">
            톡방에 들어오면 <span className="font-extrabold">제일 먼저 자기소개부터 올려줘!</span> 그래야 팀 배정이 시작돼. 시작 안내도 여기서 받아.
          </p>
          <div className="bg-bg-primary/10 rounded-2xl px-4 py-2.5 mb-4">
            <p className="text-bg-primary font-extrabold text-[13px] text-center">🙋 입장하자마자 → 자기소개 올리기</p>
          </div>
          <span className="block w-full bg-bg-primary text-white font-extrabold py-4 rounded-2xl text-center">
            💬 톡방 입장하기 →
          </span>
          <p className="text-bg-primary/80 text-[12px] font-semibold leading-relaxed mt-3 text-center">
            💻 컴퓨터로 보고 있다면, 휴대폰으로 전송된 <span className="font-extrabold">문자의 링크</span>를 눌러 입장해줘.
          </p>
        </a>

        {/* 3) 친구 초대 — 저강조(메인 동선 방해 X). 구분선 뒤 작은 한 줄 + 복사 버튼 */}
        <div className="w-full pt-1">
          <div className="border-t border-white/10 pt-6 flex flex-col items-center gap-3">
            <p className="text-text-muted text-xs text-center leading-relaxed">
              친구랑 같이 하면 <span className="text-text-secondary font-semibold">같은 팀</span> 배정 · 팀 전원 완주 시 전원 스타벅스 ☕
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="text-accent-green text-sm font-bold hover:brightness-110 border border-accent-green/40 rounded-full px-5 py-2 transition-all"
            >
              {linkCopied ? '✓ 초대 링크 복사됨' : '🔗 친구 초대 링크 복사'}
            </button>
          </div>
        </div>

        <Link
          to="/"
          className="text-text-muted text-sm font-semibold hover:text-accent-green transition-colors"
        >
          ← 메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
