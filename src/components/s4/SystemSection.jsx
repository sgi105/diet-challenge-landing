import AnimateOnScroll from '../ui/AnimateOnScroll';
import { WEEKS4, PROGRAM4 } from '../../data/season4';

const pillars = [
  {
    icon: '🔒',
    title: '채찍 — 강제성',
    desc: '매일 인증 안 하면 보증금 깎여. 5명 1팀 — 한 명만 빠져도 팀 전체가 흔들려. 못 빠진다.',
  },
  {
    icon: '🥕',
    title: '당근 — 보상',
    desc: '팀끼리 실시간 순위 경쟁. 매일 쌓이는 점수가 눈에 보이니까 계속 뛰게 돼.',
  },
  {
    icon: '📈',
    title: '점진적 — 지속 가능',
    desc: `Day 1은 딱 ${PROGRAM4.startMinutes}분. 하루 1분씩만 늘려서 Day ${PROGRAM4.peakDay}에 ${PROGRAM4.peakMinutes}분. 힘 안 들게 늘려서 끝까지 간다.`,
  },
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
          의지가 아니야. <span className="text-text-primary font-bold">채찍 · 당근 · 점진적</span> — 지속 가능하게 만드는 단 3가지.
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
          {WEEKS4.map((w, i) => (
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

      {/* 러닝 시간표 — 10분에서 20분까지 어떻게 올라가는지 한눈에 */}
      <AnimateOnScroll className="mt-8">
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-4">DAILY MINUTES</p>
          <div className="flex items-end gap-[3px] h-24 mb-3">
            {Array.from({ length: 21 }, (_, i) => {
              const min = Math.min(PROGRAM4.startMinutes + i, PROGRAM4.peakMinutes);
              const isFinal = i === 20;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-[3px] ${isFinal ? 'bg-accent-orange' : 'bg-accent-green'}`}
                  style={{ height: `${(min / PROGRAM4.peakMinutes) * 100}%` }}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-card-ink-muted text-[11px] font-bold">
            <span>Day 1 · {PROGRAM4.startMinutes}분</span>
            <span>Day {PROGRAM4.peakDay} · {PROGRAM4.peakMinutes}분</span>
            <span className="text-accent-orange">Day 21 · 5K</span>
          </div>
          <p className="text-card-ink-muted text-sm leading-relaxed mt-4 break-keep">
            첫날은 {PROGRAM4.startMinutes}분만 뛰면 돼. 하루 1분씩 늘어서 Day {PROGRAM4.peakDay}에 {PROGRAM4.peakMinutes}분,
            거기서부터는 계속 {PROGRAM4.peakMinutes}분 유지야. 마지막 날은 다 같이 5K 파이널 레이스.
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
