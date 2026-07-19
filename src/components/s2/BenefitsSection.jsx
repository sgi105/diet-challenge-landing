import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT2 } from '../../data/config2';

// 오늘(수) 자정까지 신청 시 러닝 가이드 PDF 무료 증정 보너스.
// 타잔 1:1 피드백 + 식단 가이드 보너스는 종료(formFeedbackBonusExpireAt 마감) → 러닝 가이드를 단독 메인으로.
export default function BenefitsSection() {
  const active = new Date() < new Date(COHORT2.runningGuideBonusExpireAt);
  if (!active) return null;

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center mb-3">
          <span className="pill text-accent-orange">TODAY ONLY · 오늘(수) 자정 마감</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-2 text-text-primary leading-tight">
          오늘 신청하면<br /><span className="text-accent-orange">이 가이드 무료</span>
        </h2>
        <p className="text-text-muted text-center text-sm mb-5 font-semibold">
          오늘 자정 지나면 사라지는 혜택
        </p>
        <div className="flex justify-center mb-7">
          <CountdownTimer targetDate={COHORT2.runningGuideBonusExpireAt} size="md" />
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] border-l-[6px] border-accent-orange">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[11px] font-extrabold tracking-widest text-card-ink-faint">RUNNING GUIDE · PDF</span>
            <span className="text-white text-xs font-extrabold whitespace-nowrap bg-accent-orange px-3 py-1 rounded-full">무료 증정</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="text-5xl shrink-0 leading-none">🏃</div>
            <div className="flex-1">
              <p className="text-card-ink font-black text-xl leading-tight">
                모르면 다치고 손해보는<br />런린이 실수 7가지
              </p>
              <p className="text-card-ink-muted text-sm mt-2 leading-relaxed">
                260명 코칭 + 240일 무부상으로 정리한 7가지. 신발·워밍업·페이스·착지·호흡까지, 이것만 알아도 안 다치고 오래 뛴다.
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-card-ink text-sm font-bold bg-bg-primary/5 rounded-xl py-2.5">
            🎁 오늘 신청자 전원에게 PDF로 보내드려요
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
