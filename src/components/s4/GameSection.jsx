import AnimateOnScroll from '../ui/AnimateOnScroll';

// 러닝을 게임으로: 팀·경쟁·보상 + 증거 + 후기 3축.
// TODO 시즌4 1등 팀 상품 미확정 — 확정되면 '보상' pillar의 title/desc를 실제 상품으로 교체
const pillars = [
  { icon: '👥', tag: '팀', title: '5인 1팀', desc: '매일 서로의 인증을 보고 댓글·응원. 혼자가 아니라 같이 뛴다.' },
  { icon: '📊', tag: '경쟁', title: '6팀 실시간 대항전', desc: '러닝할 때마다 팀 점수가 쌓이고, 6팀이 실시간으로 순위 경쟁.' },
  { icon: '🏆', tag: '보상', title: '1등 팀 특전', desc: '21일 경쟁 끝, 최종 1등 팀에게 주는 특전은 모집 중에 공개할게.' },
];

const voices = [
  { axis: '몸', q: '한 번도 안 뛰다가 처음으로 5km를 뛰었어요' },
  { axis: '재미', q: '그렇게 싫어하던 러닝인데, 이제 뛰러 나가는 시간이 기다려져요' },
  { axis: '자신감', q: '내가 이걸 하게 될 줄 몰랐어요. 나도 할 수 있구나' },
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

      {/* 증거 — 게임으로 만드니까 성공률이 다르다 */}
      <AnimateOnScroll>
        <div className="bg-accent-green rounded-3xl p-6 text-center shadow-[0_12px_40px_rgba(200,255,77,0.3)]">
          <p className="text-bg-primary/70 text-[11px] font-extrabold tracking-widest mb-1">PROOF</p>
          <p className="text-bg-primary font-black text-2xl leading-tight">2시즌 60명 · 완주율 95%</p>
          <p className="text-bg-primary/80 text-sm mt-2 break-keep">새 운동 습관 성공률은 평균 10%. 게임으로 만드니까 95%가 끝까지 갔어.</p>
        </div>
      </AnimateOnScroll>

      {/* 후기 3축 — 몸 / 재미 / 자신감 */}
      <div className="mt-6 space-y-3">
        {voices.map((t, i) => (
          <AnimateOnScroll key={i} delay={i * 0.08}>
            <div className="bg-bg-card rounded-2xl px-5 py-4 flex items-start gap-3 shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
              <span className="text-bg-primary text-[11px] font-extrabold tracking-widest shrink-0 w-10 pt-1">{t.axis}</span>
              <p className="text-card-ink-muted text-sm leading-relaxed">&ldquo;{t.q}&rdquo;</p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>
    </section>
  );
}
