import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT6, SCHEDULE6 } from '../../data/season6';
import { useSeason6Status } from '../../hooks/useSeason6Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import SpotsBadge from '../s2/SpotsBadge';

// hideCountdown: 카운트다운 숨김(선택). 페이지에 다른 카운트다운이 이미 있을 때.
export default function UrgencySection({ hideCountdown = false } = {}) {
  const status = useSeason6Status();
  const isUpcoming = status === 'upcoming';
  const target = isUpcoming ? COHORT6.officialOpen : COHORT6.officialDeadline;
  const headline = isUpcoming ? '모집 곧 오픈' : '마감 임박';
  const sub = isUpcoming
    ? `곧 오픈 · 정원 ${COHORT6.totalSpots}명`
    : `정원 ${COHORT6.totalSpots}명 · ${COHORT6.deadlineLabel} 마감`;
  const pill = isUpcoming ? 'OPENS SOON' : 'DEADLINE';

  const count = useApplicantCount(!isUpcoming, COHORT6.cohortCode);

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
          {!hideCountdown && <CountdownTimer targetDate={target} size="md" />}
          {!isUpcoming && <SpotsBadge count={count} className="mt-5" />}
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-4">SCHEDULE</p>
          <div className="space-y-3">
            {SCHEDULE6.map((item, i) => (
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
