import AnimateOnScroll from '../ui/AnimateOnScroll';

const photos = [
  { src: '/instagram/ig_04.jpg', caption: '무사의습관 7기 풀파티' },
  { src: '/instagram/ig_05.jpg', caption: '챌린지 변화 기록' },
  { src: '/instagram/ig_02.jpg', caption: '단체 바디프로필 촬영' },
  { src: '/instagram/ig_01.jpg', caption: 'SIX WEEKS CHALLENGE' },
  { src: '/instagram/ig_03.jpg', caption: 'MUSA' },
];

export default function InstagramSection() {
  return (
    <section className="py-14">
      <div className="px-6 max-w-lg mx-auto">
        <AnimateOnScroll>
          <span className="text-accent-green text-sm font-semibold">@samurai_habit</span>
          <h2 className="text-2xl md:text-4xl font-extrabold mt-2 mb-4">
            116명이 바디프로필을 찍은
            <br />
            그 노하우.
          </h2>
          <p className="text-text-secondary mb-8">
            9기수의 오프라인 챌린지를 운영하며 쌓은 검증된 시스템을,
            <br />
            <span className="text-text-primary font-semibold">이번엔 100% 온라인 30일 챌린지로 압축했습니다.</span>
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
              className="snap-start shrink-0 w-[70vw] max-w-[280px] rounded-2xl overflow-hidden relative"
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full aspect-[3/4] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-white text-sm font-semibold">
                {photo.caption}
              </p>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      {/* Online distinction */}
      <AnimateOnScroll className="mt-8 px-6 max-w-lg mx-auto">
        <div className="bg-bg-card rounded-2xl p-6 border border-accent-green/30">
          <p className="text-accent-green font-bold text-lg mb-3">
            이번 챌린지는 다릅니다.
          </p>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>
              <span className="text-text-primary font-semibold">100% 온라인</span> — 오프라인 모임 없이 집에서 참여
            </p>
            <p>
              <span className="text-text-primary font-semibold">바디프로필 아님</span> — 30일 5kg 감량에만 집중
            </p>
            <p>
              <span className="text-text-primary font-semibold">참가비 0원</span> — 예치금 20만원, 성공하면 24만원 환급
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-4 px-6 max-w-lg mx-auto">
        <a
          href="https://www.instagram.com/samurai_habit/"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-bg-card rounded-xl p-4 border border-border text-center hover:border-accent-green transition-colors"
        >
          <p className="text-text-secondary text-sm">
            이전 기수 기록이 궁금하다면 <span className="text-accent-green font-semibold">@samurai_habit</span>
          </p>
        </a>
      </AnimateOnScroll>
    </section>
  );
}
