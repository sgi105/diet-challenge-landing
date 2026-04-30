import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';

const bonuses = [
  { icon: '📋', title: '식단 피드백 1회', desc: '내가 먹은 식단 사진 보내면 1:1 코멘트', value: '50,000원' },
  { icon: '🍱', title: '식단 PDF', desc: '4주 챌린지 전용 식단 가이드', value: null },
  { icon: '🏃', title: '러닝 폼 영상 1:1 분석', desc: '내 러닝 영상 1:1 코멘트', value: '50,000원' },
  { icon: '⭐', title: '우선 선발', desc: '같은 조건이면 추천인 전형 우선', value: null },
];

export default function ReferralBonusSection({ onCTA }) {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center mb-3">
          <span className="pill text-accent-orange">REFERRAL ONLY · ₩100,000+ 가치</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-2 text-text-primary leading-tight">
          초대받은 당신만<br /><span className="text-accent-orange">받는 4가지</span>
        </h2>
        <p className="text-text-muted text-center text-sm mb-8 font-semibold">
          기존 멤버 추천 → 신청자 전용 보너스
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="space-y-3 mb-8">
          {bonuses.map((b, i) => (
            <div
              key={i}
              className="bg-bg-card rounded-3xl p-5 flex items-start gap-4 shadow-[0_12px_30px_rgba(0,0,0,0.15)] border-l-[6px] border-accent-orange"
            >
              <div className="text-3xl shrink-0">{b.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-card-ink font-bold">{b.title}</p>
                  {b.value && (
                    <span className="text-bg-primary text-xs font-extrabold whitespace-nowrap bg-bg-primary/10 px-2 py-0.5 rounded-full">
                      {b.value}
                    </span>
                  )}
                </div>
                <p className="text-card-ink-muted text-sm">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <Button
          onClick={onCTA}
          className="w-full shadow-[0_12px_40px_rgba(255,107,53,0.4)] flex flex-col items-center justify-center leading-tight"
        >
          <span className="block">초대 전형으로 지원하기</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">
            4/28(화) 14:00 마감 · 추천인 이름 필수
          </span>
        </Button>
        <p className="text-text-muted text-xs mt-4 text-center font-semibold">
          문의:{' '}
          <a
            href="https://www.instagram.com/bali_tarzan/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-orange font-bold hover:underline"
          >
            @bali_tarzan
          </a>
        </p>
      </AnimateOnScroll>
    </section>
  );
}
