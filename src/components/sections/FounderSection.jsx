import AnimateOnScroll from '../ui/AnimateOnScroll';

const milestones = [
  { num: '-10kg', desc: '본인 감량' },
  { num: '116명', desc: '바디프로필 달성' },
  { num: '9기수', desc: '챌린지 운영' },
  { num: '844+', desc: '커뮤니티 멤버' },
];

export default function FounderSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="text-accent-orange text-sm font-semibold">만든 사람</span>
        <h2 className="text-2xl md:text-4xl font-extrabold mt-2 mb-6">
          저도 "만년 다이어터"였습니다.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="bg-bg-card rounded-2xl p-6 border border-border">
          <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
            <p>
              운동도 해봤고, 식단도 해봤고, 유튜브에서 본 건 다 따라 해봤습니다.
              <br />
              <span className="text-text-primary font-semibold">많이 하면 잘해진다는 건 아는데, 맨날 까먹었습니다.</span>
              <br />
              많이 안 하고 잘하고 싶어했습니다.
            </p>
            <p>
              그러다 깨달은 게 하나 있습니다.
              <br />
              <span className="text-accent-green font-semibold">"무언가 걸려야 움직인다."</span>
            </p>
            <p>
              돈을 걸었더니 새벽 5시에 일어나게 됐습니다.
              <br />
              사람들과 함께 하니까 포기가 안 됐습니다.
              <br />
              <span className="text-text-muted">한 명도 포기하지 않고 모두가 올 수 있었던 건, 서로가 있었기 때문입니다.</span>
            </p>
            <p className="text-text-primary">
              결과요?
            </p>
            <p>
              <span className="font-semibold text-text-primary">10kg 감량.</span> 바디프로필 촬영.
              <br />
              100km 마라톤 완주. 스파르탄 레이스 완주.
              <br />
              2025 인천 HYROX <span className="text-accent-green font-semibold">버피 구간 전체 1등.</span>
              <br />
              지금 이 순간에도 111일째 매일 뛰고 있습니다.
            </p>

            <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-2" style={{ scrollbarWidth: 'none' }}>
              {[
                { src: '/founder/bodyprofile0.webp', label: '바디프로필' },
                { src: '/founder/marathon.png', label: '100K 마라톤' },
                { src: '/founder/hyrox_photo.webp', label: 'HYROX' },
                { src: '/founder/hyrox_rank.webp', label: '버피 1등' },
              ].map((img, i) => (
                <div key={i} className="shrink-0 w-28 rounded-xl overflow-hidden relative">
                  <img src={img.src} alt={img.label} className="w-full aspect-[3/4] object-cover object-top" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <p className="absolute bottom-1.5 left-2 text-white text-[10px] font-semibold">{img.label}</p>
                </div>
              ))}
            </div>
            <p className="text-text-primary font-semibold">
              이 경험을 9기수, 116명에게 전달했고
              <br />
              그들도 바디프로필을 찍었습니다.
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Stats */}
      <AnimateOnScroll className="mt-6">
        <div className="grid grid-cols-4 gap-3">
          {milestones.map((m, i) => (
            <div key={i} className="bg-bg-card rounded-xl p-3 text-center border border-border">
              <p className="text-accent-green font-extrabold text-lg">{m.num}</p>
              <p className="text-text-muted text-xs mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      {/* Instagram link */}
      <AnimateOnScroll className="mt-6">
        <a
          href="https://www.instagram.com/samurai_habit/"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-bg-card rounded-xl p-4 border border-border text-center hover:border-accent-green transition-colors"
        >
          <p className="text-text-secondary text-sm">
            ⚔️ <span className="text-accent-green font-semibold">@samurai_habit</span> 에서 참가자들의 실제 여정을 확인하세요
          </p>
        </a>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-8">
        <p className="text-center leading-relaxed">
          <span className="text-text-secondary">체력 꼴찌도 49일이면 상위권.</span>
          <br />
          <span className="text-text-primary font-bold">같은 구조를 30일짜리로 압축했습니다.</span>
        </p>
      </AnimateOnScroll>
    </section>
  );
}
