import AnimateOnScroll from '../ui/AnimateOnScroll';
import { testimonials } from '../../data/testimonials';

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
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

    </section>
  );
}
