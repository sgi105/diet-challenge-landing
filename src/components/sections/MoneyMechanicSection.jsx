import { useEffect, useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import AnimateOnScroll from '../ui/AnimateOnScroll';

function CountUpNumber({ target, isVisible, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [isVisible, target]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function MoneyMechanicSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="px-6 py-14 max-w-lg mx-auto" ref={ref}>
      <AnimateOnScroll>
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-3">
          계산은 단순합니다.
        </h2>
        <p className="text-text-secondary text-center mb-8">
          당신의 각오에 가격표를 붙이세요.
        </p>
      </AnimateOnScroll>

      <div className="grid grid-cols-2 gap-4">
        {/* Success card */}
        <AnimateOnScroll animation="animate-scale-in">
          <div className="bg-bg-card border-2 border-accent-green rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(0,255,136,0.15)] h-full flex flex-col justify-between">
            <div>
              <p className="text-accent-green text-sm font-semibold mb-2">미션 성공</p>
              <p className="text-2xl font-extrabold text-accent-green mb-2">
                <CountUpNumber target={240000} isVisible={isVisible} suffix="원" />
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                20만원 예치
                <br />→ 24만원 돌려받기
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-accent-green text-xs font-semibold">수익률 +20%</p>
              <p className="text-accent-green text-xs font-semibold">+ 5kg 감량한 몸</p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Failure card */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.15}>
          <div className="bg-bg-card border-2 border-accent-orange rounded-2xl p-5 text-center h-full flex flex-col justify-between">
            <div>
              <p className="text-accent-orange text-sm font-semibold mb-2">미션 실패</p>
              <p className="text-2xl font-extrabold text-accent-orange mb-2">
                <CountUpNumber target={0} isVisible={isVisible} suffix="원" />
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                20만원
                <br />전액 몰수
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-accent-orange text-xs font-semibold">수익률 -100%</p>
              <p className="text-accent-orange text-xs font-semibold">+ 아무것도 안 변한 몸</p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      <AnimateOnScroll className="mt-10">
        <div className="bg-bg-card rounded-xl p-5 border border-border">
          <p className="text-text-secondary text-sm leading-relaxed text-center">
            적금 이자보다 높고, 주식보다 확실합니다.
            <br />
            유일한 변수는 <span className="text-text-primary font-bold">당신의 행동</span>뿐.
            <br />
            <span className="text-text-muted text-xs mt-2 block">
              성공 기준: 미션 수행률 90% 이상 + 5kg 감량
            </span>
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
