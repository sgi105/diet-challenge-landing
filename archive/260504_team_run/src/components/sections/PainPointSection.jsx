import AnimateOnScroll from '../ui/AnimateOnScroll';

const VARIANT_COPY = {
  main: {
    headlineTop: '러닝, 의지력으로',
    painPoints: [
      { icon: '📱', text: '러닝 앱만 깔아두고 한 달. 러닝화는 박스 그대로.' },
      { icon: '🌧', text: '어제는 비, 그제는 회식 — 핑계는 무한 재고.' },
      { icon: '😶', text: '혼자 뛰면 5분 만에 "내가 왜 이걸 하지?" 합니다.' },
    ],
    why: '러닝이 안 되는 이유는 의지가 약해서가 아닙니다.',
    pairLabel: '같이 뛸 사람',
  },
  referral: {
    headlineTop: '운동, 다이어트, 의지력으로',
    painPoints: [
      { icon: '📱', text: '운동 앱만 깔아두고 한 달. 운동복은 옷장 깊숙이.' },
      { icon: '🌧', text: '어제는 회식, 그제는 야근 — 핑계는 무한 재고.' },
      { icon: '😶', text: '혼자 운동하면 5분 만에 "내가 왜 이걸 하지?" 합니다.' },
    ],
    why: '운동·다이어트가 안 되는 이유는 의지가 약해서가 아닙니다.',
    pairLabel: '같이 할 사람',
  },
};

export default function PainPointSection({ variant = 'main' }) {
  const copy = VARIANT_COPY[variant] ?? VARIANT_COPY.main;
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-orange">REAL TALK</span>
        <h2 className="font-kr text-3xl md:text-5xl mt-4 mb-4 text-text-primary">
          {copy.headlineTop}<br />된 적 있습니까?
        </h2>
        <p className="text-text-secondary mb-8">
          안 됐죠. 저도 그랬습니다.
        </p>
      </AnimateOnScroll>

      <div className="space-y-3">
        {copy.painPoints.map((item, i) => (
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
          {copy.why}
        </p>
        <p className="text-text-primary text-2xl font-kr leading-tight">
          '잃을 것'도, '<span className="text-accent-green">{copy.pairLabel}</span>'도<br />없었기 때문입니다.
        </p>
      </AnimateOnScroll>
    </section>
  );
}
