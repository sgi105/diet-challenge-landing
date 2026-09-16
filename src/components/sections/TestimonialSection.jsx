import { useState } from 'react';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import { CardByStyle } from './TestimonialCards';
import { useTestimonialPicks } from '../../hooks/useTestimonialPicks';

// 처음엔 3개만. 이 섹션이 페이지에서 제일 길어서(3,800px+) 스크롤 이탈 지점이었다.
// 더 보고 싶은 사람은 "더보기"로 전체를 편다.
const INITIAL_COUNT = 3;

export default function TestimonialSection() {
  const [expanded, setExpanded] = useState(false);
  const { rows, cardStyle } = useTestimonialPicks();

  const visible = expanded ? rows : rows.slice(0, INITIAL_COUNT);
  const hasMore = rows.length > INITIAL_COUNT;

  return (
    <section className="py-14">
      <div className="px-6 max-w-lg mx-auto">
        <AnimateOnScroll>
          <span className="pill text-accent-green">REAL VOICES · 참가자 후기</span>
          <h2 className="font-kr text-3xl md:text-5xl mt-4 mb-4 text-text-primary break-keep">
            한 글자도 안 바꾼<br />
            <span className="text-accent-green">리얼 후기</span>
          </h2>
          <p className="text-text-secondary mb-10 leading-relaxed">
            런클럽 실제 인증 피드에서 그대로 가져왔어.
          </p>
        </AnimateOnScroll>

        {rows.length > 0 && (
          <>
            <AnimateOnScroll>
              <div className="flex flex-col gap-4 mb-6">
                {visible.map((t) => (
                  <CardByStyle key={t.id} style={cardStyle} t={t} />
                ))}
              </div>
            </AnimateOnScroll>

            {hasMore && (
              <AnimateOnScroll>
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="w-full bg-bg-card text-card-ink font-extrabold py-4 rounded-2xl border border-white/10 hover:border-accent-green/40 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                >
                  {expanded ? '접기' : `후기 더보기 (${rows.length}개 전체 보기)`}
                </button>
              </AnimateOnScroll>
            )}

            <p className="text-text-muted text-[11px] text-center leading-relaxed mt-6">
              사진/캡션은 실제 앱 피드 기준. 이름은 익명 처리.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
