import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { ACTIVE } from '../data/activeCohort';
import { useCountdown } from '../hooks/useCountdown';

// 지원 완료 페이지 — 현재 액티브 기수(시즌4) 기준.
// 모집 중: 심사 있는 기수라 톡방 즉시 입장 X — 합격 발표 · 입금 · OT 흐름 안내 + 지인 초대.
// 마감(대기명단): 톡방 링크 노출 X (확정자만 입장). "결원 시 연락" 안내만.
export default function ApplyDonePage() {
  const location = useLocation();
  const { isExpired: deadlinePassed } = useCountdown(ACTIVE.deadline);
  // 마감 후 접수 = 대기명단. 제출 시 넘겨받은 flag 우선, 없으면 데드라인으로 판단.
  const waitlist = location.state?.waitlist ?? deadlinePassed;

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

  // ── 마감 · 대기명단 (톡방/초대 링크 노출 X) ──────────────────────
  if (waitlist) {
    return (
      <div className="min-h-screen px-6 py-10 flex flex-col items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center gap-6">
          <div className="bg-bg-card rounded-[28px] p-8 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)] text-center">
            <div className="text-5xl mb-6">📝</div>
            <h2 className="font-kr text-3xl font-black text-card-ink mb-4 leading-tight">
              대기 명단 등록 완료!
            </h2>
            <p className="text-card-ink-muted leading-relaxed mb-3">
              아쉽게도 <span className="text-bg-primary font-bold">정원 {ACTIVE.totalSpots}명이 마감</span>돼서<br />
              대기 명단으로 접수됐어.
            </p>
            <p className="text-card-ink-faint text-sm font-semibold leading-relaxed">
              결원이 생기면 <span className="text-bg-primary">신청 순서대로</span> 연락 줄게.<br />
              조금만 기다려줘 🙏
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

  // ── 모집 중 · 확정 ────────────────────────────────────────────
  return (
    <div className="min-h-screen px-6 py-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* 1) 지원 완료 카드 */}
        <div className="bg-bg-card rounded-[28px] p-8 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)] text-center">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="font-kr text-3xl font-black text-card-ink mb-4 leading-tight">
            지원 완료!
          </h2>
          <p className="text-card-ink-muted leading-relaxed mb-3">
            <span className="text-bg-primary font-bold">{ACTIVE.startLabel}</span> — 21일 팀 러닝.
          </p>
          <p className="text-card-ink-faint text-sm font-semibold leading-relaxed">
            지원서 하나하나 다 읽어보고 뽑을게.<br />
            <span className="text-bg-primary">합격 발표는 {ACTIVE.resultLabel}</span>, 문자로 보내줄게.
          </p>
        </div>

        {/* 2) 합격 후 흐름 안내 (심사 있는 기수 — 톡방은 합격자만 초대) */}
        <div className="bg-accent-green rounded-[28px] p-7 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
          <span className="inline-block bg-bg-primary/15 text-bg-primary text-[11px] font-extrabold px-3 py-1 rounded-full mb-3">NEXT · 합격하면</span>
          <h3 className="font-kr text-2xl font-black text-bg-primary mb-3 leading-tight">
            이렇게 진행돼
          </h3>
          <ul className="space-y-2.5 text-bg-primary/85 text-sm leading-relaxed">
            <li><span className="font-extrabold text-bg-primary">1. 합격 발표</span> · {ACTIVE.resultLabel} — 문자로 안내</li>
            <li><span className="font-extrabold text-bg-primary">2. 보증금 입금</span> · {ACTIVE.depositDeadlineLabel}까지 20만원</li>
            <li><span className="font-extrabold text-bg-primary">3. 톡방 입장 + 팀 배정</span> · 입금 확인되면 초대 보내줄게</li>
            <li><span className="font-extrabold text-bg-primary">4. 온라인 OT</span> · {ACTIVE.otLabel} 줌</li>
            <li><span className="font-extrabold text-bg-primary">5. 시작</span> · {ACTIVE.startLabel}</li>
          </ul>
          <div className="bg-bg-primary/10 rounded-2xl px-4 py-2.5 mt-4">
            <p className="text-bg-primary font-extrabold text-[13px] text-center">📱 문자 놓치지 않게 알림 켜둬</p>
          </div>
        </div>

        {/* 3) 친구 초대 — 저강조(메인 동선 방해 X). 구분선 뒤 작은 한 줄 + 복사 버튼 */}
        <div className="w-full pt-1">
          <div className="border-t border-white/10 pt-6 flex flex-col items-center gap-3">
            <p className="text-text-muted text-xs text-center leading-relaxed">
              친구랑 같이 지원하면 <span className="text-text-secondary font-semibold">같은 팀</span> 배정 · 1등 팀은 전원 {ACTIVE.prizeTeam1st} 🏆
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
