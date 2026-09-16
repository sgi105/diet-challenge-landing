import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT5 } from '../../data/season5';
import { useSeason5Status, COPY5 } from '../../hooks/useSeason5Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import { previewCount } from '../../lib/spots';
import SpotsBadge from '../s2/SpotsBadge';
import BonusSection from './BonusSection';

// 단톡방 런칭 메시지(D-3 성공 관성 · D-2 빠질 수 없는 환경 · D-1 멘탈)와 같은 언어로 맞춘 카피.
// 기존 USP "30명 중 30명 전원 성공"은 버리지 않고 증거 줄(proof)로 내렸다.
const USP = {
  uspLine1: '의지가 부족해서 실패한 게 아니야',
  uspLine2Top: '상위 1%로 가는',
  uspLine2Bottom: '첫 21일',
  // 근거: 새해 결심자 80%+가 2월 둘째 주까지 포기(프랭클린코비 계열 조사) / 97%는 지난 기수 실측.
  willRate: '80%',
  forceRate: '97%',
};

export default function HeroSection({ onCTA }) {
  const status = useSeason5Status();
  const copy = COPY5[status];
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const isOfficial = status === 'official';

  const countdownTarget = isUpcoming ? COHORT5.officialOpen : COHORT5.officialDeadline;
  const countdownLabel = isUpcoming ? 'OPENS IN · 모집 오픈까지' : 'DEADLINE · 마감까지';

  const liveCount = useApplicantCount(isOfficial, COHORT5.cohortCode);
  const displayCount = previewCount(liveCount); // 배지 "N명 지원 중"도 ?spots 미리보기 반영

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none bg-accent-green/10" />

      {/* Above the Fold */}
      <div className="relative min-h-screen flex flex-col justify-center items-center px-6 py-16">
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <div className="flex justify-center mb-3 animate-fade-up">
            <span className="text-text-muted text-[11px] font-bold tracking-[0.18em]">
              run like <span className="font-black tracking-[0.25em] text-[13px] text-accent-green">TARZAN</span>
              <span className="text-white/30 mx-1">·</span>
              <span className="font-bold tracking-wide">21day challenge</span>
            </span>
          </div>

          <div className="flex justify-center mb-5 animate-fade-up">
            {isOfficial ? (
              <span className="inline-flex items-center gap-2 border-2 border-accent-green/90 bg-accent-green/10 text-text-primary py-1.5 px-4 rounded-full text-[12px] font-extrabold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse shadow-[0_0_12px_var(--color-accent-green)]"></span>
                <span>{displayCount != null ? `${displayCount}명 지원 중 · 선착순 30명` : '모집 중 · 선착순 30명'}</span>
              </span>
            ) : isClosed ? (
              <div className="inline-block transform -rotate-2 border-[3px] border-dashed border-accent-orange rounded-2xl bg-accent-orange/10 px-6 py-3">
                <div className="font-display text-[26px] leading-none tracking-[0.08em] text-accent-orange text-center">
                  CLOSED
                </div>
                <div className="text-text-primary text-[11px] font-extrabold text-center mt-1.5 tracking-[0.12em]">
                  모집 마감 · 결원 대기
                </div>
              </div>
            ) : (
              <span className="pill text-accent-orange">모집 {COHORT5.openLabel} 오픈</span>
            )}
          </div>

          <h1
            className="font-kr text-4xl md:text-6xl font-black text-accent-green leading-[1.15] break-keep mb-7 animate-fade-up"
            style={{ animationDelay: '0.12s', textShadow: '0 0 32px rgba(200,255,77,0.5)' }}
          >
            {USP.uspLine2Top}<br />
            {USP.uspLine2Bottom}
          </h1>

          {/* 의지 vs 강제성 대비 — 첫 화면은 이 한 장면으로 끝낸다. */}
          <div className="mb-6 animate-fade-up flex flex-col items-center gap-2" style={{ animationDelay: '0.2s' }}>
            <p className="text-text-muted text-[15px] sm:text-base font-bold break-keep">
              혼자 하면 <span className="tabular-nums">{USP.willRate}</span>가 포기
            </p>
            <p className="text-text-primary text-lg sm:text-xl font-black break-keep">
              함께하면 <span className="text-accent-green tabular-nums">{USP.forceRate}</span> 성공
            </p>
          </div>

          {isClosed ? (
            <div className="text-center my-5 animate-fade-up max-w-xs mx-auto" style={{ animationDelay: '0.25s' }}>
              <p className="text-text-secondary text-[13px] font-semibold leading-relaxed">
                결원 생기면 <span className="text-text-primary font-extrabold">대기 순서대로</span> 연락 줄게.
              </p>
            </div>
          ) : (
            <div className="my-5 animate-fade-up flex flex-col items-center gap-3" style={{ animationDelay: '0.25s' }}>
              <p className="text-text-secondary text-[11px] font-bold tracking-widest">{countdownLabel}</p>
              <CountdownTimer targetDate={countdownTarget} size="md" />
            </div>
          )}

          {/* 첫 화면은 1% 한 장면 + 타이머 + CTA만. 프로그램 상세(10분/시작일/상금/보증금)는
              아래 SystemSection·PricingSection·UrgencySection에 이미 있다. */}

          <div className="animate-fade-up mt-7" style={{ animationDelay: '0.3s' }}>
            {isOfficial && <SpotsBadge count={liveCount} className="mb-4" />}
            <Button onClick={onCTA} disabled={isUpcoming} className="animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] inline-flex flex-col items-center justify-center leading-tight">
              <span className="block">{copy.cta.hero}</span>
              <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
            </Button>
            {!isClosed && <BonusSection compact />}
          </div>
        </div>
      </div>

    </section>
  );
}
