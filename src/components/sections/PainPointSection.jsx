import AnimateOnScroll from '../ui/AnimateOnScroll';

const painPoints = [
  { icon: '🪑', text: '퇴근하면 소파에 눕는 게 전부인 하루' },
  { icon: '🍺', text: '회식 거절 못 해서 다이어트 매번 리셋' },
  { icon: '📱', text: '운동 영상 저장만 100개. 실천은 0개.' },
  { icon: '💸', text: '헬스장 3개월 끊고 3번 감. 환불도 못 받음.' },
  { icon: '🔄', text: '"이번엔 진짜 해야지" — 벌써 몇 번째?' },
];

export default function PainPointSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="text-accent-orange text-sm font-semibold">솔직하게 말해봅시다</span>
        <h2 className="text-2xl md:text-4xl font-extrabold mt-2 mb-4">
          의지력으로 된 적 있습니까?
        </h2>
        <p className="text-text-secondary mb-8">
          안 됐죠. 저도 그랬습니다.
        </p>
      </AnimateOnScroll>

      <div className="space-y-4">
        {painPoints.map((item, i) => (
          <AnimateOnScroll key={i} animation="animate-slide-in-left" delay={i * 0.1}>
            <div className="bg-bg-card border-l-4 border-accent-orange rounded-lg p-5 flex items-start gap-4">
              <span className="text-2xl shrink-0">{item.icon}</span>
              <p className="text-text-secondary leading-relaxed">{item.text}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      <AnimateOnScroll className="mt-10">
        <p className="text-text-secondary leading-relaxed mb-2">
          다이어트가 안 되는 이유는 의지가 약해서가 아닙니다.
        </p>
        <p className="text-accent-green font-bold text-xl leading-relaxed">
          '잃을 것'이 없었기 때문입니다.
        </p>
      </AnimateOnScroll>
    </section>
  );
}
