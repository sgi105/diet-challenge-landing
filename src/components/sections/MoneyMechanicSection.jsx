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

      <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto w-full">
        {/* Failure card */}
        <AnimateOnScroll animation="animate-scale-in">
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

        {/* Solo success card */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.1}>
          <div className="bg-bg-card border border-border rounded-2xl p-5 text-center h-full flex flex-col justify-between">
            <div>
              <p className="text-text-secondary text-sm font-semibold mb-2">나만 성공</p>
              <p className="text-2xl font-extrabold text-text-primary mb-2">
                <CountUpNumber target={200000} isVisible={isVisible} suffix="원" />
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                20만원 예치
                <br />→ 20만원 환급
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-text-secondary text-xs font-semibold">본전</p>
              <p className="text-text-secondary text-xs font-semibold">+ 3kg 감량한 몸</p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Team success card */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.2}>
          <div className="bg-bg-card border-2 border-accent-green rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(0,255,136,0.1)] h-full flex flex-col justify-between">
            <div>
              <p className="text-accent-green text-sm font-semibold mb-2">팀 전원 성공</p>
              <p className="text-2xl font-extrabold text-accent-green mb-2">
                <CountUpNumber target={250000} isVisible={isVisible} suffix="원" />
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                20만원 예치
                <br />→ 25만원 환급
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-accent-green text-xs font-semibold">수익 +5만원</p>
              <p className="text-accent-green text-xs font-semibold">+ 3kg 감량한 몸</p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Team 1st card */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.3}>
          <div className="bg-bg-card border-2 border-yellow-400 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(250,204,21,0.15)] h-full flex flex-col justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-semibold mb-2">팀 전원 + 팀 1등 🏆</p>
              <p className="text-2xl font-extrabold text-yellow-400 mb-2">
                <CountUpNumber target={300000} isVisible={isVisible} suffix="원" />
              </p>
              <p className="text-text-secondary text-xs leading-relaxed">
                20만원 예치
                <br />→ 30만원 환급
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-yellow-400 text-xs font-semibold">수익 +10만원</p>
              <p className="text-yellow-400 text-xs font-semibold">+ 3kg 감량한 몸</p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      <AnimateOnScroll className="mt-10">
        <div className="bg-bg-card rounded-xl p-5 border border-border">
          <p className="text-text-secondary text-sm leading-relaxed text-center">
            내가 실패하면 팀 전체 보너스가 날아갑니다.
            <br />
            그 책임감이 <span className="text-text-primary font-bold">포기를 불가능하게</span> 만듭니다.
            <br />
            <span className="text-text-muted text-xs mt-2 block">
              성공 기준: 미션 수행률 90% 이상 + 3kg 감량
            </span>
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
