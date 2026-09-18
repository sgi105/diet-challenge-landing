import AnimateOnScroll from '../ui/AnimateOnScroll';

// v2 레벨 맞춤 — 시안 SOT: design-references/s5v2-levels-5.html B (흰 표 한 장)
// v1(sections/StartingPointsSection)은 "러닝 처음·복귀·기록 갱신" 카드 3개 + "초보·중간·상위" 카드 3개로
// 같은 분류를 두 번 말해서 세로 1,047px였다. 그룹 한 줄에 "누구"를 합쳐 한 장으로 줄였다.
// 초보는 "걷뛰로 시작"(가인 2026-09-19). 페이스 구간·나머지 설명은 v1 값 그대로.
const GROUPS = [
  { label: '초보', who: '러닝 처음', note: '걷뛰로 시작', range: `7'00"/km 이상`, dot: 'bg-accent-green ring-2 ring-inset ring-card-ink' },
  { label: '중간', who: '다시 시작', note: '지구력 + 페이스 빌드업', range: `5'00"-7'00"/km`, dot: 'bg-amber-400' },
  { label: '상위', who: '기록 갱신', note: 'PB 도전', range: `5'00"/km 미만`, dot: 'bg-card-ink' },
];

export default function LevelsSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-3 text-text-primary leading-tight break-keep">
          1km도 못 뛰어도 OK<br />
          <span className="text-accent-green">레벨 맞춤 프로그램</span>
        </h2>
        <p className="text-text-secondary text-center mb-7 break-keep">
          지원할 때 레벨 테스트로<br />출발점에 맞는 프로그램이 나가.
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-bg-card rounded-2xl px-4 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
          {GROUPS.map((g, i) => (
            <div key={g.label} className={`flex items-center gap-3 py-3 ${i ? 'border-t border-slate-200' : ''}`}>
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${g.dot}`} />
              <div className="flex-1 min-w-0">
                <p className="text-card-ink text-[15px] font-black">
                  {g.label} <span className="text-card-ink-faint text-xs font-bold">{g.who}</span>
                </p>
                <p className="text-card-ink-muted text-[12.5px] font-semibold">{g.note}</p>
              </div>
              <p className="text-card-ink-muted text-[12.5px] font-extrabold whitespace-nowrap tabular-nums">{g.range}</p>
            </div>
          ))}
        </div>
      </AnimateOnScroll>
    </section>
  );
}
