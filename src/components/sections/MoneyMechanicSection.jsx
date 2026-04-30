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
        <span className="pill text-accent-green block w-fit mx-auto">PRIZE POOL</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          총 상금 풀 <span className="text-accent-green">168만원</span>
        </h2>
        <p className="text-text-secondary text-center mb-4">
          미션 실패한 사람의 보증금이<br />우승팀에게 돌아갑니다.
        </p>
        <p className="text-text-muted text-center text-xs mb-8 font-semibold tracking-wide">
          실패 <span className="text-accent-orange font-bold">-100%</span> · 개인 성공 <span className="text-text-primary font-bold">±0%</span> · 팀 성공 <span className="text-bg-primary font-bold">+20%</span> · 우승 <span className="text-accent-green font-bold">+100%</span>
        </p>
      </AnimateOnScroll>

      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
        {/* Failure card */}
        <AnimateOnScroll animation="animate-scale-in">
          <div className="bg-bg-card rounded-3xl p-5 text-center h-full flex flex-col justify-between border-l-[6px] border-accent-orange shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div>
              <p className="text-accent-orange text-xs font-extrabold tracking-widest mb-2">미션 실패</p>
              <p className="text-3xl font-black text-accent-orange mb-2 tabular-nums whitespace-nowrap">
                <CountUpNumber target={0} isVisible={isVisible} />
                <span className="text-base ml-0.5">원</span>
              </p>
              <p className="text-card-ink-muted text-xs leading-relaxed">
                20만원<br />전액 몰수
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-accent-orange text-xs font-bold">수익률 -100%</p>
              <p className="text-card-ink-faint text-xs font-semibold">+ 그대로인 몸</p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Solo success card */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.1}>
          <div className="bg-bg-card rounded-3xl p-5 text-center h-full flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            <div>
              <p className="text-card-ink text-xs font-extrabold tracking-widest mb-2">개인 성공</p>
              <p className="text-2xl font-black text-card-ink mb-2 tabular-nums whitespace-nowrap">
                <CountUpNumber target={200000} isVisible={isVisible} />
                <span className="text-sm ml-0.5">원</span>
              </p>
              <p className="text-card-ink-muted text-xs leading-relaxed">
                20만원 예치<br />→ 20만원 환급
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-card-ink-muted text-xs font-bold">본전</p>
              <p className="text-card-ink-faint text-xs font-semibold">+ 5km 완주한 몸</p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Team success card */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.2}>
          <div className="bg-bg-card rounded-3xl p-5 text-center h-full flex flex-col justify-between border-2 border-bg-primary shadow-[0_12px_30px_rgba(30,60,255,0.18)]">
            <div>
              <p className="text-bg-primary text-xs font-extrabold tracking-widest mb-2">팀 전원 성공</p>
              <p className="text-2xl font-black text-bg-primary mb-2 tabular-nums whitespace-nowrap">
                <CountUpNumber target={240000} isVisible={isVisible} />
                <span className="text-sm ml-0.5">원</span>
              </p>
              <p className="text-card-ink-muted text-xs leading-relaxed">
                20만원 예치<br />→ 24만원 환급
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-bg-primary text-xs font-bold">수익 +4만원</p>
              <p className="text-card-ink-faint text-xs font-semibold">+ 5km 완주한 몸</p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Team 1st card */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.3}>
          <div className="bg-accent-green rounded-3xl p-5 text-center h-full flex flex-col justify-between shadow-[0_16px_40px_rgba(200,255,77,0.4)]">
            <div>
              <p className="text-bg-primary text-xs font-extrabold tracking-widest mb-2">우승팀 🏆</p>
              <p className="text-2xl font-black text-bg-primary mb-2 tabular-nums whitespace-nowrap">
                <CountUpNumber target={400000} isVisible={isVisible} />
                <span className="text-sm ml-0.5">원</span>
              </p>
              <p className="text-bg-primary/80 text-xs leading-relaxed font-semibold">
                20만원 예치<br />→ 40만원 환급
              </p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-bg-primary text-xs font-extrabold">수익 +20만원</p>
              <p className="text-bg-primary/70 text-xs font-bold">≈ 러닝화 1켤레</p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>

      <AnimateOnScroll className="mt-10">
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
          <p className="text-card-ink-muted text-sm leading-relaxed text-center">
            내가 실패하면 팀 전체 보너스가 날아갑니다.
            <br />
            그 책임감이 <span className="text-card-ink font-bold">포기를 불가능하게</span> 만듭니다.
            <br />
            <span className="text-card-ink-faint text-xs mt-3 block font-semibold">
              성공 기준: 4주 미션 수행률 90% 이상 + 5K 파이널 완주
            </span>
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
