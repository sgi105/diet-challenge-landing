import AnimateOnScroll from '../ui/AnimateOnScroll';

// 21일 비포/애프터 — 260601 기수 실제 기록.
// Day 1 1km 테스트 → Day 21 파이널, 둘 다 5km 환산 예상 기록.
// 시안 SOT: design-references/606-landing-final.html
const AVATAR_BASE = 'https://arjkkooducikmpjeudnc.supabase.co/storage/v1/object/public/mission-evidence/';

const MEMBERS = [
  {
    name: '정O회', gender: '남', age: 24,
    before: '32:29', after: '23:37',
    beforePace: "6'30\"", afterPace: "4'43\"",
    cut: '8분 52초',
    avatar: '78a3ce80-435a-4e2c-a08a-73b542161745/profile/1780310788150-xrglhvlgi6b.jpg',
    quote: '챌린지가 끝났다고 생각하지 않고 새로운 시작이라고 생각해',
  },
  {
    name: '이O영', gender: '여', age: 50,
    before: '33:53', after: '26:07',
    beforePace: "6'47\"", afterPace: "5'13\"",
    cut: '7분 46초',
    avatar: '426c872c-b22d-4329-89e7-333426d872a7/profile/1780781220790-173zdtm7ern.jpg',
    quote: '다시 뛰는 게 아니까 더 힘들 것 같았는데 어찌하다 보니 한 달이 그냥 가버렸네요',
  },
  {
    name: '김O희', gender: '여', age: 33,
    before: '37:56', after: '34:01',
    beforePace: "7'35\"", afterPace: "6'48\"",
    cut: '3분 55초',
    avatar: '5a0e940a-6049-4c02-9a1c-ab6b2c9550b2/profile/1777901989790-t40sbgu9dbb.jpg',
    quote: '러닝 기록 이상으로 많은 것을 얻은 챌린지였다고 당당하게 말할 수 있을 것 같아요!',
  },
  {
    name: '이O윤', gender: '여', age: 27,
    before: '30:45', after: '27:00',
    beforePace: "6'09\"", afterPace: "5'24\"",
    cut: '3분 45초',
    avatar: '053a57b6-f700-4776-bd52-d6533f8075b5/profile/1777863413794-0gafqi88zn2s.jpg',
    quote: '뛰기를 정말 싫어했던 내가 5km를 쉬지 않고 완주하다니!',
  },
];

const STATS = [
  { value: '17', unit: '명', label: <>25명 중<br />기록 단축</> },
  { value: '10', unit: '명', label: <>3분 이상<br />단축</> },
  { value: '21', unit: '일', label: <>만에<br />일어난 변화</> },
];

export default function PaceResultSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <span className="pill text-accent-green block w-fit mx-auto">21 DAYS</span>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mt-4 mb-3 text-text-primary leading-tight">
          21일 뒤,<br /><span className="text-accent-green">5km가 이만큼 빨라져</span>
        </h2>
        <p className="text-text-secondary text-center text-sm mb-6 leading-relaxed break-keep">
          Day 1에 재고, Day 21에 다시 쟀어. 둘 다 전력으로.
        </p>
      </AnimateOnScroll>

      <div className="space-y-3 mb-5">
        {MEMBERS.map((m, i) => (
          <AnimateOnScroll key={m.name} delay={i * 0.1}>
            <div className="bg-bg-card rounded-3xl px-[1.35rem] py-[1.4rem] shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
              <div className="flex items-center gap-3 mb-3.5">
                <img
                  src={`${AVATAR_BASE}${m.avatar}`}
                  alt={`${m.name} 프로필`}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className="w-9 h-9 shrink-0 rounded-full object-cover bg-bg-card-hover"
                />
                <p className="flex-1 text-card-ink font-extrabold text-sm">
                  {m.name}{' '}
                  <span className="text-card-ink-faint font-semibold text-xs">{m.gender}·{m.age}</span>
                </p>
                <span className="bg-accent-green text-card-ink rounded-full font-black whitespace-nowrap text-[0.75rem] px-[0.6rem] py-[0.22rem] tabular-nums">
                  −{m.cut}
                </span>
              </div>

              <div className="flex items-baseline justify-center gap-3">
                <span className="font-kr tabular-nums text-card-ink-faint text-[1.9rem]">{m.before}</span>
                <span className="text-accent-green text-[1.4rem] font-black">→</span>
                <span className="font-kr tabular-nums text-bg-primary text-[3rem]">{m.after}</span>
              </div>

              <p className="tabular-nums text-center text-card-ink-faint text-[0.78rem] font-bold mt-1">
                {m.beforePace} → <b className="text-bg-primary">{m.afterPace}</b>/km
              </p>

              <p className="text-center text-card-ink-faint text-[0.78rem] leading-relaxed mt-3.5 break-keep">
                &ldquo;{m.quote}&rdquo;
              </p>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      <AnimateOnScroll>
        <div className="grid grid-cols-3 gap-[0.55rem]">
          {STATS.map((s) => (
            <div key={s.value + s.unit} className="bg-bg-card rounded-[1.1rem] px-2 py-4 text-center">
              <b className="block text-bg-primary font-black tracking-tight text-[1.55rem] tabular-nums">
                {s.value}<span className="text-[0.9rem]">{s.unit}</span>
              </b>
              <span className="block text-card-ink-faint text-[0.68rem] font-bold mt-1 leading-snug">{s.label}</span>
            </div>
          ))}
        </div>

        <p className="text-text-muted text-[0.7rem] mt-4 leading-relaxed break-keep">
          260601 기수 참가자 25명 · 5km 환산 예상 기록 · 괄호는 1km당 페이스
        </p>
      </AnimateOnScroll>
    </section>
  );
}
