import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';

export default function ApplyDonePage() {
  const location = useLocation();
  const navState = location.state || {};
  const friendAttached = !!navState.friendAttached;
  const isReferral = !!navState.isReferral;
  // 트랙 분리: 사전신청자는 6/22 빠른 합격, 정식 지원자는 6/26.
  const resultDate = isReferral ? '6/22(월)' : '6/26(금)';
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopy = async () => {
    track('apply_done_copy_link');
    const url = `${window.location.origin}/`;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      return;
    } catch {
      /* fallback below */
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
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
        {/* 1) 지원 완료 카드 */}
        <div className="bg-bg-card rounded-[28px] p-8 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)] text-center">
          <div className="text-5xl mb-6">✅</div>
          <h2 className="font-kr text-3xl font-black text-card-ink mb-4 leading-tight">
            지원 완료!
          </h2>
          <p className="text-card-ink-muted leading-relaxed mb-3">
            합격 결과는 <span className="text-bg-primary font-bold">{resultDate}</span> 인스타로 안내돼.
          </p>
          <p className="text-card-ink-faint text-sm font-semibold">
            합격 시 {resultDate}까지 입금해야 선발 확정돼.
          </p>
        </div>

        {/* 2) Friend Bonus 카드 */}
        <div className="bg-bg-card rounded-[28px] p-7 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
          <span className="pill text-bg-primary block w-fit mb-3">FRIEND BONUS</span>
          <h3 className="font-kr text-2xl font-black text-card-ink mb-2 leading-tight">
            같이 지원할 친구 있어?
          </h3>
          <p className="text-card-ink-muted text-sm leading-relaxed mb-5">
            둘이 <span className="text-bg-primary font-bold">같은 팀 배정 보장</span> ✌️
            <br />친구도 폼을 작성해야 매칭돼.
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full bg-bg-primary text-white font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
          >
            {linkCopied ? '✓ 링크가 복사되었어요' : '🔗 챌린지 페이지 링크 복사하기'}
          </button>
          <p className="text-card-ink-faint text-xs mt-3 text-center">
            친구에게 카톡·DM으로 보내줘
          </p>

          {friendAttached && (
            <div className="mt-6 pt-6 border-t border-card-ink-faint/20 text-center">
              <p className="text-bg-primary font-bold">✓ 친구 정보가 함께 등록됐어</p>
              <p className="text-card-ink-faint text-xs mt-2">친구도 폼을 제출해야 매칭돼.</p>
            </div>
          )}
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
