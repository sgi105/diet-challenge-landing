import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT2 } from '../../data/config2';
import { useSeason2Status } from '../../hooks/useSeason2Status';

const SCHEDULE = [
  { label: '정식 모집 마감', value: '6/25(목) 23:59', highlight: true },
  { label: '합격 발표', value: '6/26(금)', highlight: false },
  { label: '입금 마감', value: '6/26(금)', highlight: false },
  { label: '온라인 OT (줌)', value: '6/28(일)', highlight: false },
  { label: '챌린지 시작', value: '6/29(월)', highlight: false },
];

export default function UrgencySection() {
  const status = useSeason2Status();
  const isPrereg = status === 'prereg';
  const isInterlude = status === 'interlude';
  const target = isPrereg ? COHORT2.preRegEnd : isInterlude ? COHORT2.officialOpen : COHORT2.officialDeadline;
  const headline = isPrereg ? '사전신청 마감 임박' : isInterlude ? '정식 모집 곧 오픈' : '마감 임박';
  const sub = isPrereg
    ? '지인 추천 사전신청 · 6/21(일) 자정 마감'
    : isInterlude
      ? '정식 모집 6/23(화) 오픈 · 선착순 30명'
      : '선착순 30명 · 6/25(목) 23:59 마감';
  const pill = isInterlude ? 'OPENS SOON' : 'DEADLINE';

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
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-4">SCHEDULE</p>
          <div className="space-y-3">
            {SCHEDULE.map((item, i) => (
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
