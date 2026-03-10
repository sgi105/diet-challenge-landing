import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';

export default function FinalCTASection({ onCTA }) {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="text-2xl md:text-4xl font-extrabold mb-8 leading-tight">
          30일 후, 당신은
          <br />두 사람 중 하나입니다.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="space-y-3 mb-8">
          <p className="text-accent-green font-bold text-lg">
            24만원을 돌려받고, 거울 앞에서 웃는 사람
          </p>
          <p className="text-text-muted">or</p>
          <p className="text-accent-orange font-bold text-lg">
            "다음 달부터 해야지" 하며 또 미루는 사람
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <p className="text-text-secondary mb-3 leading-relaxed">
          어차피 빼야 할 살입니다.
        </p>
        <p className="text-text-primary font-bold text-lg mb-8">
          돈까지 벌면서 빼세요.
        </p>

        <Button onClick={onCTA} className="animate-pulse-glow">
          20만원 걸고 도전하기
        </Button>

        <p className="text-text-muted text-sm mt-4">
          성공하면 240,000원 돌려받습니다
        </p>
      </AnimateOnScroll>
    </section>
  );
}
