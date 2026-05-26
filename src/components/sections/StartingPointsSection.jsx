import AnimateOnScroll from '../ui/AnimateOnScroll';

const STARTING_POINTS = [
  {
    icon: '🌱',
    tag: '러닝 처음',
    desc: '한 번도 안 뛰어본 사람도 OK. 걷기부터 시작',
  },
  {
    icon: '🔄',
    tag: '복귀',
    desc: '예전엔 뛰었는데 쉬었다 다시 시작',
  },
  {
    icon: '🚀',
    tag: '기록 갱신',
    desc: '지금도 뛰고 있는데 페이스 더 올리고 싶어',
  },
];

const PACE_GROUPS = [
  {
    range: '7\'00"/km 이상',
    label: '초보 그룹',
    note: '걷기 + 인터벌부터',
    color: 'bg-accent-green/10 border-accent-green',
  },
  {
    range: '5\'00" ~ 7\'00"/km',
    label: '중간 그룹',
    note: '지구력 + 페이스 빌드업',
    color: 'bg-amber-400/10 border-amber-400',
  },
  {
    range: '5\'00"/km 미만',
    label: '상위 그룹',
    note: 'PB 도전',
    color: 'bg-white/10 border-white',
  },
];

export default function StartingPointsSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">FOR ALL LEVELS</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          1km도 못 뛰어도 OK<br />
          <span className="text-accent-green">레벨 맞춤 프로그램</span>
        </h2>
        <p className="text-text-secondary text-center mb-8">
          지원할 때 레벨 테스트로<br />본인 출발점에 맞는 프로그램이 나가.
        </p>
      </AnimateOnScroll>

      <div className="max-w-sm mx-auto space-y-3">
        {STARTING_POINTS.map((item, i) => (
          <AnimateOnScroll key={item.tag} animation="animate-slide-in-left" delay={i * 0.1}>
            <div className="bg-bg-card rounded-2xl px-5 py-4 flex items-center gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
              <span className="text-3xl shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-card-ink font-extrabold text-base">{item.tag}</p>
                <p className="text-card-ink-muted text-sm leading-relaxed mt-0.5">{item.desc}</p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      <AnimateOnScroll>
        <p className="text-text-secondary text-sm font-bold mt-10 mb-4 text-center">
          📊 페이스로 그룹 매칭
        </p>
      </AnimateOnScroll>

      <div className="max-w-sm mx-auto space-y-3">
        {PACE_GROUPS.map((group, i) => (
          <AnimateOnScroll key={group.label} animation="animate-scale-in" delay={i * 0.08}>
            <div className={`rounded-2xl px-5 py-4 border-2 ${group.color} flex items-center justify-between gap-3`}>
              <div className="min-w-0">
                <p className="text-text-primary font-extrabold text-base">{group.label}</p>
                <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">{group.note}</p>
              </div>
              <p className="text-text-primary text-sm font-bold tabular-nums whitespace-nowrap shrink-0">{group.range}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      <AnimateOnScroll>
        <div className="max-w-sm mx-auto mt-8 bg-bg-card rounded-2xl p-5 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
          <p className="text-card-ink-muted text-sm leading-relaxed text-center">
            걱정 마. <span className="text-card-ink font-bold">맞춤 프로그램</span>이 나가.<br />
            <span className="text-card-ink-faint text-xs mt-2 block">
              직전 시즌0도 1km 못 뛰던 사람 → 5K 완주 100% 성공
            </span>
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
