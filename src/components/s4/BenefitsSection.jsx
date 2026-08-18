import AnimateOnScroll from '../ui/AnimateOnScroll';

// 시즌2의 "오늘 신청 보너스 PDF" 자리를 시즌4에서는 21일 뒤 결과(아웃컴)로 교체.
// TODO 시즌4 한정 보너스(가이드 PDF 등) 붙이면 여기에 마감 카운트다운 카드 추가
const outcomes = [
  {
    icon: '🏃',
    title: '5K를 뛸 수 있는 몸',
    desc: '1km도 못 뛰던 사람이 21일이면 5km를 뛰어. 하루 10분에서 시작해서 천천히 올라가니까 무리도 안 가.',
  },
  {
    icon: '🔁',
    title: '21일짜리 연속 기록',
    desc: '작심삼일에서 21일. 한 번 끊기지 않고 쌓아본 사람은 그다음이 쉬워져. 이게 진짜 남는 거야.',
  },
  {
    icon: '👥',
    title: '같이 뛰는 팀원 4명',
    desc: '매일 인증 보고 응원하는 5인 1팀. 21일 끝나도 계속 연락하는 사람들이 생겨.',
  },
  {
    icon: '💰',
    title: '보증금 20만원 그대로',
    desc: '미션 90% 채우고 파이널 완주하면 전액 환급. 결국 돈 한 푼 안 들이고 몸만 바뀌는 거야.',
  },
];

export default function BenefitsSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center mb-3">
          <span className="pill text-accent-green">AFTER 21 DAYS</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-3 text-text-primary leading-tight">
          9월 13일,<br /><span className="text-accent-green">뭐가 남을까</span>
        </h2>
        <p className="text-text-secondary text-center text-sm mb-8 font-semibold break-keep">
          21일 뒤에 네가 들고 가는 것 4가지
        </p>
      </AnimateOnScroll>

      <div className="space-y-4">
        {outcomes.map((o, i) => (
          <AnimateOnScroll key={i} delay={i * 0.08}>
            <div className="bg-bg-card rounded-3xl p-6 flex items-start gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
              <span className="text-4xl shrink-0 leading-none">{o.icon}</span>
              <div className="min-w-0">
                <h3 className="font-bold text-card-ink text-base leading-tight">{o.title}</h3>
                <p className="text-card-ink-muted text-sm leading-relaxed mt-1.5 break-keep">{o.desc}</p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
