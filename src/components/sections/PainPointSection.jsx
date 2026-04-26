import AnimateOnScroll from '../ui/AnimateOnScroll';

const painPoints = [
  { icon: '🛏', text: '퇴근하면 침대 직행. 한강은 멀고 무릎은 무겁습니다.' },
  { icon: '📱', text: '러닝 앱만 깔았다. 러닝화는 박스 그대로.' },
  { icon: '⏰', text: '"내일은 진짜 뛰어야지" — 벌써 한 달째.' },
  { icon: '🌧', text: '어제는 비, 그제는 회식. 핑계는 무한 재고.' },
  { icon: '😶', text: '혼자 뛰면 5분 만에 "내가 왜 이걸 하지?" 합니다.' },
];

export default function PainPointSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-orange">REAL TALK</span>
        <h2 className="font-kr text-3xl md:text-5xl mt-4 mb-4 text-text-primary">
          러닝, 의지력으로<br />된 적 있습니까?
        </h2>
        <p className="text-text-secondary mb-8">
          안 됐죠. 저도 그랬습니다.
        </p>
      </AnimateOnScroll>

      <div className="space-y-3">
        {painPoints.map((item, i) => (
          <AnimateOnScroll key={i} animation="animate-slide-in-left" delay={i * 0.1}>
            <div className="bg-bg-card rounded-2xl p-5 flex items-start gap-4 shadow-[0_8px_24px_rgba(0,0,0,0.12)] border-l-[6px] border-accent-orange">
              <span className="text-2xl shrink-0">{item.icon}</span>
              <p className="text-card-ink-muted leading-relaxed font-medium">{item.text}</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      <AnimateOnScroll className="mt-10">
        <p className="text-text-secondary leading-relaxed mb-2">
          러닝이 안 되는 이유는 의지가 약해서가 아닙니다.
        </p>
        <p className="text-text-primary text-2xl font-kr leading-tight">
          '잃을 것'도, '<span className="text-accent-green">같이 뛸 사람</span>'도<br />없었기 때문입니다.
        </p>
      </AnimateOnScroll>
    </section>
  );
}
