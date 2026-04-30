import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';
import { useCohortStatus, COPY, COPY_REFERRAL } from '../../hooks/useCohortStatus';

const VARIANT_COPY = {
  main: {
    pill: 'SEASON [0] · 4WK RUN',
    pillTone: 'text-accent-green',
    headlineTop: '팀과 함께 4주',
    headlineHighlight: '진짜 러너',
    headlineTail: '가 된다',
    badges: ['100% 온라인', '3인 1팀', '30명 한정'],
    sub1Top: '혼자였으면 안 했을 일,',
    sub1Bottom: '팀이 만들어줍니다.',
    sub2: (
      <>
        직전 기수 <span className="text-accent-green font-bold">11명 중 11명 전원 성공</span> · 평균 25일째 매일 인증 중
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
    sub1Bottom: '추가 보너스로 시작합니다.',
    sub2: (
      <>
        4/28(화) <span className="text-accent-orange font-bold">14:00 마감</span> · 신청 폼에 추천인 이름 필수
      </>
    ),
  },
};

export default function HeroSection({ onCTA, variant = 'main' }) {
  const status = useCohortStatus(variant);
  const copy = (variant === 'referral' ? COPY_REFERRAL : COPY)[status];
  const isClosed = status === 'closed';
  const v = VARIANT_COPY[variant] ?? VARIANT_COPY.main;
  const deadline = variant === 'referral' ? COHORT.referralDeadline : COHORT.deadline;
  const highlightTone = variant === 'referral' ? 'text-accent-orange' : 'text-accent-green';

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 overflow-hidden">
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ${variant === 'referral' ? 'bg-accent-orange/10' : 'bg-accent-green/10'}`} />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <div className="flex justify-center mb-6 animate-fade-up">
          <span className={`pill ${v.pillTone}`}>{v.pill}</span>
        </div>

        <h1 className="font-kr text-4xl md:text-6xl mb-6 animate-fade-up text-text-primary" style={{ animationDelay: '0.1s' }}>
          {v.headlineTop}
          <br />
          <span className={highlightTone}>{v.headlineHighlight}</span>{v.headlineTail}
        </h1>

        <div className="flex flex-wrap justify-center gap-2 mb-7 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          {v.badges.map((t) => (
            <span key={t} className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-bg-primary text-xs font-extrabold whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>

        <p className="text-text-secondary text-base leading-relaxed mb-3 animate-fade-up" style={{ animationDelay: '0.22s' }}>
          {v.sub1Top}<br />
          <span className="text-text-primary font-bold">{v.sub1Bottom}</span>
        </p>
        <p className="text-text-muted text-xs mb-9 animate-fade-up font-semibold tracking-wide" style={{ animationDelay: '0.26s' }}>
          {v.sub2}
        </p>

        <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Button onClick={onCTA} className="animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] inline-flex flex-col items-center justify-center leading-tight">
            <span className="block">{copy.cta.hero}</span>
            <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
          </Button>
          {!isClosed && (
            <p className="text-text-muted text-[11px] mt-3 font-semibold tracking-wide">
              🛡️ 합격 후 OT 전 전액 환불 가능
            </p>
          )}
          {/* 문의 — 마감 후엔 더 또렷하게, 평시엔 보조 라인. referral 변형은 평시에도 노출. */}
          {(isClosed || variant === 'referral') && (
            <a
              href="https://www.instagram.com/bali_tarzan/"
              target="_blank"
              rel="noopener noreferrer"
              className={
                isClosed
                  ? 'inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full border-2 border-accent-green/60 text-accent-green font-extrabold text-[13px] hover:bg-accent-green/10 transition-colors'
                  : 'block mt-2 text-text-muted text-[10px] font-semibold'
              }
            >
              {isClosed ? (
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
            <p className="text-text-muted text-[11px] mb-3 font-bold tracking-widest">DEADLINE COUNTDOWN</p>
            <CountdownTimer targetDate={deadline} size="md" />
          </div>
        )}
      </div>
    </section>
  );
}
