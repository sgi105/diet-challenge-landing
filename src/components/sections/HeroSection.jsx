import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';

export default function HeroSection({ onCTA }) {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-green/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Pre-headline */}
        <span className="inline-block text-accent-orange text-sm font-semibold tracking-wide mb-6 animate-fade-up">
          9기수 · 116명 바디프로필 달성 | 신규 모집 중
        </span>

        {/* Main headline */}
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          30일 안에 3kg 빼면
          <br />
          <span className="text-accent-green">최대 30만원</span> 돌려드립니다.
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">100% 온라인</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">3인 1팀</span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20">참가비 0원</span>
        </div>

        {/* Sub-headline */}
        <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-8 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          20만원을 거세요. 팀이 전원 성공하면 <span className="text-accent-green font-semibold">10만원 벌고</span>,
          <br />
          실패하면 <span className="text-accent-orange font-semibold">전액 몰수.</span>
          <br />
          <span className="text-text-primary font-semibold mt-2 block">팀이 있으면, 포기가 안 됩니다.</span>
        </p>

        {/* CTA */}
        <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Button onClick={onCTA} className="animate-pulse-glow">
            인스타 DM으로 신청하기
          </Button>
        </div>


        {/* Countdown */}
        <div className="mt-8 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-text-muted text-xs mb-3">모집 마감까지</p>
          <CountdownTimer targetDate={COHORT.deadline} />
        </div>
      </div>
    </section>
  );
}
