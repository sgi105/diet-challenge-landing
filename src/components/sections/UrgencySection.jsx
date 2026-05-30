import AnimateOnScroll from '../ui/AnimateOnScroll';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';

const SCHEDULE_BY_VARIANT = {
  main: [
    { label: '지원 오픈', value: '5/25(월) 18:00', highlight: false },
    { label: '지원 마감', value: '5/28(목) 23:59', highlight: true },
    { label: '합격 발표', value: '5/29(금) 12:00', highlight: false },
    { label: '입금 마감', value: '5/29(금) 23:59', highlight: false },
    { label: '온라인 OT (줌)', value: '5/31(일) 16:00-16:30', highlight: false },
    { label: '챌린지 시작', value: '6/1(월)', highlight: false },
    { label: '5K 파이널', value: '6/21(일)', highlight: true },
  ],
  referral: [
    { label: '추천인 전형 마감', value: '5/28(목) 23:59', highlight: true },
    { label: '합격 발표', value: '5/29(금) 12:00', highlight: false },
    { label: '입금 마감', value: '5/29(금) 23:59', highlight: false },
    { label: '온라인 OT (줌)', value: '5/31(일) 16:00-16:30', highlight: false },
    { label: '챌린지 시작', value: '6/1(월)', highlight: false },
    { label: '5K 파이널', value: '6/21(일)', highlight: true },
  ],
};

export default function UrgencySection({ variant = 'main' }) {
  const isReferral = variant === 'referral';
  const deadline = isReferral ? COHORT.referralDeadline : COHORT.deadline;
  const schedule = SCHEDULE_BY_VARIANT[variant] ?? SCHEDULE_BY_VARIANT.main;
  const headline = isReferral ? '초대 전형 마감 임박' : '마감 임박';
  const sub = isReferral ? '추천인 전형 한정 · 5/28(목) 23:59 마감' : '30명 한정 · 5/28(목) 23:59 마감';
  const pill = isReferral ? 'INVITE ONLY' : 'DEADLINE';
  const firstDayBonusActive = new Date() < new Date(COHORT.firstDayBonusExpireAt);

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
          <CountdownTimer targetDate={deadline} size="md" />
        </div>
      </AnimateOnScroll>

      {firstDayBonusActive && (
        <AnimateOnScroll>
          <div className="mb-8 bg-gradient-to-br from-accent-orange/25 to-accent-orange/5 rounded-3xl p-6 border-2 border-accent-orange/60 shadow-[0_12px_40px_rgba(255,140,60,0.25)]">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <span className="text-2xl">🎁</span>
              <span className="pill text-accent-orange">FIRST-DAY BONUS</span>
            </div>
            <p className="text-center text-text-primary font-extrabold text-lg md:text-xl mb-2 leading-tight">
              첫날 신청 시 환급 <span className="text-accent-orange">+1만원</span>
            </p>
            <p className="text-center text-text-secondary text-sm mb-5">
              개인 성공 환급 <span className="font-bold text-accent-orange">20만 → 21만</span> · 5/26(화) 23:59 마감
            </p>
            <CountdownTimer targetDate={COHORT.firstDayBonusExpireAt} size="md" />
            <p className="text-center text-text-muted text-[11px] mt-4 font-semibold tracking-wide">
              ⏰ 이 시각이 지나면 영구히 사라져
            </p>
          </div>
        </AnimateOnScroll>
      )}

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-4">SCHEDULE</p>
          <div className="space-y-3">
            {schedule.map((item, i) => (
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
