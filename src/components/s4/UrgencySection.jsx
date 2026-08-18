import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT4, SCHEDULE4 } from '../../data/season4';
import { useSeason4Status } from '../../hooks/useSeason4Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import SpotsBadge from '../s2/SpotsBadge';

export default function UrgencySection() {
  const status = useSeason4Status();
  const isUpcoming = status === 'upcoming';
  const target = isUpcoming ? COHORT4.officialOpen : COHORT4.officialDeadline;
  const headline = isUpcoming ? '모집 곧 오픈' : '마감 임박';
  const sub = isUpcoming
    ? '8/19(수) 아침 8시 오픈 · 선착순 30명'
    : '선착순 30명 · 8/22(토) 오후 2시 마감';
  const pill = isUpcoming ? 'OPENS SOON' : 'DEADLINE';

  const count = useApplicantCount(!isUpcoming, COHORT4.cohortCode);

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-orange block w-fit mx-auto">{pill}</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          {headline}
        </h2>
        <p className="text-text-secondary text-center text-sm mb-8">
          {sub}
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="mb-8">
          <CountdownTimer targetDate={target} size="md" />
          {!isUpcoming && <SpotsBadge count={count} className="mt-5" />}
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-4">SCHEDULE</p>
          <div className="space-y-3">
            {SCHEDULE4.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-card-ink-muted font-medium">{item.label}</span>
                <span className={item.highlight ? 'text-accent-orange font-extrabold' : 'text-card-ink font-bold'}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
