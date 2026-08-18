import AnimateOnScroll from '../ui/AnimateOnScroll';

// 시즌2 원본 fork — 팀 인원(4인 → 5인 1팀)만 시즌4 스펙으로 교체.
// TODO 시즌4 카피 확정 대기: "9기 116명" 누적 수치는 시즌2 시점 기준. 최신 기수 수 확정되면 갱신.
const photos = [
  { src: '/instagram/1.jpg', caption: 'SIX WEEKS CHALLENGE' },
  { src: '/instagram/2.jpg', caption: '바디프로필 단체샷' },
  { src: '/instagram/3.jpg', caption: 'MUSA' },
  { src: '/instagram/4.jpg', caption: '풀파티 단체' },
  { src: '/instagram/5.jpg', caption: '풀파티 드론샷' },
  { src: '/instagram/6.jpg', caption: '풀파티 현장' },
  { src: '/instagram/8.jpg', caption: '풀파티' },
  { src: '/instagram/11.jpg', caption: '단체 바디프로필' },
];

export default function InstagramSection() {
  return (
    <section className="py-14">
      <div className="px-6 max-w-lg mx-auto">
        <AnimateOnScroll>
          <span className="pill text-accent-green">@samurai_habit</span>
          <h2 className="font-kr text-3xl md:text-5xl font-black mt-4 mb-4 text-text-primary leading-tight">
            사람을 매일 움직이는<br />엔진은 똑같아.
          </h2>
          <p className="text-text-secondary mb-8 break-keep leading-relaxed">
            9기 동안 총 <span className="text-text-primary font-bold">116명</span>에게 검증된 구조 — <span className="text-text-primary font-bold">팀 + 경쟁(당근) + 보증금(채찍)</span>.
            <br />
            <span className="text-text-primary font-bold">런클럽 챌린지는 그 엔진을 21일 러닝에 그대로 옮겼어.</span>
          </p>
        </AnimateOnScroll>
      </div>

      <AnimateOnScroll>
        <div
          className="flex gap-3 overflow-x-auto px-6 pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none' }}
        >
          {photos.map((photo, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[70vw] max-w-[280px] rounded-3xl overflow-hidden relative shadow-[0_12px_30px_rgba(0,0,0,0.2)]"
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-bold">
                {photo.caption}
              </p>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      {/* Online distinction */}
      <AnimateOnScroll className="mt-8 px-6 max-w-lg mx-auto">
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_30px_rgba(0,0,0,0.15)]">
          <p className="text-bg-primary font-extrabold text-lg mb-3 font-kr break-keep">
            런클럽 챌린지는 오히려 더 좋아.
          </p>
          <div className="space-y-2 text-sm text-card-ink-muted break-keep leading-relaxed">
            <p>
              <span className="text-card-ink font-bold">100% 온라인</span> — 서울·부산·발리·뉴욕, 어디서든 같이 뛰어
            </p>
            <p>
              <span className="text-card-ink font-bold">시간 자유</span> — 출퇴근 시간 0. 새벽이든 점심이든 가능
            </p>
            <p>
              <span className="text-card-ink font-bold">21일 러닝 · 5인 1팀</span> — 5km 완주 목표, 혼자 못 하는 걸 팀으로 강제
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-4 px-6 max-w-lg mx-auto">
        <a
          href="https://www.instagram.com/samurai_habit/"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-bg-card rounded-2xl p-4 text-center shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:translate-y-[-2px] transition-transform"
        >
          <p className="text-card-ink-muted text-sm">
            이전 기수 기록은 <span className="text-bg-primary font-bold">@samurai_habit</span>
          </p>
        </a>
      </AnimateOnScroll>
    </section>
  );
}
