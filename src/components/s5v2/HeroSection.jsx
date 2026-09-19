import Button from '../ui/Button';
import { COHORT5 } from '../../data/season5';
import { HERO_MEDIA, HERO_STAIRS, CTA_LABEL_V2 } from '../../data/season5v2';
import { useSeason5Status, COPY5 } from '../../hooks/useSeason5Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import { spotsInfo } from '../../lib/spots';
import BonusSection from '../s5/BonusSection';
import { useSectionViews } from '../../hooks/useSectionViews';

// v2 — 첫 화면에서 파는 건 21일이 아니라 '하프마라톤 완주'라는 목적지와 그 증명이다.
// 시안 SOT: design-references/s5v2-hero-copy-C.html ①
//
// 레이아웃 C: 마지막 줄("증명해봐")이 주인공. 작게 조건 → 중간 정체성 → 크게 행동.
// TARZAN이 실제로 파는 건 완주 자체가 아니라 "나는 해내는 사람"이라는 증명이라 그 단어를 제일 키운다.
// "결국"은 여러 번 넘어졌던 과거를 인정하고 들어가는 말 — 작심삼일 반복해온 사람한테 꽂히는 지점.
//
// 약속의 주어에 주의: 21일이 하프를 책임진다는 말은 쓰지 않는다. 90일은 TARZAN의 설계 기간이다.
// 몸은 약속하지 않고 '따라오는 것'으로만 쓴다(지금 프로그램은 러닝 단일).
//
// 배지(run like TARZAN · N명 지원 중) · 20%→97% · 마감 카운트다운은 뺐다 — 인원·마감은 상단 띠와
// 버튼 아래 줄에 이미 있고, 97%는 아래 증거 섹션에 있다.
// 대신 버튼 바로 위에 계단을 둔다: 헤드라인이 90일·하프를 말하니, 지금 지원하는 게
// 하프 훈련의 첫 21일(습관 구간)이라는 걸 여기서 못 박지 않으면 90일짜리에 지원하는 줄 안다.
const USP = {
  // "90일 안에"는 뺐다(2026-09-19) — 바로 밑 계단이 21일 → 90일을 보여줘서 기간이 안 맞아 보였다.
  line1Pre: '',
  line1Accent: '하프마라톤',
  line1Post: ' 완주하고',
  line2: '결국 해내는 사람이라는 걸',
  line3: '증명해봐',
  bodyLine: '인생 최고의 몸은 따라온다',
};

// 세로 영상 한 칸 — 소리 없이 자동 반복. src가 없으면 자리 표시.
// 비율 4:5(1080×1350): 폰에서 칸 폭이 166px라 9:16은 가는 띠로 보이고, 1:1은 전신이 안 들어간다.
// 촬영은 9:16으로 하고 사람을 가운데 둔 채 위아래만 잘라 뽑는다.
function MediaSlot({ src, poster, label, accent }) {
  // 라벨은 영상 왼쪽 위 작은 딱지. AFTER만 라임 — 크기가 작아 지원 버튼과 헷갈리지 않는다.
  const badge = label && (
    <span
      className={`absolute top-2 left-2 z-10 text-[10px] font-black tracking-[0.14em] px-2 py-0.5 rounded-full ${
        accent ? 'bg-accent-green text-bg-primary' : 'bg-black/55 text-white backdrop-blur-sm'
      }`}
    >
      {label}
    </span>
  );
  if (!src) {
    return (
      <div className="aspect-[4/5] rounded-2xl border-2 border-dashed border-white/25 bg-white/5 flex items-center justify-center">
        <span className="text-text-muted text-[11px] font-bold">세로 영상</span>
      </div>
    );
  }
  return (
    <div className="relative">
      {badge}
      <video
        src={src}
        poster={poster || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="aspect-[4/5] w-full rounded-2xl object-cover bg-bg-deep shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
      />
    </div>
  );
}

// 계단 — 첫 계단(흰, 낮고 짧게) = 21일 습관 · 둘째 계단(점선, 높고 길게) = 90일 본격 훈련.
// 계단 폭은 대략 기간 비율, 높이는 "올라간다"는 느낌. 라임은 쓰지 않는다(라임은 버튼 전용).
function Stairs() {
  const { first, next, startTag } = HERO_STAIRS;
  return (
    <div className="flex items-end gap-1 h-[90px]">
      <div className="relative basis-[32%] shrink-0 h-[46%] bg-white text-bg-primary rounded-t-[10px] rounded-b-[4px] flex flex-col items-center justify-center">
        <span className="absolute -top-[22px] left-1/2 -translate-x-1/2 bg-white text-bg-primary text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
          {startTag}
        </span>
        <p className="text-[15px] font-black leading-none">{first.days}</p>
        <p className="text-[11px] font-bold opacity-75 mt-0.5">{first.label}</p>
      </div>
      <div className="flex-1 h-full border-2 border-b-0 border-dashed border-white/35 rounded-t-[10px] flex flex-col items-center justify-center text-text-secondary">
        <p className="text-[15px] font-black leading-none">{next.days}</p>
        <p className="text-[11px] font-bold opacity-75 mt-0.5">{next.label}</p>
      </div>
    </div>
  );
}

export default function HeroSection({ onCTA }) {
  useSectionViews();
  const status = useSeason5Status();
  const copy = COPY5[status];
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const isOfficial = status === 'official';

  const liveCount = useApplicantCount(isOfficial, COHORT5.cohortCode);
  const spots = isOfficial ? spotsInfo(liveCount) : null;
  // 버튼 보조문구: 남은 자리는 마감 임박(9자리 이하)일 때만 — 넉넉할 때 숫자를 보이면
  // 급할 이유가 없다는 신호가 된다. 그 외엔 단계별 문구(마감 시각).
  const ctaSub = spots?.low ? `정원 30명 중 ${spots.remaining}자리 남음` : copy.ctaSub;

  // 모집 중엔 "21일 챌린지 지원하기"로 — 헤드라인의 90일과 헷갈리지 않게 지원 대상을 버튼에 박는다.
  // 오픈 전/마감 문구는 공용(COPY5) 그대로.
  const ctaLabel = isOfficial ? CTA_LABEL_V2 : copy.cta.hero;

  return (
    <section id="hero" className="relative overflow-hidden">
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none bg-accent-green/10" />

      <div className="relative px-6 pt-7 pb-14">
        <div className="relative z-10 text-center max-w-lg mx-auto">
          {/* 마감 상태만 도장으로 — 모집 중/오픈 전은 상단 띠가 이미 말해준다 */}
          {isClosed && (
            <div className="flex justify-center mb-5">
              <div className="inline-block transform -rotate-2 border-[3px] border-dashed border-accent-orange rounded-2xl bg-accent-orange/10 px-6 py-3">
                <div className="font-display text-[26px] leading-none tracking-[0.08em] text-accent-orange text-center">CLOSED</div>
                <div className="text-text-primary text-[11px] font-extrabold text-center mt-1.5 tracking-[0.12em]">이번 기수 마감</div>
              </div>
            </div>
          )}

          <h1 className="break-keep animate-fade-up">
            <span className="block font-kr text-[19px] md:text-2xl font-black text-text-secondary leading-snug">
              {USP.line1Pre}<span className="text-accent-green">{USP.line1Accent}</span>{USP.line1Post}
            </span>
            <span className="block font-sans font-normal text-[31px] md:text-5xl text-text-primary leading-[1.2] mt-2">
              {USP.line2}
            </span>
            <span
              className="block font-sans font-normal text-[64px] md:text-8xl text-accent-green leading-[1.05]"
              style={{ textShadow: '0 0 32px rgba(200,255,77,0.45)' }}
            >
              {USP.line3}
            </span>
          </h1>
          <p className="text-text-secondary text-[13px] sm:text-sm font-bold break-keep mt-3 animate-fade-up" style={{ animationDelay: '0.08s' }}>
            {USP.bodyLine}
          </p>

          {/* 영상 두 칸 — 왼쪽 비포 · 오른쪽 애프터 (각각 러닝 + 몸) */}
          <div className="grid grid-cols-2 gap-2.5 mt-6 animate-fade-up" style={{ animationDelay: '0.14s' }}>
            {HERO_MEDIA.map((m, i) => (
              <MediaSlot key={i} {...m} />
            ))}
          </div>

          {/* 하프마라톤 훈련의 첫 21일 = 습관 구간 (지원하는 건 첫 계단) */}
          <div className="text-left mt-6 mb-3">
            <p className="text-text-muted text-xs font-extrabold">{HERO_STAIRS.lead}</p>
            <p className="text-text-primary text-[17px] font-black mt-0.5 break-keep">{HERO_STAIRS.leadMark}</p>
          </div>
          <Stairs />

          {isClosed && (
            <p className="text-text-secondary text-[13px] font-semibold leading-relaxed mt-4">
              다음 기수 열리면 <span className="text-text-primary font-extrabold">제일 먼저 문자</span>로 알려줄게.
            </p>
          )}

          <div className="mt-4">
            <Button
              onClick={onCTA}
              disabled={isUpcoming}
              className="w-full animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] flex flex-col items-center justify-center leading-tight"
            >
              <span className="block">{ctaLabel}</span>
              <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{ctaSub}</span>
            </Button>
            {!isClosed && <BonusSection compact />}
          </div>
        </div>
      </div>
    </section>
  );
}
