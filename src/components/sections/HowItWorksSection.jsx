import AnimateOnScroll from '../ui/AnimateOnScroll';

const steps = [
  { num: 1, title: '지원 (5/25~5/28)', desc: '8문항 지원서 작성. 약 2분 소요. 5/28(목) 24:00 마감.' },
  { num: 2, title: '선발 (5/29 금)', desc: '30명 합격 발표 — 5/29(금) 12:00 인스타 단톡방 안내. 입금 마감 5/29(금) 24:00.' },
  { num: 3, title: '온라인 OT (5/31 일)', desc: '줌 오리엔테이션 16:00-16:30 + 3인 1팀 매칭. 러닝 가이드.' },
  { num: 4, title: '챌린지 (6/1~6/21)', desc: '21일 매일 러닝 인증. 팀원과 댓글 응원.' },
  { num: 5, title: '5K 파이널 (6/21 일)', desc: '30명 동시 5km 완주. 팀 성과별 환급 정산.', highlight: true },
];

export default function HowItWorksSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green">HOW IT WORKS</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black mt-4 mb-8 text-text-primary leading-tight">
          5단계로 끝.<br />심플해.
        </h2>
      </AnimateOnScroll>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/15" />

        <div className="space-y-5">
          {steps.map((step, i) => (
            <AnimateOnScroll key={i} delay={i * 0.12}>
              <div className="flex items-start gap-5 relative">
                <div className={`w-12 h-12 rounded-full font-extrabold flex items-center justify-center text-base shrink-0 z-10 shadow-[0_8px_24px_rgba(0,0,0,0.2)] ${
                  step.highlight
                    ? 'bg-accent-green text-bg-primary'
                    : 'bg-white text-bg-primary'
                }`}>
                  {step.num}
                </div>
                <div className="bg-bg-card rounded-2xl p-5 flex-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                  <h3 className="font-bold text-card-ink mb-1 text-base">{step.title}</h3>
                  <p className="text-card-ink-muted text-sm">{step.desc}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
