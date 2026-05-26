import AnimateOnScroll from '../ui/AnimateOnScroll';

const pillars = [
  {
    icon: '🔒',
    title: '강제성',
    desc: '매일 인증 안 하면 보증금 깎임. 의지 X, 시스템 O.',
  },
  {
    icon: '👥',
    title: '팀 책임감',
    desc: '3명 1팀. 한 명 빠지면 팀 보너스 소멸. 못 빠진다.',
  },
  {
    icon: '🏃',
    title: '점진적 빌드업',
    desc: 'Day1 1km부터 → Day21 5K 완주. 하루 최대 20분.',
  },
];

const weeks = [
  { label: 'Week 1', title: '적응', desc: '1-2km 걷기+뛰기' },
  { label: 'Week 2', title: '빌드업', desc: '3km 연속 달리기' },
  { label: 'Week 3', title: '5K 파이널', desc: '5km 완주', highlight: true },
];

export default function SystemSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green">THE SYSTEM</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black mt-4 mb-4 text-text-primary leading-tight">
          지난 기수 30명 전원을<br />
          <span className="text-accent-green">성공하게 만든 시스템</span>
        </h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          의지가 아니야. 강제성 + 팀 + 보상 환경에 들어가면 누구나 한다.
        </p>
      </AnimateOnScroll>

      <div className="space-y-4 mb-10">
        {pillars.map((p, i) => (
          <AnimateOnScroll key={i} delay={i * 0.1}>
            <div className="bg-bg-card rounded-3xl p-6 flex items-start gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
              <span className="text-4xl shrink-0 leading-none">{p.icon}</span>
              <div>
                <h3 className="font-bold text-card-ink mb-1.5 text-base">{p.title}</h3>
                <p className="text-card-ink-muted text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      <AnimateOnScroll>
        <p className="text-text-muted text-xs font-bold tracking-widest mb-3">
          21일 흐름
        </p>
        <div className="space-y-2">
          {weeks.map((w, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ${
                w.highlight
                  ? 'bg-accent-green text-bg-primary'
                  : 'bg-bg-card text-card-ink'
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
    </section>
  );
}
