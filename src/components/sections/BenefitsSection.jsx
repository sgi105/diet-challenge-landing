import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import { COHORT } from '../../data/config';

const benefits = [
  { icon: '⭐', title: '선발 가산점', desc: '같은 조건이면 오늘 지원자 우선 선발' },
  { icon: '🎥', title: '러닝 폼 1:1 영상 분석', desc: '5만원 가치 · 챌린지 첫 주 진행', value: '50,000원' },
  { icon: '📄', title: '식단 가이드 PDF', desc: '4주 러닝 챌린지 전용 식단표' },
];

export default function BenefitsSection({ onCTA }) {
  const expired = new Date() > new Date(COHORT.dDayBenefitExpireAt);
  if (expired) return null;

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center mb-3">
          <span className="pill text-accent-orange">TODAY ONLY</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-2 text-text-primary leading-tight">
          오늘 지원하면<br /><span className="text-accent-green">3가지 혜택</span> 추가
        </h2>
        <p className="text-text-muted text-center text-sm mb-8 font-semibold">
          내일(4/27)부터는 사라집니다
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="space-y-3 mb-8">
          {benefits.map((b, i) => (
            <div key={i} className="bg-bg-card rounded-3xl p-5 flex items-start gap-4 shadow-[0_12px_30px_rgba(0,0,0,0.15)] border-l-[6px] border-accent-green">
              <div className="text-3xl shrink-0">{b.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-card-ink font-bold">{b.title}</p>
                  {b.value && (
                    <span className="text-bg-primary text-xs font-extrabold whitespace-nowrap bg-bg-primary/10 px-2 py-0.5 rounded-full">
                      {b.value}
                    </span>
                  )}
                </div>
                <p className="text-card-ink-muted text-sm">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <Button onClick={onCTA} className="w-full shadow-[0_12px_40px_rgba(200,255,77,0.4)] flex flex-col items-center justify-center leading-tight">
          <span className="block">오늘 혜택 받고 지원하기</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">4/27(일) 23:59 마감 · 2분 소요</span>
        </Button>
      </AnimateOnScroll>
    </section>
  );
}
