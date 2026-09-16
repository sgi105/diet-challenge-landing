import AnimateOnScroll from '../ui/AnimateOnScroll';
import PhotoGrid from '../cohort-result/PhotoGrid';

// 러닝 기수 누적 성과 — 260504 · 260601 · 260629 · 260727 · 260824_team_run 합산.
// 2026-09-15 DB 집계 (bali/scripts/db.mjs):
//   참가 = cohort_memberships 중복 제외 92명 (기수별 합계 30+36+34+18+25 = 143, 이월 멤버 중복 51)
//   인증률 = daily_missions success/pass 일수 ÷ (참가자 × 21일) = 2,712 / 3,003 = 90.3%
//   거리 = mission_logs run/km (is_test=false) 각 기수 21일 창 합계 = 9,764.5km
// 다음 기수 끝나면 숫자 다시 뽑아서 여기만 갱신.
const STATS = [
  { value: '92', unit: '명', label: <>러닝 5기<br />참가자</> },
  { value: '90', unit: '%', label: <>21일<br />평균 인증률</> },
  { value: '9,764', unit: 'km', label: <>다 같이<br />뛴 거리</> },
];

export default function CumulativeResultsSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">REAL DATA</span>
        <h2 className="font-kr text-[26px] md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight break-keep">
          후기는 누구나 만들지.<br />
          <span className="text-accent-green">우리는 92명 데이터를 공개한다</span>
        </h2>
        <p className="text-text-secondary text-center mb-8 text-sm break-keep">
          2026년 5월부터 러닝 챌린지 5번 · 매번 21일
        </p>
      </AnimateOnScroll>

      <div className="space-y-4">
        <AnimateOnScroll animation="animate-scale-in">
          <div className="grid grid-cols-3 gap-2 max-w-md mx-auto w-full">
            {STATS.map((s) => (
              <div key={s.unit} className="bg-bg-card rounded-2xl p-4 h-full flex flex-col items-center justify-center text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className="text-card-ink text-2xl md:text-3xl font-black tabular-nums leading-none whitespace-nowrap">
                  {s.value}<span className="text-base font-extrabold ml-0.5">{s.unit}</span>
                </p>
                <p className="text-card-ink-muted text-[11px] font-bold mt-2 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll>
          <div className="bg-bg-card rounded-2xl p-5 text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-w-md mx-auto">
            <p className="text-card-ink-muted text-sm leading-relaxed break-keep">
              9,764km면 <span className="text-card-ink font-extrabold">서울 ↔ 부산 11번 왕복</span>이야.<br />
              한 명씩은 하루 10-20분이었어.
            </p>
          </div>
        </AnimateOnScroll>

        <PhotoGrid />
      </div>

      <p className="text-text-muted text-[11px] mt-6 text-center leading-relaxed">
        * 1000runclub 앱 인증 로그 집계. 멤버 이름은 익명 처리.
      </p>
    </section>
  );
}
