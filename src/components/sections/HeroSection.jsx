import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';
import { useCohortStatus, COPY, COPY_REFERRAL } from '../../hooks/useCohortStatus';

const VARIANT_COPY = {
  main: {
    pill: 'SEASON [1] · 21D RUN',
    pillTone: 'text-accent-green',
    headlineMid: '매일 뛰는 게 이렇게',
    headlineHighlight: '재밌을 줄',
    headlineTail: ' 몰랐다',
    badges: ['100% 온라인', '3인 1팀', '30명 한정'],
    headlineSub: '팀과 함께 21일',
    sub1Top: '혼자였으면 안 했을 일,',
    sub1Bottom: '팀이 만들어줘.',
    sub2: (
      <>
        직전 시즌0 <span className="text-accent-green font-bold">30명 중 30명 전원 21일 완주 성공</span>
      </>
    ),
  },
  referral: {
    pill: 'REFERRAL · 초대 전용',
    pillTone: 'text-accent-orange',
    headlineTop: '초대받은 당신만',
    headlineHighlight: '받는 4가지',
    headlineTail: ' 보너스',
    badges: ['추천인 필수', '식단+러닝 분석', '우선 선발'],
    sub1Top: '기존 멤버가 데려온 사람만,',
    sub1Bottom: '추가 보너스로 시작해.',
    sub2: (
      <>
        5/28(목) <span className="text-accent-orange font-bold">24:00 마감</span> · 신청 폼에 추천인 이름 필수
      </>
    ),
  },
};

export default function HeroSection({ onCTA, variant = 'main' }) {
  const status = useCohortStatus(variant);
  const copy = (variant === 'referral' ? COPY_REFERRAL : COPY)[status];
  const isClosed = status === 'closed';
  const isPreopen = status === 'preopen';
  const v = VARIANT_COPY[variant] ?? VARIANT_COPY.main;
  const deadline = variant === 'referral' ? COHORT.referralDeadline : COHORT.deadline;
  const countdownTarget = isPreopen ? COHORT.applyOpenAt : deadline;
  const countdownLabel = isPreopen ? 'OPENS IN · 신청 오픈까지' : 'DEADLINE · 마감까지';
  const highlightTone = variant === 'referral' ? 'text-accent-orange' : 'text-accent-green';
  const firstDayBonusActive = !isClosed && !isPreopen && new Date() < new Date(COHORT.firstDayBonusExpireAt);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 overflow-hidden">
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${variant === 'referral' ? 'bg-accent-orange/10' : 'bg-accent-green/10'}`} />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <div className="flex justify-center mb-6 animate-fade-up">
          <span className={`pill ${v.pillTone}`}>{v.pill}</span>
        </div>

        <h1 className="font-kr text-4xl md:text-6xl font-black leading-tight break-keep mb-6 animate-fade-up text-text-primary" style={{ animationDelay: '0.1s' }}>
          {v.headlineTop && <>{v.headlineTop}<br /></>}
          {v.headlineMid && <>{v.headlineMid}<br /></>}
          <span className={highlightTone}>{v.headlineHighlight}</span>{v.headlineTail}
        </h1>

        <p className="text-text-secondary text-xs font-bold tracking-wider mb-5 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          {v.badges.join(' · ')}
        </p>

        {v.headlineSub && (
          <p
            className="font-kr text-3xl md:text-4xl font-black text-accent-green mb-8 animate-fade-up tracking-tight"
            style={{ animationDelay: '0.18s', textShadow: '0 0 32px rgba(200,255,77,0.55)' }}
          >
            {v.headlineSub}
          </p>
        )}

        <p className="text-text-secondary text-base leading-relaxed mb-4 animate-fade-up" style={{ animationDelay: '0.22s' }}>
          {v.sub1Top}<br />
          <span className="text-text-primary font-bold">{v.sub1Bottom}</span>
        </p>
        <p className="text-text-muted text-xs mb-2 animate-fade-up font-semibold tracking-wide" style={{ animationDelay: '0.26s' }}>
          {v.sub2}
        </p>
        <p className="text-text-muted text-[11px] mb-10 animate-fade-up font-bold tracking-widest" style={{ animationDelay: '0.28s' }}>
          챌린지 시작 <span className="text-text-primary">6/1(월)</span>  ·  파이널 <span className="text-text-primary">6/21(일)</span>
        </p>

        <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Button onClick={onCTA} className="animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] inline-flex flex-col items-center justify-center leading-tight">
            <span className="block">{copy.cta.hero}</span>
            <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
          </Button>
          {!isClosed && !isPreopen && (
            <p className="text-text-muted text-[11px] mt-3 font-semibold tracking-wide">
              🛡️ 합격 후 OT 전 전액 환불 가능
            </p>
          )}
          {firstDayBonusActive && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-orange/15 border border-accent-orange/50">
              <span className="text-sm">🎁</span>
              <span className="text-accent-orange text-[11px] font-extrabold tracking-wide">
                첫날 신청 시 환급 <span className="text-accent-orange">+1만</span> 보너스 · 5/26 24:00 마감
              </span>
            </div>
          )}
          {/* 문의 — 마감/오픈 전엔 더 또렷하게, 평시엔 보조 라인. referral 변형은 평시에도 노출. */}
          {(isClosed || isPreopen || variant === 'referral') && (
            <a
              href="https://www.instagram.com/bali_tarzan/"
              target="_blank"
              rel="noopener noreferrer"
              className={
                (isClosed || isPreopen)
                  ? 'inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full border-2 border-accent-green/60 text-accent-green font-extrabold text-[13px] hover:bg-accent-green/10 transition-colors'
                  : 'block mt-2 text-text-muted text-[10px] font-semibold'
              }
            >
              {(isClosed || isPreopen) ? (
                <>
                  <span>💬</span>
                  <span>문의 · DM @bali_tarzan</span>
                </>
              ) : (
                <>문의: <span className="text-accent-orange font-bold hover:underline">@bali_tarzan</span></>
              )}
            </a>
          )}
        </div>

        {!isClosed && (
          <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-text-secondary text-xs mb-3 font-bold tracking-widest">{countdownLabel}</p>
            <CountdownTimer targetDate={countdownTarget} size="md" />
          </div>
        )}
      </div>
    </section>
  );
}
