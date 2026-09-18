import { useEffect, useRef, useState } from 'react';
import AnimateOnScroll from '../ui/AnimateOnScroll';
import { CardByStyle } from './TestimonialCards';
import { useTestimonialPicks } from '../../hooks/useTestimonialPicks';

// 가로 슬라이드로 보여줄 개수. 넘기다 지치지 않게 상위 N개만.
const MAX_CARDS = 10;

// 전환에 기여할 것 같은 순서로 정렬한다.
// 랜딩에 오는 사람 대부분이 "나 같은 초보도 되나?"를 묻고 있으므로,
// ① 나도 됐다(반론 해소) > ② 구체적인 변화 수치 > ③ 팀·코치 덕분 > ④ 습관이 됐다 순으로 점수를 준다.
const SIGNALS = [
  { score: 4, re: /초보|처음|못\s?뛰|안\s?뛰|뛰기(가)?\s?너무\s?싫|싫은데|핑계|나도\s?하면|절대|100미터|１００미터/ },
  { score: 3, re: /\d+\s?(키로|km|킬로)|\d+\s?분대|페이스|지구력|심폐|근육량|인바디|체력|몸무게|살|라인/ },
  { score: 2, re: /팀|같이|혼자|코치|응원|다독/ },
  { score: 1, re: /매일|꾸준|습관|아침|미라클/ },
];

function score(t) {
  const text = t.caption || '';
  let s = SIGNALS.reduce((acc, sig) => acc + (sig.re.test(text) ? sig.score : 0), 0);
  s += Math.min((t.likes || 0) * 0.25, 2);
  s += Math.min((t.comments || 0) * 0.2, 1);
  if (text.length < 25) s -= 2;          // 한 줄짜리는 증거로 약하다
  else if (text.length >= 40) s += 1;
  if (t.img) s += 1;                      // 사진 있는 후기가 더 믿긴다
  return s;
}

export default function TestimonialSection() {
  const { rows, cardStyle } = useTestimonialPicks();
  const trackRef = useRef(null);
  const [idx, setIdx] = useState(0);

  const cards = [...rows].sort((a, b) => score(b) - score(a)).slice(0, MAX_CARDS);

  // 점(인디케이터) 위치 — 스크롤 위치를 카드 폭으로 나눠 현재 장을 구한다.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.firstElementChild;
      if (!card) return;
      const w = card.getBoundingClientRect().width + 16; // gap-4
      setIdx(Math.round(el.scrollLeft / w));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [cards.length]);

  return (
    <section className="py-14">
      <div className="px-6 max-w-lg mx-auto">
        <AnimateOnScroll>
          <span className="pill text-accent-green">REAL VOICES · 참가자 후기</span>
          <h2 className="font-kr text-3xl md:text-5xl mt-4 mb-4 text-text-primary break-keep">
            한 글자도 안 바꾼<br />
            <span className="text-accent-green">리얼 후기</span>
          </h2>
          <p className="text-text-secondary mb-6 leading-relaxed">
            런클럽 실제 인증 피드에서 그대로 가져왔어.
          </p>
        </AnimateOnScroll>
      </div>

      {rows.length > 0 && (
        <>
          {/* 가로 슬라이드 — 세로로 길게 쌓으면 여기서 스크롤을 놓는다.
              옆 카드가 살짝 보이게 해서 더 넘길 게 있다는 걸 알려준다. */}
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* 슬라이드에서는 사진 높이를 제한한다 — 원래 비율대로 두면 사진이 화면을 다 먹고
                정작 증거인 후기 글이 안 보인다. */}
            {cards.map((t) => (
              <div
                key={t.id}
                className="snap-center shrink-0 w-[85%] max-w-[330px] [&_.aspect-square]:!aspect-auto [&_.aspect-\\[4\\/3\\]]:!aspect-auto [&_.aspect-square]:h-[190px] [&_.aspect-\\[4\\/3\\]]:h-[190px]"
              >
                <CardByStyle style={cardStyle} t={t} />
              </div>
            ))}
          </div>

          <div className="px-6 max-w-lg mx-auto">
            <div className="flex items-center justify-center gap-1.5 mt-4">
              {cards.map((t, i) => (
                <span
                  key={t.id}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-accent-green' : 'w-1.5 bg-white/25'}`}
                />
              ))}
            </div>
            <p className="text-text-muted text-[11px] text-center leading-relaxed mt-4">
              옆으로 넘기면 더 있어 · 사진/캡션은 실제 앱 피드 기준. 이름은 익명 처리.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
