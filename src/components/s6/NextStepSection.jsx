import AnimateOnScroll from '../ui/AnimateOnScroll';
import { HERO_BAR6 } from '../../data/season6';

// 시즌6 — 90일 전체 여정을 "뛸 수 있는 거리"로 (가인 2026-10-22 "5km, 10km, 15km, 21km 이렇게 점점 증가").
// 앞 28일 무료 체험이 90일의 첫 계단이라는 걸 보여주는 자리. "체험 다음에 90일 더"로 읽히면 안 된다.
// 단위는 전부 "일". 가격은 쓰지 않는다.
// 막대 높이 = 거리 비례(21km = 100%). 첫 칸(무료 체험)만 흰색, 마지막(하프)은 라임.
// 거리·일차 SOT = 가인 13주 표(2026-10-22): 4주차 5km 테스트 · 9주차 롱런 10km · 11주차 롱런 14km · 13주차 하프.
//   일차 = 그 주 일요일(월요일 시작 기준). 단 하프는 13주차 토요일 = DAY 90 (가인 "90일 맞추자").
const STEPS = [
  { day: 28, km: 5, label: '무료 체험 끝', now: true },
  { day: 63, km: 10, label: '' },
  { day: 77, km: 14, label: '' },
  { day: 90, km: 21, label: '하프마라톤 완주', goal: true },
];
const MAX_KM = 21;
const BAR_MAX = 150; // 21km 막대 높이(px)

export default function NextStepSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-3 text-text-primary leading-tight break-keep">
          90일 동안<br />
          <span className="text-accent-green">이만큼 뛰게 돼</span>
        </h2>
        <p className="text-text-secondary text-center text-sm font-bold mb-8 break-keep">
          첫 {HERO_BAR6.freeDays}일은 무료로 5km까지
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-white/[0.06] border border-white/15 rounded-[20px] px-4 pt-5 pb-4">
          <div className="flex items-end gap-2.5">
            {STEPS.map((s) => (
              <div key={s.day} className="flex-1 flex flex-col items-center">
                <span
                  className={`font-display tabular-nums leading-none mb-2 ${
                    s.goal ? 'text-accent-green text-[26px]' : 'text-white text-[20px]'
                  }`}
                >
                  {s.km}km
                </span>
                <div
                  className={`w-full rounded-t-lg ${
                    s.now ? 'bg-white' : s.goal ? 'bg-accent-green' : 'bg-white/30'
                  }`}
                  style={{ height: (BAR_MAX * s.km) / MAX_KM }}
                />
              </div>
            ))}
          </div>
          <div className="h-[2px] bg-white/30" />
          <div className="flex gap-2.5 mt-2.5 text-center">
            {STEPS.map((s) => (
              <div key={s.day} className="flex-1">
                <p className={`text-[11px] font-extrabold ${s.now ? 'text-white' : 'text-text-muted'}`}>DAY {s.day}</p>
                {s.label && (
                  <p className={`text-[10.5px] font-bold mt-0.5 break-keep ${s.goal ? 'text-accent-green' : 'text-text-secondary'}`}>
                    {s.label}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-6">
        <p className="text-text-muted text-xs font-semibold text-center leading-relaxed break-keep">
          {HERO_BAR6.freeDays}일 해보고 이어가고 싶은 사람만 계속해. 자동 결제 없어.
        </p>
      </AnimateOnScroll>
    </section>
  );
}
