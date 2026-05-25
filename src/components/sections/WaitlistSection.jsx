import { useState } from 'react';
import { track } from '@vercel/analytics';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import { submitWaitlist } from '../../lib/applyApi';

export default function WaitlistSection() {
  const [name, setName] = useState('');
  const [contactType, setContactType] = useState('instagram');
  const [contact, setContact] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const valid = name.trim().length >= 2 && contact.trim().length >= 3;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await submitWaitlist({ name, contact, contactType, note });
      track('waitlist_submit_success', { contactType });
      setDone(true);
    } catch (err) {
      track('waitlist_submit_failed', { message: String(err?.message || err).slice(0, 120) });
      setError(err.message || '신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="waitlist" className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">NEXT SEASON</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          시즌 0는 마감.<br />
          <span className="text-accent-green">시즌 1, 가장 먼저 받기.</span>
        </h2>
        <p className="text-text-secondary text-center text-sm mb-8 leading-relaxed">
          오픈 즉시 문자/DM 안내 · <span className="text-text-primary font-bold">사전알림 신청자 우선 선발 가산점</span>
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        {done ? (
          <div className="bg-bg-card rounded-3xl p-8 text-center shadow-[0_12px_30px_rgba(0,0,0,0.15)] border-l-[6px] border-accent-green">
            <p className="text-3xl mb-3">✅</p>
            <p className="text-card-ink font-extrabold text-lg mb-2">신청 완료</p>
            <p className="text-card-ink-muted text-sm leading-relaxed">
              시즌 1 오픈 시 가장 먼저 알려줄게.<br />
              그동안 <a href="https://www.instagram.com/samurai_habit/" target="_blank" rel="noopener noreferrer" className="text-bg-primary font-bold underline">@samurai_habit</a> 에서 직전 기수 기록 확인하세요.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_30px_rgba(0,0,0,0.15)] space-y-4">
            <div>
              <label className="block text-card-ink font-bold text-sm mb-2">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                className="w-full bg-bg-deep/40 border-2 border-white/10 rounded-2xl px-4 py-3 text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
                autoComplete="name"
              />
            </div>

            <div>
              <label className="block text-card-ink font-bold text-sm mb-2">연락 방법</label>
              <div className="flex gap-2 mb-2">
                {[
                  { v: 'instagram', l: '인스타' },
                  { v: 'phone', l: '문자' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.v}
                    onClick={() => setContactType(opt.v)}
                    className={`flex-1 py-2.5 rounded-2xl border-2 font-bold text-sm transition-colors ${
                      contactType === opt.v
                        ? 'border-accent-green bg-accent-green text-bg-primary'
                        : 'border-white/10 bg-bg-deep/40 text-card-ink hover:border-accent-green/60'
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
              <input
                type={contactType === 'phone' ? 'tel' : 'text'}
                inputMode={contactType === 'phone' ? 'numeric' : 'text'}
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={contactType === 'instagram' ? '@your_handle' : '010-1234-5678'}
                className="w-full bg-bg-deep/40 border-2 border-white/10 rounded-2xl px-4 py-3 text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
                autoComplete={contactType === 'phone' ? 'tel' : 'username'}
              />
            </div>

            <div>
              <label className="block text-card-ink font-bold text-sm mb-2">한 줄 메모 <span className="text-card-ink-faint font-normal">(선택)</span></label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="예: 5km 완주가 목표예요"
                className="w-full bg-bg-deep/40 border-2 border-white/10 rounded-2xl px-4 py-3 text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
              />
            </div>

            {error && <p className="text-accent-orange text-sm font-semibold">{error}</p>}

            <button
              type="submit"
              disabled={!valid || submitting}
              className="w-full bg-accent-green text-bg-primary font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-[0_8px_24px_rgba(200,255,77,0.3)]"
            >
              {submitting ? '신청 중...' : '시즌 1 사전알림 받기 →'}
            </button>
            <p className="text-card-ink-faint text-[11px] text-center font-semibold">
              연락처는 다음 시즌 안내 외 다른 용도로 쓰지 않아.
            </p>
          </form>
        )}
      </AnimateOnScroll>
    </section>
  );
}
