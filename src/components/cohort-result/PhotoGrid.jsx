import AnimateOnScroll from '../ui/AnimateOnScroll';
import PhotoCard from './PhotoCard';
import { useTestimonialPicks } from '../../hooks/useTestimonialPicks';

export default function PhotoGrid() {
  const { photoRows } = useTestimonialPicks();
  if (!photoRows.length) return null;

  return (
    <AnimateOnScroll className="w-full max-w-2xl mx-auto">
      <div className="bg-bg-card rounded-2xl p-3 sm:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
        <div className="flex items-baseline justify-between mb-3 px-1">
          <p className="text-card-ink text-sm font-extrabold">인증샷 그리드</p>
          <p className="text-card-ink-faint text-[10px] font-semibold">
            21일 · 실제 인증 사진
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {photoRows.map((p) => (
            <PhotoCard key={p.id} photo={p} />
          ))}
        </div>
      </div>
    </AnimateOnScroll>
  );
}
