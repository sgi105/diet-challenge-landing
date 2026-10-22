import AnimateOnScroll from '../ui/AnimateOnScroll';
import { PROGRAM6, COHORT6, WEEKS6, DAY_MINUTES6 } from '../../data/season6';

// 시즌6 — 28일 프로그램 자체를 보여주는 자리 (s5v2/SystemSection fork).
// 흐름(가인 13주 표): 5분 시작 → 하루 1분씩 → Day 21에 25분 → 4주차 평일 10분 회복 → Day 28 5km 테스트.
// 핵심 메시지는 시즌5와 같다: 권장 시간은 올라가도 성공 기준선(10분)은 그대로.
//   (앱은 러닝 시간을 판정하지 않는다 — 마감 전 피드 인증이면 성공. 10분은 운영 규칙이라 앱보다 엄격한 쪽이다.)
export default function SystemSection() {
  const max = PROGRAM6.peakMinutes;
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black mb-4 text-text-primary leading-tight break-keep">
          {COHORT6.durationDays}일간 하루 {PROGRAM6.successMinutes}분<br />
          <span className="text-accent-green">누구나 할 수 있어</span>
        </h2>
        <p className="text-text-secondary text-center mb-8 leading-relaxed break-keep">
          졸라 쉽게 시작해. 성공을 쌓다 보면 관성이 붙어서 점점 쉬워져.<br />
          솔직히 하루 {PROGRAM6.successMinutes}분도 없다는 건 스스로를 속이는 거지?
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <p className="text-text-muted text-xs font-bold tracking-widest mb-3">
          무료 체험 28일 흐름
        </p>
        <div className="space-y-2">
          {WEEKS6.map((w) => (
            <div
              key={w.label}
              className={`flex items-center gap-3 rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${
                w.highlight ? 'bg-accent-green text-bg-primary' : 'bg-bg-card text-card-ink'
              }`}
            >
              <span
                className={`text-[11px] font-extrabold tracking-widest shrink-0 w-16 ${
                  w.highlight ? 'text-bg-primary/80' : 'text-card-ink-faint'
                }`}
              >
                {w.label}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base leading-tight ${w.highlight ? 'text-bg-primary' : 'text-card-ink'}`}>
                  {w.title}
                </p>
                <p className={`text-sm ${w.highlight ? 'text-bg-primary/80' : 'text-card-ink-muted'}`}>
                  {w.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      {/* 권장 러닝 시간 + 성공 기준선(10분) — 막대가 오르내려도 기준선은 그대로 */}
      <AnimateOnScroll className="mt-8">
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          {/* 기준선 라벨은 그래프 밖 머리줄에 — 마지막 주 디로딩 막대(10분)가 기준선과 같은 높이라 안에 두면 겹친다. */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-card-ink-faint text-[11px] font-extrabold">권장 러닝 시간</p>
            <p className="flex items-center gap-1.5 text-bg-primary text-[11px] font-black">
              <span className="inline-block w-4 border-t-2 border-bg-primary" />
              {PROGRAM6.successMinutes}분만 넘으면 성공
            </p>
          </div>
          <div className="relative h-24 mb-3">
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {DAY_MINUTES6.map((min, i) => {
                const isFinal = i === COHORT6.durationDays - 1;
                // 파이널 날은 시간이 아니라 5K — 막대는 최고 높이로 그리고 색으로 구분한다.
                const h = isFinal ? 100 : (min / max) * 100;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-[3px] ${isFinal ? 'bg-accent-orange' : 'bg-bg-primary/25'}`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
            <div
              className="absolute inset-x-0 border-t-2 border-bg-primary"
              style={{ bottom: `${(PROGRAM6.successMinutes / max) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-card-ink-muted text-[11px] font-bold">
            <span>Day 1 · {PROGRAM6.startMinutes}분</span>
            <span>Day {PROGRAM6.peakDay} · {PROGRAM6.peakMinutes}분</span>
            <span>Day {PROGRAM6.deloadFromDay} · 회복</span>
            <span className="text-accent-orange">Day {COHORT6.durationDays} · {PROGRAM6.finalDistanceKm}K</span>
          </div>
          <p className="text-card-ink text-sm font-bold leading-relaxed mt-4 break-keep">
            매일 1분씩 늘리는 건 권장일 뿐. <span className="text-bg-primary">{PROGRAM6.successMinutes}분만 뛰면 오늘 미션 성공이야.</span>
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
