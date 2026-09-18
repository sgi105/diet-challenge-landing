import AnimateOnScroll from '../ui/AnimateOnScroll';

// 공감 섹션 "같이 하면" — 체크 항목마다 바로 아래 앱 화면 조각(레이아웃 A).
// 시안 SOT: design-references/s5v2-together-final.html (팀 배정 T3 · 피드 F1) + s5v2-together-mockups.html (책임감)
//
// 앱 화면은 트래커(1000runclub) 실제 모양을 옮겼다:
//   피드 = FeedPage 카드(정사각 사진 + RunStatsOverlay · 헤더 · 하트/말풍선 줄 · CommentBubble)
//   책임감 = 팀 현황판(595 확정 시안 — 초록 완료 · 빨강 실패 · 오늘 칸)
//   팀 배정 · 팀 우승 = 운영 중인 팀 카톡방
// 팀원 이름은 예시용 가짜. 피드 사진·기록은 가인 실제 게시물(2026-09-18 · 6.7km · 2384초).
// ⚠️ 피드 사진에 가인 외 한 명이 나온다 — 공개 전 본인 동의 필요.

const MEMBERS = {
  하늘: 'bg-orange-500',
  지은: 'bg-blue-500',
  민수: 'bg-purple-500',
  서연: 'bg-green-500',
  나: 'bg-pink-500',
};

function Avatar({ name, size = 28 }) {
  return (
    <span
      className={`${MEMBERS[name]} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {name[0]}
    </span>
  );
}

// ① 팀 배정 — 팀 카톡방 첫 인사
function KakaoBubble({ name, text, lead }) {
  return (
    <div className="flex gap-1.5 items-start mt-2">
      <Avatar name={name} />
      <div>
        <p className="text-[10.5px] text-[#444] mb-0.5">{name}{lead && ' (팀장)'}</p>
        <p className="bg-white rounded-[4px_12px_12px_12px] px-2.5 py-1.5 text-xs">{text}</p>
      </div>
    </div>
  );
}

function KakaoMock() {
  return (
    <div className="bg-[#b2c7d9] rounded-2xl p-2.5 text-[#111] text-left shadow-[0_14px_34px_rgba(0,0,0,0.3)]">
      <p className="text-xs font-extrabold text-center pb-2">3팀 🔥 21일 러닝 · 5</p>
      <KakaoBubble name="하늘" lead text="3팀 안녕! 21일 끝까지 같이 가자 🔥" />
      <KakaoBubble name="지은" text="잘 부탁해 🙌 매일 인증 간다" />
      <div className="flex justify-end mt-2">
        <p className="bg-[#fee500] rounded-[12px_4px_12px_12px] px-2.5 py-1.5 text-xs">나도! 한 명도 안 빠지고 끝까지 가자</p>
      </div>
    </div>
  );
}

// ② 응원 — 피드 카드 + 댓글 (FeedPage 실제 모양을 압축: 사진 170px · 이름/하트 한 줄 · 댓글 메타 줄 생략)
const STAT_FONT = { fontFamily: '"Bebas Neue", "Anton", system-ui, sans-serif' };
const SHADOW = { textShadow: '0 1px 4px rgba(0,0,0,0.55)' };
// 앱 RunStatsOverlay가 쓰는 lucide Clock · Gauge 모양
const ICON = { width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, viewBox: '0 0 24 24', style: { filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.55))' } };
const ClockIcon = () => <svg {...ICON}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
const GaugeIcon = () => <svg {...ICON}><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>;

function FeedComment({ name, text }) {
  return (
    <div className="flex items-start gap-2">
      <Avatar name={name} size={24} />
      <p className="bg-slate-800 rounded-2xl px-3 py-1.5 text-[13px] text-slate-200">
        <span className="text-xs font-semibold text-white mr-1.5">{name}</span>{text}
      </p>
    </div>
  );
}

function FeedMock() {
  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden text-left shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
      <div className="relative h-[170px] overflow-hidden bg-black">
        <img src="/s5v2/feed.jpg" alt="" loading="lazy" className="w-full h-full object-cover" style={{ objectPosition: 'center 34%' }} />
        <span className="absolute top-3 inset-x-0 text-center text-[26px] leading-none italic text-white" style={{ ...STAT_FONT, letterSpacing: 2, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>DAY 12</span>
        <span className="absolute top-3 right-3 text-[26px] leading-none italic text-white" style={{ ...STAT_FONT, ...SHADOW }}>
          <span className="text-lime-400">#</span>TARZAN
        </span>
        <div className="absolute inset-x-0 bottom-0 px-3 pt-10 pb-2.5 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex justify-between items-end text-white text-[22px] leading-none tabular-nums" style={{ ...STAT_FONT, ...SHADOW, letterSpacing: '0.04em' }}>
          <span className="flex items-center gap-1"><ClockIcon />39:44</span>
          <span>6.70 KM</span>
          <span className="flex items-center gap-1"><GaugeIcon />5'56"</span>
        </div>
      </div>
      <div className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-center gap-2">
          <Avatar name="나" size={28} />
          <p className="text-white font-semibold text-[13px]">나 <span className="text-xs text-slate-500 font-normal ml-1">Day 12 · 방금 전</span></p>
          <p className="ml-auto text-xs font-medium"><span className="text-red-400">❤️ 4</span><span className="text-slate-500 ml-2.5">💬 2</span></p>
        </div>
        <p className="text-slate-300 text-[13px] leading-snug mt-2">오늘 6시에 모닝런 완료! 너무 개운하다🔥</p>
      </div>
      <div className="px-3.5 pb-3.5 space-y-2">
        <FeedComment name="하늘" text="12일 연속이네 미쳤다 🔥" />
        <FeedComment name="지은" text="보고 자극받아서 나도 지금 나간다 👟" />
      </div>
    </div>
  );
}

// ③ 책임감 — 팀 현황판 (595 확정 시안 색·크기). 칸과 점수가 맞게: 완료 1칸 = 1점.
const DUTY = [
  { name: '하늘', cells: 'ddddddd', score: '7.0' },
  { name: '지은', cells: 'ddddddd', score: '7.0' },
  { name: '서연', cells: 'ddddddd', score: '7.0' },
  { name: '민수', cells: 'ddfdddd', score: '6.0' },
  { name: '나', cells: 'ddddddw', score: '6.0', me: true },
];
const CELL = { d: 'bg-green-500', f: 'bg-red-500', w: 'border-[1.5px] border-dashed border-orange-400' };

function DutyMock() {
  return (
    <div className="bg-slate-900 border border-white/[0.09] rounded-2xl px-3.5 py-3 text-left text-slate-200 shadow-[0_14px_34px_rgba(0,0,0,0.35)]">
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-bold">3팀 <span className="text-[11px] text-slate-500 font-medium">5명 · 이번 주</span></p>
        <p><span className="text-lg font-extrabold text-orange-400">33.0</span> <span className="text-[10px] text-slate-500 font-semibold">팀 점수</span></p>
      </div>
      <div className="mt-2">
        {DUTY.map((m, i) => (
          <div key={m.name} className={`flex items-center gap-[7px] py-1.5 ${i ? 'border-t border-white/[0.06]' : ''}`}>
            <span className={`w-3 text-sm font-extrabold ${i < 3 ? 'text-orange-400' : 'text-slate-600'}`}>{i + 1}</span>
            <Avatar name={m.name} size={24} />
            <span className={`w-10 text-xs shrink-0 ${m.me ? 'text-orange-300 font-extrabold' : 'font-medium'}`}>{m.name}</span>
            <div className="flex gap-0.5 flex-1">
              {[...m.cells].map((c, k) => <span key={k} className={`flex-1 h-3 rounded-[1.5px] ${CELL[c]}`} />)}
            </div>
            <span className="w-7 text-right text-[13px] font-extrabold text-orange-400">{m.score}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 bg-orange-400/[0.12] border border-orange-400/35 rounded-[10px] px-2.5 py-1.5 text-[11.5px] font-extrabold text-orange-300">
        ⏳ 팀원 4명 오늘 인증 끝 · 너만 남았어
      </p>
    </div>
  );
}

// ④ 팀 우승 — 최종 순위 캡처 + 자축 카톡 (시안 SOT: design-references/s5v2-team-win-5.html ①)
// 상금은 팀 합산 10만원(1인 아님) — 설명 줄에 "팀 상금"으로 명시한다. 순위·점수는 예시.
const FINAL_RANK = [
  { medal: '🥇', team: '3팀', score: '148.5', win: true },
  { medal: '🥈', team: '5팀', score: '146.0' },
  { medal: '🥉', team: '1팀', score: '139.5' },
];

function WinMock() {
  return (
    <div className="bg-[#b2c7d9] rounded-2xl p-2.5 text-[#111] text-left shadow-[0_14px_34px_rgba(0,0,0,0.3)]">
      <p className="text-xs font-extrabold text-center pb-2">3팀 🔥 21일 러닝 · 5</p>
      <div className="flex gap-1.5 items-start mt-1">
        <Avatar name="하늘" />
        <div>
          <p className="text-[10.5px] text-[#444] mb-0.5">하늘 (팀장)</p>
          <div className="bg-slate-900 rounded-xl px-3 py-2.5 w-[210px] text-slate-200">
            <p className="text-[10px] font-extrabold text-slate-500 tracking-[0.12em]">최종 순위 · 21일</p>
            {FINAL_RANK.map((r) => (
              <div key={r.team} className={`flex justify-between items-center mt-1.5 text-[13px] ${r.win ? 'font-black text-accent-green' : 'font-semibold text-slate-400'}`}>
                <span>{r.medal} {r.team}</span>
                <span className={`font-extrabold ${r.win ? 'text-orange-400' : 'text-slate-500'}`}>{r.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <KakaoBubble name="지은" text="미쳤다 ㅋㅋㅋㅋ 우리가 1등이야??" />
      <KakaoBubble name="민수" text="21일 한 명도 안 빠진 보람 있다 🥹" />
      <div className="flex justify-end mt-2">
        <p className="bg-[#fee500] rounded-[12px_4px_12px_12px] px-2.5 py-1.5 text-xs">상금 10만원으로 회식 가자 🍻</p>
      </div>
    </div>
  );
}

const ITEMS = [
  { title: '팀에 배정되고', sub: '5명이 한 팀. 끝까지 함께 도전하는 팀원들', mock: <KakaoMock /> },
  { title: '응원 받고', sub: '인증 올리면 팀원들이 바로 달려와', mock: <FeedMock /> },
  { title: '책임감이 생겨', sub: '누가 뛰었는지 매일 다 보여. 빠지면 티 나', mock: <DutyMock /> },
  { title: '팀 우승을 향한 강력한 동기부여까지', sub: '1등 팀은 팀 상금 현금 10만원', mock: <WinMock /> },
];

export default function TogetherMockups() {
  return (
    <div className="space-y-7">
      {ITEMS.map(({ title, sub, mock }) => (
        <AnimateOnScroll key={title}>
          <div className="flex items-center gap-2.5">
            <span className="w-[26px] h-[26px] rounded-full bg-accent-green text-bg-primary text-[13px] font-black flex items-center justify-center shrink-0">✓</span>
            <span className="text-[17px] font-black text-text-primary">{title}</span>
          </div>
          <p className="text-text-muted text-[12.5px] font-semibold mt-1 mb-3 ml-9 break-keep">{sub}</p>
          {mock}
        </AnimateOnScroll>
      ))}
    </div>
  );
}
