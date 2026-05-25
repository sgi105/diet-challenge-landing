import { useEffect, useState } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import AnimateOnScroll from '../ui/AnimateOnScroll';

const DARIMATI_SHOE_IMG = '/darimati.png';

function CountUpNumber({ target, isVisible }) {
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

  return <span>{count.toLocaleString()}</span>;
}

function CardLabel({ children, className = '' }) {
  return <p className={`text-[10px] font-extrabold tracking-widest mb-2 ${className}`}>{children}</p>;
}

export default function MoneyMechanicSection() {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section className="px-6 py-14 max-w-lg mx-auto" ref={ref}>
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">PRIZE POOL</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          총 보너스 풀 <span className="text-accent-green">105만원</span>
        </h2>
        <p className="text-text-secondary text-center mb-8">
          미션 실패한 사람의 보증금이<br />성공한 팀에게 돌아가.
        </p>
      </AnimateOnScroll>

      <div className="max-w-sm mx-auto w-full space-y-3">

        {/* Row 1: 실패 + 개인성공 */}
        <div className="grid grid-cols-2 gap-3">
          <AnimateOnScroll animation="animate-scale-in">
            <div className="bg-bg-card rounded-2xl p-5 h-full flex flex-col border-l-4 border-accent-orange shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
              <CardLabel className="text-accent-orange">미션 실패</CardLabel>
              <p className="text-3xl font-black text-accent-orange tabular-nums">0<span className="text-sm font-semibold ml-0.5">원</span></p>
              <p className="text-card-ink-muted text-xs mt-2 leading-relaxed flex-1">20만원 전액 몰수</p>
              <p className="text-accent-orange text-xs font-bold mt-3">수익률 -100%</p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll animation="animate-scale-in" delay={0.05}>
            <div className="bg-bg-card rounded-2xl p-5 h-full flex flex-col shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
              <CardLabel className="text-card-ink-muted">개인 성공</CardLabel>
              <p className="text-2xl font-black text-card-ink tabular-nums whitespace-nowrap">
                <CountUpNumber target={200000} isVisible={isVisible} /><span className="text-sm font-semibold ml-0.5">원</span>
              </p>
              <p className="text-card-ink-muted text-xs mt-2 leading-relaxed flex-1">20만원 예치 → 20만원 환급</p>
              <p className="text-card-ink-muted text-xs font-bold mt-3">본전 + 5km 완주한 몸</p>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Row 2: 팀 전원 성공 */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.1}>
          <div className="bg-bg-card rounded-2xl p-5 flex items-center justify-between border-2 border-bg-primary shadow-[0_4px_20px_rgba(30,60,255,0.15)]">
            <div>
              <CardLabel className="text-bg-primary">팀 전원 성공</CardLabel>
              <p className="text-3xl font-black text-bg-primary tabular-nums whitespace-nowrap">
                <CountUpNumber target={220000} isVisible={isVisible} /><span className="text-base font-semibold ml-0.5">원</span>
              </p>
              <p className="text-card-ink-muted text-xs mt-1">20만원 예치 → 22만원 환급</p>
            </div>
            <div className="text-right pl-4">
              <p className="text-bg-primary text-lg font-extrabold whitespace-nowrap">+2만원</p>
              <p className="text-card-ink-faint text-xs mt-0.5">+ 5km 완주한 몸</p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Row 3: 우승팀 */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.15}>
          <div className="bg-accent-green rounded-2xl p-6 shadow-[0_8px_32px_rgba(200,255,77,0.35)]">
            <CardLabel className="text-bg-primary">우승팀 🏆</CardLabel>
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img src={DARIMATI_SHOE_IMG} alt="DARIMATI 러닝화" className="w-20 h-20 object-contain" />
                <span className="absolute -top-1 -right-2 bg-bg-primary text-accent-green text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">×3</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-bg-primary text-lg font-extrabold leading-tight">DARIMATI 러닝화</p>
                <p className="text-bg-primary text-2xl font-black tabular-nums whitespace-nowrap">
                  450,000<span className="text-sm font-semibold ml-0.5">원</span><span className="text-sm font-semibold ml-1">상당</span>
                </p>
                <p className="text-bg-primary/75 text-[11px] mt-1">팀 전원 각자 1켤레씩</p>
                <p className="text-bg-primary/60 text-[10px] mt-0.5 leading-relaxed">타잔이 매일 신는 모델. 나이키에서 이걸로 바꾸고 매일 PB 갱신 중</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Row 4: 그랜드 챔피언 */}
        <AnimateOnScroll animation="animate-scale-in" delay={0.2}>
          <div className="rounded-2xl p-6 text-center border-2 border-yellow-400/60 bg-gradient-to-br from-yellow-400/15 to-yellow-400/5 shadow-[0_8px_32px_rgba(250,200,0,0.2)]">
            <CardLabel className="text-yellow-400">그랜드 챔피언 🏝️</CardLabel>
            <p className="text-3xl font-black text-text-primary mb-1">발리 왕복 항공권</p>
            <p className="text-yellow-300 text-2xl font-black tabular-nums">
              1,000,000<span className="text-sm font-semibold ml-0.5">원</span><span className="text-sm font-semibold ml-1">상당</span>
            </p>
            <p className="text-text-secondary text-xs mt-2">이번 시즌 전체 1등 · 1명 한정</p>
          </div>
        </AnimateOnScroll>

      </div>

      <AnimateOnScroll className="mt-8">
        <div className="max-w-sm mx-auto bg-bg-card rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          <p className="text-card-ink-muted text-sm leading-relaxed text-center">
            내가 실패하면 팀 전체 보너스가 날아가.<br />
            그 책임감이 <span className="text-card-ink font-bold">포기를 불가능하게</span> 만들어.
            <span className="text-card-ink-faint text-xs mt-3 block font-semibold">
              성공 기준: 21일 미션 수행률 90% 이상 + 5K 파이널 완주
            </span>
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
