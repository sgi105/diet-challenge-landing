import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { attachFriend } from '../lib/applyApi';

export default function ApplyDonePage() {
  const location = useLocation();
  const navState = location.state || {};
  const id = navState.id || null;
  const phone = navState.phone || '';
  const canAttach = !!(id && phone);

  const [friend, setFriend] = useState('');
  const [attaching, setAttaching] = useState(false);
  const [attached, setAttached] = useState(!!navState.friendAttached);
  const [attachError, setAttachError] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopy = async () => {
    track('apply_done_copy_link');
    const url = `${window.location.origin}/apply`;
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

  const handleAttachFriend = async () => {
    const v = friend.trim();
    if (!v) {
      setAttachError('친구 이름이나 @아이디를 적어주세요.');
      return;
    }
    if (!canAttach) {
      setAttachError('새로고침 후에는 친구 정보를 추가할 수 없어요. DM으로 알려주세요!');
      return;
    }
    setAttaching(true);
    setAttachError('');
    track('apply_done_attach_friend_attempt');
    try {
      await attachFriend({ id, phone, friend: v });
      track('apply_done_attach_friend_success');
      setAttached(true);
    } catch (e) {
      track('apply_done_attach_friend_failed', { message: String(e?.message || e).slice(0, 120) });
      setAttachError(e.message || '친구 추가 중 오류가 발생했습니다.');
    } finally {
      setAttaching(false);
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
            합격 결과는 <span className="text-bg-primary font-bold">4/28(화) 16:00</span> 문자 및
            <br />
            인스타 단톡방으로 안내됩니다.
          </p>
          <p className="text-card-ink-faint text-sm font-semibold">
            합격 시 4/28(화) 23:59까지 입금하셔야 선발 확정됩니다.
          </p>
        </div>

        {/* 2) Friend Bonus 카드 */}
        <div className="bg-bg-card rounded-[28px] p-7 w-full shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
          <span className="pill text-bg-primary block w-fit mb-3">FRIEND BONUS</span>
          <h3 className="font-kr text-2xl font-black text-card-ink mb-2 leading-tight">
            같이 지원할 친구가 있나요?
          </h3>
          <p className="text-card-ink-muted text-sm leading-relaxed mb-5">
            둘이 <span className="text-bg-primary font-bold">같은 팀 배정 보장</span> ✌️
            <br />친구도 폼을 작성해야 매칭됩니다.
          </p>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full bg-bg-primary text-white font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.15)]"
          >
            {linkCopied ? '✓ 링크가 복사되었어요' : '🔗 신청 페이지 링크 복사하기'}
          </button>
          <p className="text-card-ink-faint text-xs mt-3 text-center">
            친구에게 카톡·DM으로 보내주세요
          </p>

          {canAttach && !attached && (
            <div className="mt-6 pt-6 border-t border-card-ink-faint/20">
              <p className="text-card-ink-muted text-sm font-semibold mb-3">
                친구 이름이나 인스타 @아이디 (선택)
              </p>
              <input
                type="text"
                value={friend}
                onChange={e => setFriend(e.target.value)}
                placeholder="친구 이름 또는 @아이디"
                disabled={attaching}
                className="w-full bg-white border-2 border-card-ink-faint/30 rounded-2xl px-4 py-3.5 text-base text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-bg-primary transition-colors"
              />
              <button
                type="button"
                onClick={handleAttachFriend}
                disabled={attaching}
                className="mt-3 w-full bg-bg-primary/10 text-bg-primary font-bold py-3.5 rounded-2xl hover:bg-bg-primary/15 transition-all disabled:opacity-50"
              >
                {attaching ? '추가 중...' : '친구 정보 추가하기'}
              </button>
              {attachError && (
                <p className="text-accent-orange text-sm mt-3 font-semibold">{attachError}</p>
              )}
            </div>
          )}
          {attached && (
            <div className="mt-6 pt-6 border-t border-card-ink-faint/20 text-center">
              <p className="text-bg-primary font-bold">✓ 친구 정보가 추가되었습니다</p>
              <p className="text-card-ink-faint text-xs mt-2">친구도 폼을 제출해야 매칭됩니다.</p>
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
