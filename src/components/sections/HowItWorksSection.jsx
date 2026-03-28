import AnimateOnScroll from '../ui/AnimateOnScroll';

const steps = [
  { num: 1, title: '신청 & 예치', desc: '20만원 결제하면 자동 등록', circleClass: 'bg-accent-green' },
  { num: 2, title: '팀 매칭 & OT 세션', desc: '3인 1팀 배정 + 식단 방법론 안내', circleClass: 'bg-accent-green' },
  { num: 3, title: '30일 미션 수행', desc: '매일 러닝 인증 + 식단 사진 + 체중 기록', circleClass: 'bg-accent-green' },
  { num: 4, title: '정산', desc: '나만 성공: 20만원 / 팀 전원: 25만원 / 팀 1등: 30만원 / 실패: 전액 몰수', circleClass: 'bg-accent-orange' },
];

export default function HowItWorksSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="text-accent-green text-sm font-semibold">참여 방법</span>
        <h2 className="text-2xl md:text-4xl font-extrabold mt-2 mb-8">
          4단계로 끝. 심플합니다.
        </h2>
      </AnimateOnScroll>


      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-8">
          {steps.map((step, i) => (
            <AnimateOnScroll key={i} delay={i * 0.15}>
              <div className="flex items-start gap-5 relative">
                <div className={`w-10 h-10 rounded-full ${step.circleClass} text-bg-primary font-bold flex items-center justify-center text-sm shrink-0 z-10`}>
                  {step.num}
                </div>
                <div className="bg-bg-card rounded-xl p-5 flex-1">
                  <h3 className="font-bold text-text-primary mb-1">{step.title}</h3>
                  <p className="text-text-secondary text-sm">{step.desc}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
