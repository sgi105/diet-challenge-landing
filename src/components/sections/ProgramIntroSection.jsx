import AnimateOnScroll from '../ui/AnimateOnScroll';

const features = [
  {
    icon: '💰',
    title: '20만원이 걸려있다',
    desc: '실패하면 전액 몰수. 이 압박감이 새벽 알람도 끄지 못하게 만듭니다.',
  },
  {
    icon: '🏃',
    title: '매일 3가지 미션',
    desc: '러닝 인증 + 식단 사진 + 체중 기록. 심플하지만, 매일 해야 합니다.',
  },
  {
    icon: '⚔️',
    title: '3인 1팀 — 팀이 있으면 포기가 안 된다',
    desc: '팀 사진 찍는데 나만 몸이 안 좋으면 민폐. 그 압박이 의지력보다 강합니다.',
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
          혼자 못 하는 다이어트를<br />팀으로 강제로 합니다.
        </h2>
        <p className="text-text-secondary mb-8">
          돈 + 팀. 의지력 대신 구조로 움직이게 만듭니다.
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
            🔥 챌린지 성공 후 <span className="text-text-secondary">장기 코칭 (10주)</span>으로 이어갈 수 있습니다.
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
