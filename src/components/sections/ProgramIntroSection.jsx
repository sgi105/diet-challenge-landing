import AnimateOnScroll from '../ui/AnimateOnScroll';

const features = [
  {
    icon: '💰',
    title: '20만원이 걸려있다',
    desc: '실패하면 전액 몰수. 이 압박감이 새벽 알람도 끄지 못하게 만듭니다.',
  },
  {
    icon: '📈',
    title: '매일 레벨업하는 미션',
    desc: '같은 운동 반복이 아닙니다. 매일 새로운 미션이 앱으로 제공되고, 난이도가 올라갑니다.',
  },
  {
    icon: '⚔️',
    title: '30명이 온라인에서 함께 싸운다',
    desc: '혼자 하면 포기합니다. 같은 돈을 건 사람들과 매일 온라인으로 인증하고, 경쟁하고, 밀어줍니다.',
  },
  {
    icon: '🎓',
    title: 'OT에서 식단 원리를 알려드립니다',
    desc: '칼로리 계산 없는 실전 식단법. 회식 다음날에도 쓸 수 있는 방법론.',
  },
];

export default function ProgramIntroSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="text-accent-green text-sm font-semibold">왜 이건 되는가</span>
        <h2 className="text-2xl md:text-4xl font-extrabold mt-2 mb-4">
          돈이 걸리면, 몸이 달라집니다.
        </h2>
        <p className="text-text-secondary mb-8">
          의지력 대신 구조로 움직이게 만듭니다.
        </p>
      </AnimateOnScroll>

      <div className="space-y-5">
        {features.map((item, i) => (
          <AnimateOnScroll key={i} delay={i * 0.1}>
            <div className="bg-bg-card rounded-xl p-5 flex items-start gap-4">
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-bold text-text-primary mb-1">{item.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      <AnimateOnScroll className="mt-8">
        <div className="border border-border rounded-xl p-4 text-center">
          <p className="text-text-muted text-sm">
            🔥 <span className="text-text-secondary">1:1 프리미엄 식단 코칭</span> 옵션도 별도로 제공됩니다.
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
