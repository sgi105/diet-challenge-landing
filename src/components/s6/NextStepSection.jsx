import AnimateOnScroll from '../ui/AnimateOnScroll';

// 시즌6 — 90일 동안 몸을 어떻게 만드는지: 러닝 + 근력(푸시업) (가인 2026-10-23).
//   식단은 넣지 않는다. 근력은 28일 무료 체험 뒤 29일차부터, 종목은 푸시업 고정.
// ① 러닝: 뛸 수 있는 거리 계단(13주 표: 4주차 5km 테스트 · 9주차 롱런 10km · 11주차 14km · 13주차 일요일 하프).
// ② 근력: 90일 줄 위에 DAY 1-28 러닝 습관 / DAY 29-90 매일 푸시업. 영상 = 업셀 S5 푸시업 영상 앞 6초(480px로 줄임).
// ③ 마무리: 업셀 "90일 후면 매일 5km 뛰고 푸시업 100개 하는데 몸이 안 변하겠어?"를 근력 기간에 맞게 숫자 없이.
// 단위는 전부 "일". 가격은 쓰지 않는다.
// 눈금 = 날짜(신규 첫날이 프로그램 Day 4라 DAY 번호는 헷갈림). Day 28=11/22 · 63=12/27 · 77=1/10 · 하프=1/24(일).
const STEPS = [
  { day: '11/22', km: 5, label: '무료 체험 끝', now: true },
  { day: '12/27', km: 10, label: '' },
  { day: '1/10', km: 14, label: '' },
  { day: '1/24', km: 21, label: '하프마라톤 완주', goal: true },
];
const MAX_KM = 21;
const BAR_MAX = 140; // 21km 막대 높이(px)
const FREE_DAYS = 25;   // 신규 무료 체험 10/29-11/22
const REST_DAYS = 63;   // 11/23-1/24 러닝 + 푸시업

export default function NextStepSection() {
  const freePct = (FREE_DAYS / (FREE_DAYS + REST_DAYS)) * 100;
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-3 text-text-primary leading-tight break-keep">
          90일, 러닝 + 근력으로<br />
          <span className="text-accent-green">몸을 만든다</span>
        </h2>
        <p className="text-text-secondary text-center text-sm font-bold mb-8 break-keep">
          첫 {FREE_DAYS}일은 러닝 습관부터. 11/23(월)부터 매일 푸시업이 붙어
        </p>
      </AnimateOnScroll>

      {/* ① 러닝 — 뛸 수 있는 거리 */}
      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-white/[0.06] border border-white/15 rounded-[20px] px-4 pt-4 pb-4">
          <p className="text-accent-green text-[11px] font-black tracking-widest mb-3">01 · 러닝</p>
          <div className="flex items-end gap-2.5">
            {STEPS.map((s) => (
              <div key={s.day} className="flex-1 flex flex-col items-center">
                <span
                  className={`font-display tabular-nums leading-none mb-2 ${
                    s.goal ? 'text-accent-green text-[24px]' : 'text-white text-[18px]'
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
                <p className={`text-[11px] font-extrabold ${s.now ? 'text-white' : 'text-text-muted'}`}>{s.day}</p>
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

      {/* ② 근력 — 29일차부터 매일 푸시업 */}
      <AnimateOnScroll className="mt-3">
        <div className="bg-white/[0.06] border border-white/15 rounded-[20px] p-4">
          <p className="text-accent-green text-[11px] font-black tracking-widest mb-2">02 · 근력</p>
          <p className="text-text-primary text-[17px] font-black leading-snug break-keep">
            11/23(월)부터 매일 푸시업
          </p>
          <p className="text-text-secondary text-[13px] font-semibold leading-relaxed mt-1 break-keep">
            헬스장 안 가도 돼. 하루 5분으로 시작해서 매일 조금씩 늘려.
          </p>

          {/* 90일 줄 — 러닝 습관(25일) → 러닝 + 푸시업(62일) */}
          <div className="flex h-9 gap-[3px] mt-4">
            <div
              className="rounded-l-lg rounded-r-[3px] bg-white/15 flex items-center justify-center text-[11px] font-extrabold text-text-secondary"
              style={{ flex: FREE_DAYS }}
            >
              러닝 습관
            </div>
            <div
              className="rounded-r-lg rounded-l-[3px] bg-accent-green flex items-center justify-center text-[11px] font-black text-bg-primary"
              style={{ flex: REST_DAYS }}
            >
              러닝 + 매일 푸시업 💪
            </div>
          </div>
          <div className="relative h-4 mt-1 text-[10px] font-extrabold text-text-muted">
            <span className="absolute left-0">10/29</span>
            <span className="absolute -translate-x-1/2" style={{ left: `${freePct}%` }}>11/23</span>
            <span className="absolute right-0">1/24</span>
          </div>

          <video
            src="/s6/pushup.mp4?v=1"
            poster="/s6/pushup.jpg?v=1"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full mt-3 rounded-xl object-cover aspect-[4/3] bg-bg-deep"
          />
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-8">
        <p className="text-text-secondary text-center text-[15px] font-bold break-keep">90일 동안</p>
        <p className="text-text-primary text-center text-[22px] font-black leading-snug break-keep">
          매일 뛰고 매일 푸시업 하는데<br />
          <span className="text-accent-green">몸이 안 변하겠어?</span>
        </p>
        <p className="text-text-muted text-xs font-semibold text-center leading-relaxed mt-4 break-keep">
          {FREE_DAYS}일 해보고 이어가고 싶은 사람만 계속해. 자동 결제 없어.
        </p>
      </AnimateOnScroll>
    </section>
  );
}
