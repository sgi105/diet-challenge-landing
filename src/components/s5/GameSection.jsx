import AnimateOnScroll from '../ui/AnimateOnScroll';

// 러닝을 게임으로: 팀·경쟁·보상 + 증거 + 후기 3축.
const pillars = [
  { icon: '👥', tag: '팀', title: '5인 1팀', desc: '매일 서로의 인증을 보고 댓글·응원. 혼자가 아니라 같이 뛴다.' },
  { icon: '📊', tag: '경쟁', title: '6팀 실시간 대항전', desc: '러닝할 때마다 팀 점수가 쌓이고, 6팀이 실시간으로 순위 경쟁.' },
  { icon: '🏆', tag: '보상', title: '1등 팀 상금 10만원', desc: '21일 경쟁 끝, 최종 1등 팀이 팀 상금 10만원을 가져간다. 팀 전체 금액을 5명이 나눈다.' },
];

export default function GameSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">THE GAME</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          축구는 재밌는데<br /><span className="text-accent-green">러닝은 왜 노잼?</span>
        </h2>
        <p className="text-text-secondary text-center mb-8 leading-relaxed break-keep">
          둘 다 똑같이 뛰는데. 차이는 딱 하나 — <span className="text-text-primary font-bold">축구는 게임이거든.</span>
          <br />팀·경쟁·보상. 그래서 러닝도 게임으로 만들었어.
        </p>
      </AnimateOnScroll>

      <div className="space-y-4 mb-8">
        {pillars.map((p, i) => (
          <AnimateOnScroll key={i} delay={i * 0.1}>
            <div className="bg-bg-card rounded-3xl p-6 flex items-start gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
              <span className="text-4xl shrink-0 leading-none">{p.icon}</span>
              <div className="min-w-0">
                <span className="text-bg-primary text-[11px] font-extrabold tracking-widest">{p.tag}</span>
                <h3 className="font-bold text-card-ink text-base leading-tight mt-0.5">{p.title}</h3>
                <p className="text-card-ink-muted text-sm leading-relaxed mt-1">{p.desc}</p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      {/* 증거 한 줄 — 상세 수치(92명·90%·누적 거리)와 후기는 아래 REAL DATA·REAL VOICES 섹션 담당. */}
      <AnimateOnScroll>
        <div className="bg-accent-green rounded-3xl p-6 text-center shadow-[0_12px_40px_rgba(200,255,77,0.3)]">
          <p className="text-bg-primary/70 text-[11px] font-extrabold tracking-widest mb-1">PROOF</p>
          <p className="text-bg-primary font-black text-2xl leading-tight break-keep">
            게임으로 만드니까<br />인증률 90%
          </p>
          <p className="text-bg-primary/80 text-sm mt-2 break-keep">
            혼자 시작하면 80%가 중간에 포기해.<br />팀·경쟁·보상이 붙으면 얘기가 달라져.
          </p>
        </div>
      </AnimateOnScroll>
    </section>
  );
}
