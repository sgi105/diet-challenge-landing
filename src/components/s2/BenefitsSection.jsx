import { useState, useEffect } from 'react';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT2 } from '../../data/config2';
import { listApplicantsPublic } from '../../lib/applyApi';

const FEEDBACK_LIMIT = 10;

const benefits = [
  { icon: '🎥', title: '타잔이 직접 1:1 러닝 폼 피드백', desc: '영상 보내면 타잔이 직접 자세 코칭.', value: '50,000원', limited: true },
  { icon: '🥗', title: '21일 -3kg 식단 가이드 PDF', desc: '일반식 먹으면서 3kg 빼는 초간단 1.5끼 전략 가이드.', value: null },
];

export default function BenefitsSection() {
  const active = new Date() < new Date(COHORT2.formFeedbackBonusExpireAt);

  const [count, setCount] = useState(null);
  useEffect(() => {
    if (!active) return;
    let alive = true;
    async function load() {
      try {
        const json = await listApplicantsPublic(COHORT2.cohortCode);
        if (alive) setCount(json?.count ?? null);
      } catch { /* ignore */ }
    }
    load();
    const t = setInterval(load, 60000);
    return () => { alive = false; clearInterval(t); };
  }, [active]);

  if (!active) return null;

  const remaining = count != null ? Math.max(0, FEEDBACK_LIMIT - count) : null;
  const soldOut = remaining === 0;

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center mb-3">
          <span className="pill text-accent-orange">TODAY ONLY · 오늘 자정 마감</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-2 text-text-primary leading-tight">
          오늘 신청하면<br /><span className="text-accent-orange">무료 혜택 2가지</span>
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
                <p className="text-card-ink-muted text-sm">
                  {b.limited && <span className="font-bold">선착순 {FEEDBACK_LIMIT}명 한정.</span>} {b.desc}
                </p>
                {b.limited && remaining != null && (
                  soldOut ? (
                    <p className="mt-2 inline-block bg-card-ink/10 text-card-ink-faint text-[12px] font-extrabold px-3 py-1 rounded-full">
                      선착순 마감 ({FEEDBACK_LIMIT}/{FEEDBACK_LIMIT})
                    </p>
                  ) : (
                    <p className="mt-2 inline-block bg-accent-orange/15 text-accent-orange text-[12px] font-extrabold px-3 py-1 rounded-full">
                      🔥 {remaining}자리 남음
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
