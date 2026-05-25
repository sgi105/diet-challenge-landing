import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';

const benefits = [
  { icon: '🎥', title: '러닝 폼 1:1 영상 분석', desc: '챌린지 기간 내 영상 찍어서 요청 3회까지 가능 · 5만원 가치', value: '50,000원' },
];

export default function BenefitsSection({ onCTA }) {
  const expireAt = new Date(COHORT.dDayBenefitExpireAt);
  const expired = new Date() > expireAt;
  const firstDayBonusActive = new Date() < new Date(COHORT.firstDayBonusExpireAt);
  if (expired && !firstDayBonusActive) return null;
  const nextDay = new Date(expireAt.getTime() + 1000);
  const tmLabel = `${nextDay.getMonth() + 1}/${nextDay.getDate()}`;

  const showBenefits = !expired;
  let headline;
  let subline;
  let pillLabel;
  if (firstDayBonusActive && showBenefits) {
    headline = (
      <>첫날 신청하면<br /><span className="text-accent-orange">+1만 보너스 + 2가지 혜택</span></>
    );
    subline = '5/25(월) 24:00 첫날 보너스 마감';
    pillLabel = 'FIRST-DAY BONUS';
  } else if (firstDayBonusActive) {
    headline = (
      <>첫날 신청하면<br /><span className="text-accent-orange">+1만원 보너스</span></>
    );
    subline = '5/25(월) 24:00까지 신청자 한정';
    pillLabel = 'FIRST-DAY ONLY';
  } else {
    headline = (
      <>오늘 지원하면<br /><span className="text-accent-green">특별 혜택</span>으로</>
    );
    subline = `${tmLabel}부터는 사라져`;
    pillLabel = 'TODAY ONLY';
  }

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center mb-3">
          <span className="pill text-accent-orange">{pillLabel}</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-2 text-text-primary leading-tight">
          {headline}
        </h2>
        <p className="text-text-muted text-center text-sm mb-4 font-semibold">
          {subline}
        </p>
        {firstDayBonusActive && (
          <div className="flex justify-center mb-6">
            <CountdownTimer targetDate={COHORT.firstDayBonusExpireAt} size="md" />
          </div>
        )}
      </AnimateOnScroll>

      {firstDayBonusActive && (
        <AnimateOnScroll>
          <div className="bg-gradient-to-br from-accent-orange/20 to-accent-orange/5 rounded-3xl p-6 mb-4 border-2 border-accent-orange/60 shadow-[0_12px_40px_rgba(255,140,60,0.25)]">
            <div className="flex items-start gap-4">
              <div className="text-4xl shrink-0">🎁</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-accent-orange font-extrabold text-lg leading-tight">
                    개인 성공 환급 <span className="whitespace-nowrap">+1만원</span>
                  </p>
                  <span className="text-bg-primary bg-accent-orange text-[11px] font-extrabold whitespace-nowrap px-2 py-1 rounded-full">
                    FIRST DAY
                  </span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mb-2">
                  첫날(5/25 오픈 ~ 5/25 24:00) 신청자 한정.<br />
                  개인 성공 시 환급금이 <span className="font-extrabold text-accent-orange">20만 → 21만</span>으로 늘어납니다.
                </p>
                <p className="text-text-muted text-[11px] font-semibold tracking-wide">
                  ⏰ 5/25(월) 24:00 마감 · 이후 영구히 사라짐
                </p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      )}

      {showBenefits && (
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
      )}

      <AnimateOnScroll>
        <Button onClick={onCTA} className="w-full mt-6 shadow-[0_12px_40px_rgba(200,255,77,0.4)] flex flex-col items-center justify-center leading-tight">
          <span className="block">{firstDayBonusActive ? '첫날 보너스 받고 지원하기' : '오늘 혜택 받고 지원하기'}</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">
            {firstDayBonusActive ? '5/25(월) 24:00까지 · 2분 소요' : '오늘 23:59까지 · 2분 소요'}
          </span>
        </Button>
      </AnimateOnScroll>
    </section>
  );
}
