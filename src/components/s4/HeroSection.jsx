import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT4, PROGRAM4 } from '../../data/season4';
import { useSeason4Status, COPY4 } from '../../hooks/useSeason4Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import { previewCount } from '../../lib/spots';
import SpotsBadge from '../s2/SpotsBadge';

const USP = {
  uspLine1: '혼자선 맨날 실패한 러닝',
  uspLine2Top: '30명 중 30명 전원',
  uspLine2Bottom: '성공한 미친 결과',
  badges: ['100% 온라인', '5인 1팀', '30명 선발'],
  headlineSub: '팀과 함께 21일',
  sub1Top: '혼자였으면 안 했을 일,',
  sub1Bottom: '팀이 만들어줘.',
};

export default function HeroSection({ onCTA }) {
  const status = useSeason4Status();
  const copy = COPY4[status];
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const isOfficial = status === 'official';

  const countdownTarget = isUpcoming ? COHORT4.officialOpen : COHORT4.officialDeadline;
  const countdownLabel = isUpcoming ? 'OPENS IN · 모집 오픈까지' : 'DEADLINE · 마감까지';

  const liveCount = useApplicantCount(isOfficial, COHORT4.cohortCode);
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
              <span className="pill text-accent-orange">모집 8/19(수) 아침 8시 오픈</span>
            )}
          </div>

          <h1
            className="font-kr text-2xl md:text-4xl font-black leading-tight break-keep mb-2 animate-fade-up text-text-primary"
            style={{ animationDelay: '0.1s' }}
          >
            {USP.uspLine1}
          </h1>
          <p
            className="font-kr text-4xl md:text-6xl font-black text-accent-green leading-[1.15] break-keep mb-7 animate-fade-up"
            style={{ animationDelay: '0.18s', textShadow: '0 0 32px rgba(200,255,77,0.5)' }}
          >
            {USP.uspLine2Top}<br />
            {USP.uspLine2Bottom}
          </p>

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

          {!isClosed && (
            <div className="text-center my-5 animate-fade-up" style={{ animationDelay: '0.27s' }}>
              <p className="text-text-secondary text-xs sm:text-sm font-bold leading-relaxed break-keep">
                하루 <span className="text-accent-green">{PROGRAM4.startMinutes}분</span>부터 시작 <span className="text-text-muted">→</span> 21일 뒤 <span className="text-accent-green">5K 완주</span>
              </p>
              <p className="text-text-muted text-[11px] font-semibold mt-1.5">
                8/24(월) 시작 · 21일 뒤 파이널 레이스
              </p>
              <p className="text-text-secondary text-xs sm:text-sm font-bold leading-relaxed mt-2.5 break-keep">
                🏆 1등 팀 전원 <span className="text-text-muted">→</span> <span className="text-accent-green">{PROGRAM4.prizeTeam1st}</span>
              </p>
            </div>
          )}

          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {isOfficial && <SpotsBadge count={liveCount} className="mb-4" />}
            <Button onClick={onCTA} disabled={isUpcoming} className="animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] inline-flex flex-col items-center justify-center leading-tight">
              <span className="block">{copy.cta.hero}</span>
              <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
            </Button>
            {!isClosed && (
              <>
                <p className="text-text-muted text-[11px] mt-3 font-semibold tracking-wide break-keep">
                  참가비 무료 · 보증금 20만원 · 완주하면 전액 환급
                </p>
                <p className="text-text-muted text-[11px] mt-1.5 font-semibold tracking-wide break-keep">
                  지원서 읽고 같이 갈 사람만 뽑아
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 스크롤 후 — 상세 카피 */}
      <div className="relative px-6 pb-20">
        <div className="relative z-10 text-center max-w-lg mx-auto">
          <p className="text-text-secondary text-xs font-bold tracking-wider mb-6 animate-fade-up">
            {USP.badges.join(' · ')}
          </p>

          <p
            className="font-kr text-3xl md:text-4xl font-black text-accent-green mb-6 animate-fade-up tracking-tight"
            style={{ textShadow: '0 0 32px rgba(200,255,77,0.55)' }}
          >
            {USP.headlineSub}
          </p>

          <p className="text-text-secondary text-base leading-relaxed mb-8 animate-fade-up">
            {USP.sub1Top}<br />
            <span className="text-text-primary font-bold">{USP.sub1Bottom}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
