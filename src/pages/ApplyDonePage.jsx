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
            아래 인스타 톡방으로 들어와야 시작 안내를 받을 수 있어.
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
          <span className="inline-block bg-bg-primary/15 text-bg-primary text-[11px] font-extrabold px-3 py-1 rounded-full mb-3">STEP 1 · 지금 바로</span>
          <h3 className="font-kr text-2xl font-black text-bg-primary mb-2 leading-tight">
            인스타 톡방 입장하기
          </h3>
          <p className="text-bg-primary/80 text-sm leading-relaxed mb-4">
            여기서 팀 배정·시작 안내·매일 인증을 진행해. 꼭 들어와야 참여 완료야.
          </p>
          <span className="block w-full bg-bg-primary text-white font-extrabold py-4 rounded-2xl text-center">
            💬 톡방 입장하기 →
          </span>
          <p className="text-bg-primary/80 text-[12px] font-semibold leading-relaxed mt-3 text-center">
            💻 컴퓨터로 보고 있다면, 휴대폰으로 전송된 <span className="font-extrabold">문자의 링크</span>를 눌러 입장해줘.
          </p>
        </a>

        {/* 3) 지인 초대 카드 — 같은 팀 */}
        <div className="bg-bg-card rounded-[28px] p-7 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
          <span className="pill text-bg-primary block w-fit mb-3">STEP 2 · 같이 뿌시기</span>
          <h3 className="font-kr text-2xl font-black text-card-ink mb-2 leading-tight">
            친구 초대하면 같은 팀
          </h3>
          <p className="text-card-ink-muted text-sm leading-relaxed mb-5">
            친구도 이 링크로 신청하면 <span className="text-bg-primary font-bold">같은 팀 배정</span> ✌️<br />
            <span className="text-bg-primary font-bold">팀 5명 전원 완주하면 전원 스타벅스</span> ☕ — 같이 뛸수록 유리해.
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full bg-bg-primary text-white font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
          >
            {linkCopied ? '✓ 초대 링크가 복사되었어' : '🔗 친구 초대 링크 복사하기'}
          </button>
          <p className="text-card-ink-faint text-xs mt-3 text-center">
            친구에게 카톡·DM으로 보내줘
          </p>
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
