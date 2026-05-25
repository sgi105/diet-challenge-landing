import AnimateOnScroll from '../ui/AnimateOnScroll';

const features = [
  {
    icon: '🌐',
    title: '세계 최초 온라인 런클럽',
    desc: '오프라인 모임 0회. 집 앞 골목, 회사 옥상, 호텔 헬스장 어디서 뛰어도 OK. 앱 인증 + 댓글 응원으로 함께 뛰어.',
  },
  {
    icon: '👥',
    title: '3인 1팀 × 10팀 게임',
    desc: '팀원이 오늘도 뛰었는데 나만 빠질 순 없어. 직전 시즌0 30명 중 30명 전원 21일 완주 성공. 의지력보다 강한 건 팀이야.',
  },
  {
    icon: '💸',
    title: '100% 환급 시스템',
    desc: '20만원 보증금. 21일 매일 러닝 인증 90% 완료하면 전액 환급. 실패하면 몰수 → 우승팀 상금 풀로.',
  },
  {
    icon: '🏆',
    title: '총 보너스 풀 105만원',
    desc: '우승팀(3명)은 1인당 20만원 환급 + 러닝화. 팀 전원 성공만 해도 +2만 보너스.',
  },
];

export default function ProgramIntroSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green">WHY IT WORKS</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black mt-4 mb-4 text-text-primary leading-tight">
          혼자 못 하는 러닝을<br />팀으로 강제로.
        </h2>
        <p className="text-text-secondary mb-8">
          돈 + 팀 + 게임. 의지력 대신 구조로 움직이게.
        </p>
      </AnimateOnScroll>

      <div className="space-y-4">
        {features.map((item, i) => (
          <AnimateOnScroll key={i} delay={i * 0.1}>
            <div className="bg-bg-card rounded-3xl p-6 flex items-start gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
              <span className="text-3xl shrink-0">{item.icon}</span>
              <div>
                <h3 className="font-bold text-card-ink mb-1.5 text-base">{item.title}</h3>
                <p className="text-card-ink-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
