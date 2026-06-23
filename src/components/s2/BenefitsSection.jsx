import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT2 } from '../../data/config2';

// 시즌1 BenefitsSection의 "러닝 폼 1:1 영상 분석" 혜택 재사용.
// 시즌2: 오늘 자정까지 신청 시 1:1 러닝 폼 무료 피드백 (만료 시 섹션 자동 숨김).
const benefits = [
  { icon: '🎥', title: '1:1 러닝 폼 영상 분석', desc: '챌린지 기간 내 영상 찍어서 요청 3회까지 · 5만원 가치', value: '50,000원' },
];

export default function BenefitsSection() {
  const active = new Date() < new Date(COHORT2.formFeedbackBonusExpireAt);
  if (!active) return null;

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center mb-3">
          <span className="pill text-accent-orange">TODAY ONLY · 오늘 자정 마감</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-2 text-text-primary leading-tight">
          오늘 자정까지 신청하면<br /><span className="text-accent-orange">1:1 러닝 폼 무료 피드백</span>
        </h2>
        <p className="text-text-muted text-center text-sm mb-5 font-semibold">
          오늘 자정 지나면 사라지는 혜택
        </p>
        <div className="flex justify-center mb-6">
          <CountdownTimer targetDate={COHORT2.formFeedbackBonusExpireAt} size="md" />
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="space-y-3">
          {benefits.map((b, i) => (
            <div key={i} className="bg-bg-card rounded-3xl p-5 flex items-start gap-4 shadow-[0_12px_30px_rgba(0,0,0,0.15)] border-l-[6px] border-accent-orange">
              <div className="text-3xl shrink-0">{b.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-card-ink font-bold">{b.title}</p>
                  {b.value && (
                    <span className="text-bg-primary text-xs font-extrabold whitespace-nowrap bg-bg-primary/10 px-2 py-0.5 rounded-full">{b.value}</span>
                  )}
                </div>
                <p className="text-card-ink-muted text-sm">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
