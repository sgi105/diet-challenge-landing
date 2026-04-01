import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';


export default function UrgencySection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-4 text-accent-orange">
          4월 기수, 이틀 만에 마감됐습니다.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-xl p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">4월 기수 모집 시작</span>
            <span className="text-text-primary font-semibold">2026년 3월 29일</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">4월 기수 마감</span>
            <span className="text-accent-orange font-semibold">2026년 3월 31일 (이틀 만에 마감)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">5월 기수 모집</span>
            <span className="text-accent-green font-semibold">대기 명단 순서대로 안내</span>
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-6">
        <p className="text-text-secondary text-center text-sm">
          대기 명단에 먼저 등록할수록 우선 안내받습니다.
        </p>
      </AnimateOnScroll>
    </section>
  );
}
