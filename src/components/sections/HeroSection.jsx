import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';

export default function HeroSection({ onCTA }) {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20 overflow-hidden">
      {/* Lime glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-green/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Season pill */}
        <div className="flex justify-center mb-6 animate-fade-up">
          <span className="pill text-accent-green">SEASON [0] · 4WK RUN</span>
        </div>

        {/* Main headline */}
        <h1 className="font-kr text-4xl md:text-6xl mb-6 animate-fade-up text-text-primary" style={{ animationDelay: '0.1s' }}>
          팀과 함께 4주
          <br />
          <span className="text-accent-green">진짜 러너</span>가 된다
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-7 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          {['100% 온라인', '3인 1팀', '30명 한정'].map((t) => (
            <span key={t} className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-bg-primary text-xs font-extrabold whitespace-nowrap">
              {t}
            </span>
          ))}
        </div>

        {/* Sub-headline */}
        <p className="text-text-secondary text-base leading-relaxed mb-9 animate-fade-up" style={{ animationDelay: '0.22s' }}>
          혼자였으면 안 했을 일,<br />
          <span className="text-text-primary font-bold">팀이 만들어줍니다.</span>
        </p>

        {/* CTA */}
        <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Button onClick={onCTA} className="animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] inline-flex flex-col items-center justify-center leading-tight">
            <span className="block">지원하기</span>
            <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">4/27(일) 23:59 마감 · 2분 소요</span>
          </Button>
        </div>

        {/* Countdown */}
        <div className="mt-10 animate-fade-up" style={{ animationDelay: '0.5s' }}>
          <p className="text-text-muted text-[11px] mb-3 font-bold tracking-widest">DEADLINE COUNTDOWN</p>
          <CountdownTimer targetDate={COHORT.deadline} size="md" />
        </div>
      </div>
    </section>
  );
}
