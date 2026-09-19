import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { track } from '@vercel/analytics';
import { submitCohortAlert } from '../lib/alertApi';
import { logEvent, once } from '../lib/eventLog';
import { metaTrackApplication } from '../lib/metaPixel';
import { COHORT5 } from '../data/season5';

// 다음 기수 오픈 알림 신청 (/notify) — 모집 마감 뒤 랜딩의 모든 버튼이 여기로 온다. (2026-09-19)
// 시안 SOT: design-references/s5v2-notify-flow.html ②③
// 지원서 11문항 대신 전화번호 하나. 한국/해외 입력 방식·검사 규칙은 지원서(ApplyPage PhoneStep)와 같다.
// 결원 대기는 없앴다 — 이번 기수 추가 합류 없이 다음 기수 오픈만 알린다.
const INSTAGRAM_URL = 'https://www.instagram.com/bali_tarzan/';

const formatKR = (digits) => {
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
};

function validate(phone, country) {
  if (!phone.trim()) return '전화번호를 입력해줘.';
  const digits = phone.replace(/\D/g, '');
  if (country === 'KR') {
    if (!/^01[016789]\d{7,8}$/.test(digits)) return '한국 휴대폰 번호 형식이 맞지 않아. (010으로 시작 11자리)';
  } else if (digits.length < 7) {
    return '국가번호 포함 7자 이상의 숫자를 입력해줘.';
  }
  return null;
}

export default function NotifyPage() {
  const [country, setCountry] = useState('KR');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (once('notify_view')) logEvent('notify_view');
  }, []);

  const isKR = country === 'KR';
  const display = isKR ? formatKR(phone) : phone;

  const submit = async () => {
    const msg = validate(phone, country);
    if (msg) { setError(msg); return; }
    setError('');
    setSubmitting(true);
    try {
      const value = isKR ? formatKR(phone) : phone.trim();
      await submitCohortAlert({ phone: value, phoneCountry: country, sourceCohort: COHORT5.cohortCode });
      track('notify_submit');
      logEvent('notify_submit');
      metaTrackApplication({ phone: value, phoneCountry: country, waitlist: true, isReferral: false });
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e.message || '신청 중 문제가 생겼어. 잠시 뒤 다시 해줘.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-7 text-center">
        <p className="text-[52px] leading-none">🔔</p>
        <h1 className="font-sans font-normal text-[34px] leading-[1.2] text-text-primary mt-3">
          알림 신청<br /><span className="text-accent-green">완료!</span>
        </h1>
        <p className="text-text-secondary text-sm font-semibold leading-relaxed mt-3">
          다음 기수 열리면<br />
          <span className="text-text-primary font-bold">{isKR ? formatKR(phone) : phone}</span>로 제일 먼저 문자 보낼게.
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => { track('notify_instagram_click'); logEvent('notify_instagram_click'); }}
          className="mt-7 w-full max-w-sm border-2 border-white/25 rounded-2xl p-3 text-text-primary text-sm font-extrabold leading-snug hover:border-accent-green/70 transition-colors break-keep"
        >
          {/* 프로필 화면에서 "Tarzan 러닝 챌린지" 채널 위치를 화살표로 짚어 둔 캡처 */}
          <img
            src="/s5v2/ig-channel.jpg"
            alt="인스타 @bali_tarzan 프로필 아래 Tarzan 러닝 챌린지 채널"
            className="w-full rounded-xl"
            loading="lazy"
          />
          <span className="block mt-3 mb-0.5">
            그동안 타잔 채널에서 데일리 러닝팁 받고<br />
            <span className="text-accent-green">부상방지 루틴 가이드도 받아가!</span> →
          </span>
        </a>
        <Link to="/" className="mt-4 text-text-muted text-[13px] font-bold">← 메인으로</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4">
        <Link to="/" className="text-text-secondary text-[13px] font-bold">← 메인</Link>
      </header>

      <main className="flex-1 px-6 pt-6 max-w-md mx-auto w-full">
        <h1 className="font-sans font-normal text-[34px] leading-[1.2] text-text-primary">
          다음 기수<br /><span className="text-accent-green">오픈 알림 받기</span>
        </h1>
        <p className="text-text-secondary text-sm font-semibold leading-relaxed mt-3 break-keep">
          이번 21일 챌린지는 마감됐어.<br />
          다음 기수 모집 열리면 제일 먼저 문자로 알려줄게.
        </p>

        <div className="flex gap-2 mt-7 mb-3">
          {[
            { value: 'KR', label: '🇰🇷 한국' },
            { value: 'INTL', label: '🌏 해외' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setCountry(opt.value); setPhone(''); setError(''); }}
              className={`flex-1 py-3 rounded-2xl border-2 font-bold text-sm transition-colors ${
                country === opt.value
                  ? 'border-accent-green bg-accent-green text-bg-primary'
                  : 'border-white/20 bg-bg-card text-card-ink hover:border-accent-green/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          type="tel"
          inputMode={isKR ? 'numeric' : 'tel'}
          autoComplete="tel"
          value={display}
          onChange={(e) => {
            const raw = e.target.value;
            setPhone(isKR ? raw.replace(/\D/g, '').slice(0, 11) : raw.slice(0, 30));
            if (error) setError('');
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) submit(); }}
          placeholder={isKR ? '010-1234-5678' : '+1 415 555 0123'}
          className="w-full bg-bg-card border-2 border-white/20 rounded-2xl px-4 py-4 text-lg text-card-ink placeholder:text-card-ink-faint focus:outline-none focus:border-accent-green transition-colors"
        />
        {error && <p className="text-accent-orange text-sm mt-2 font-semibold">{error}</p>}
        <p className="text-text-muted text-xs mt-3 font-semibold leading-relaxed break-keep">
          다음 기수 모집 안내 문자만 보내. 필요 없으면 언제든 그만 받을 수 있어.
        </p>
      </main>

      <footer className="px-6 pb-6 pt-4 border-t border-white/10 sticky bottom-0 bg-bg-deep/80 backdrop-blur">
        <div className="max-w-md mx-auto">
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full bg-accent-green text-bg-primary font-extrabold py-4 rounded-2xl hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer shadow-[0_8px_24px_rgba(200,255,77,0.3)]"
          >
            {submitting ? '신청 중...' : '알림 신청하기 →'}
          </button>
        </div>
      </footer>
    </div>
  );
}
