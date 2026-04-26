import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';

export default function FinalCTASection({ onCTA }) {
  return (
    <section className="px-6 py-16 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black mb-8 leading-tight text-text-primary">
          4주 후, 당신은<br />두 사람 중 하나입니다.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="space-y-3 mb-8">
          <p className="text-accent-green font-extrabold text-xl">
            러닝 습관이 만들어진 진짜 러너
          </p>
          <p className="text-text-muted font-bold tracking-widest text-xs">OR</p>
          <p className="text-accent-orange font-extrabold text-xl">
            "다음 달부터 뛰어야지" 미루는 사람
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <p className="text-text-secondary mb-2 leading-relaxed">
          어차피 시작해야 할 러닝입니다.
        </p>
        <p className="text-text-primary font-bold text-lg mb-8">
          팀이 있을 때 시작하세요.
        </p>

        <Button onClick={onCTA} className="animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] inline-flex flex-col items-center justify-center leading-tight">
          <span className="block">지원하기</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">4/27(일) 23:59 마감 · 2분 소요</span>
        </Button>

        <p className="text-text-muted text-sm mt-4 font-semibold">
          팀 우승 시 최대 40만원 환급 · 30명 한정
        </p>
      </AnimateOnScroll>
    </section>
  );
}
