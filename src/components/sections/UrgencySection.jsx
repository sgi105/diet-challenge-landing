import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';

export default function UrgencySection() {
  const spotsPercent = (COHORT.filledSpots / COHORT.totalSpots) * 100;

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-8 text-accent-orange">
          마감이 다가오고 있습니다.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <CountdownTimer targetDate={COHORT.deadline} size="lg" />
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-10 space-y-4">
        <div className="bg-bg-card rounded-xl p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">챌린지 시작일</span>
            <span className="text-text-primary font-semibold">2026년 3월 23일 (월)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">모집 마감</span>
            <span className="text-accent-orange font-semibold">2026년 3월 20일 (금) 자정</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">정원</span>
            <span className="text-text-primary font-semibold">{COHORT.totalSpots}명 (잔여 {COHORT.totalSpots - COHORT.filledSpots}석)</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-text-muted mb-2">
            <span>{COHORT.filledSpots}명 신청</span>
            <span>{COHORT.totalSpots}명 정원</span>
          </div>
          <div className="w-full h-3 bg-bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-orange to-accent-green rounded-full transition-all duration-1000"
              style={{ width: `${spotsPercent}%` }}
            />
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-6">
        <p className="text-text-secondary text-center text-sm">
          매 기수 조기 마감됩니다. 고민하는 동안 자리가 사라집니다.
        </p>
      </AnimateOnScroll>
    </section>
  );
}
