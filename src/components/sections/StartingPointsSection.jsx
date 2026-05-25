import AnimateOnScroll from '../ui/AnimateOnScroll';

const points = [
  { tag: '처음', goal: '생애 첫 5km 완주' },
  { tag: '복귀', goal: '다시 러너로' },
  { tag: '감량', goal: '21일 -2kg' },
  { tag: '대회', goal: '기록 향상' },
];

export default function StartingPointsSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green">YOUR GOAL</span>
        <h2 className="font-kr text-3xl md:text-5xl mt-4 mb-3 text-text-primary">
          출발점은 달라도,<br />
          <span className="text-accent-green">같은 21일.</span>
        </h2>
        <p className="text-text-secondary mb-8">
          어디서 시작하든, 팀이 끝까지 같이 가.
        </p>
      </AnimateOnScroll>

      <div className="space-y-3">
        {points.map((item, i) => (
          <AnimateOnScroll key={item.tag} delay={i * 0.1}>
            <div className="bg-bg-card rounded-3xl px-5 py-4 flex items-center gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <span className="text-[11px] font-extrabold tracking-widest bg-accent-green text-bg-primary px-3 py-1.5 rounded-full shrink-0">
                {item.tag}
              </span>
              <span className="text-card-ink font-bold flex-1">→ {item.goal}</span>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
