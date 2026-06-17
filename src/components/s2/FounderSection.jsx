import AnimateOnScroll from '../ui/AnimateOnScroll';

const RUN_START_DATE = new Date('2025-11-17');
function getRunningDays() {
  const today = new Date();
  const diff = today - RUN_START_DATE;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export default function FounderSection() {
  const runningDays = getRunningDays();
  const milestones = [
    { num: '풀마라톤', desc: '완주' },
    { num: '100km', desc: '울트라' },
    { num: `${runningDays}일`, desc: '연속 러닝' },
    { num: '9기수', desc: '116명 운영' },
  ];

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green">FOUNDER</span>
        <h2 className="text-3xl md:text-5xl font-extrabold mt-4 mb-6 text-text-primary leading-tight">
          나도 1km부터<br />시작했어.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-3xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
          <div className="space-y-4 text-card-ink-muted leading-relaxed text-sm">
            <p>
              <span className="text-card-ink font-bold">나도 10년째 운동을 꾸준히 못했어.</span>
              <br />
              "이번엔 진짜!!!" 하고 바로 작심삼일.
              <br />
              내 자신에게 또 실망하고.
              <br />
              나중엔 결국 시도도 안 하고.
            </p>
            <p>
              그러다 깨달은 게 <span className="text-card-ink font-bold">세 가지</span>야.
            </p>
            <p>
              <span className="text-bg-primary font-bold">1. 돈이 걸려야 제대로 한다.</span>
              <br />
              <span className="text-bg-primary font-bold">2. 같이 해야 재밌다.</span>
              <br />
              <span className="text-bg-primary font-bold">3. 무리하면 작심삼일. 천천히 늘려야 오래 간다.</span>
            </p>
            <p>
              이 세 개를 시스템으로 만든 게 챌린지야.
              <br />
              <span className="text-card-ink font-bold">채찍 + 당근 + 점진적.</span>
            </p>
            <p className="text-card-ink font-semibold">
              작심삼일이 100일, 200일이 되더라.
            </p>
            <p className="text-card-ink font-semibold">
              결과?
            </p>
            <p>
              풀마라톤 완주.
              <br />
              100km 울트라마라톤 완주.
              <br />
              2025 인천 HYROX <span className="text-bg-primary font-bold">버피 구간 전체 1등.</span>
              <br />
              지금 이 순간에도 <span className="text-bg-primary font-bold">{runningDays}일째</span> 매일 뛰고 있어.
            </p>

            <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-2" style={{ scrollbarWidth: 'none' }}>
              {[
                { src: '/founder/marathon.png', label: '100K 울트라' },
                { src: '/founder/hyrox.jpg', label: 'HYROX' },
                { src: '/founder/hyrox_rank.png', label: '버피 1등' },
                { src: '/founder/bodyprofile0.webp', label: '바디프로필' },
              ].map((img, i) => (
                <div key={i} className="shrink-0 w-28 rounded-2xl overflow-hidden relative">
                  <img src={img.src} alt={img.label} className="w-full aspect-square object-cover object-top" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-1.5 left-2 text-white text-[10px] font-semibold">{img.label}</p>
                </div>
              ))}
            </div>
            <p className="text-card-ink font-bold">
              그 경험을 21일짜리로 압축한 게 바로 런클럽 챌린지야.
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Stats */}
      <AnimateOnScroll className="mt-6">
        <div className="grid grid-cols-4 gap-3">
          {milestones.map((m, i) => {
            const koreanCount = (m.num.match(/[가-힯]/g) || []).length;
            const sizeClass = koreanCount >= 4 ? 'text-sm' : 'text-base';
            return (
              <div key={i} className="bg-bg-card rounded-2xl p-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <p className={`text-bg-primary font-extrabold whitespace-nowrap leading-tight ${sizeClass}`}>{m.num}</p>
                <p className="text-card-ink-faint text-[10px] mt-1 font-semibold">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </AnimateOnScroll>

      {/* Instagram link */}
      <AnimateOnScroll className="mt-6">
        <a
          href="https://www.instagram.com/samurai_habit/"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-bg-card rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:translate-y-[-2px] transition-transform"
        >
          <p className="text-card-ink-muted text-sm">
            ⚔️ <span className="text-bg-primary font-bold">@samurai_habit</span> 에서 실제 여정 확인
          </p>
        </a>
      </AnimateOnScroll>
    </section>
  );
}
