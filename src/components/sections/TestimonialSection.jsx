import AnimateOnScroll from '../ui/AnimateOnScroll';
import { testimonials, stats } from '../../data/testimonials';

function StarRating() {
  return (
    <div className="flex gap-0.5 mb-2">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-accent-green text-sm">★</span>
      ))}
    </div>
  );
}

export default function TestimonialSection() {
  return (
    <section className="py-14">
      <div className="px-6 max-w-lg mx-auto">
        <AnimateOnScroll>
          <span className="text-accent-green text-sm font-semibold">후기</span>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-2 mb-8">
            이미 성공한 사람들
          </h2>
        </AnimateOnScroll>
      </div>

      {/* Horizontal scroll carousel */}
      <AnimateOnScroll>
        <div className="flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[85vw] max-w-[340px] bg-bg-card rounded-2xl p-6 border border-border"
            >
              <StarRating />
              <p className="text-text-secondary leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name} ({t.age}세)</p>
                    <p className="text-xs text-text-muted">{t.job}</p>
                  </div>
                </div>
                <span className="text-accent-green font-bold text-sm">-{t.lost}</span>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      {/* Stats */}
      <AnimateOnScroll>
        <div className="flex justify-center gap-8 mt-8 px-6">
          <div className="text-center">
            <p className="text-accent-green font-bold text-xl">-{stats.avgLoss}</p>
            <p className="text-text-muted text-xs">평균 감량</p>
          </div>
          <div className="text-center">
            <p className="text-accent-green font-bold text-xl">{stats.missionRate}</p>
            <p className="text-text-muted text-xs">미션 완수율</p>
          </div>
          <div className="text-center">
            <p className="text-accent-green font-bold text-xl">116명</p>
            <p className="text-text-muted text-xs">바디프로필 달성</p>
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
