import Button from '../ui/Button';
import { COHORT6, HERO_BAR6, CTA_LABEL6 } from '../../data/season6';
import { HERO_MEDIA } from '../../data/season5v2';
import { useSeason6Status, COPY6 } from '../../hooks/useSeason6Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import { spotsInfo } from '../../lib/spots';
import BonusSection from './BonusSection';
import { useSectionViews } from '../../hooks/useSectionViews';

// v2 — 첫 화면에서 파는 건 21일이 아니라 '하프마라톤 완주'라는 목적지와 그 증명이다.
// 시안 SOT: design-references/s5v2-hero-copy-C.html ①
//
// 헤드라인(2026-10-15~): "생애 첫 하프마라톤 완주하고 / 인생 최고의 몸 / 만들자" — 몸이 주인공.
// 이전 v2 헤드라인("결국 해내는 사람이라는 걸 증명해봐")은 git 기록 참고.
//
// 약속의 주어에 주의: 21일이 하프를 책임진다는 말은 쓰지 않는다. 90일은 TARZAN의 설계 기간이다.
//
// 배지(run like TARZAN · N명 지원 중) · 20%→97% · 마감 카운트다운은 뺐다 — 인원·마감은 상단 띠와
// 버튼 아래 줄에 이미 있고, 97%는 아래 증거 섹션에 있다.
// 대신 버튼 바로 위에 계단을 둔다: 헤드라인이 90일·하프를 말하니, 지금 지원하는 게
// 하프 훈련의 첫 21일(습관 구간)이라는 걸 여기서 못 박지 않으면 90일짜리에 지원하는 줄 안다.
const USP = {
  // 2026-10-15 교체: "결국 해내는 사람이라는 걸 증명해봐" → 몸을 제일 크게.
  // 줄 순서: 작게 조건 → 크게 결과(몸) → 중간 행동(만들자).
  line1Pre: '생애 첫 ',
  line1Accent: '하프마라톤',
  line1Post: ' 완주하고',
  line2: '인생 최고의 몸',
  line3: '만들자',
};

// 영상 밑 라벨(가인 2026-10-22) — 비포/애프터가 "몇 km 뛰는 몸"인지 한 줄로. 순서 = HERO_MEDIA 순서.
const MEDIA_CAPTIONS = ['5km 뛰는 몸', '21km 뛰는 몸'];

// 세로 영상 한 칸 — 소리 없이 자동 반복. src가 없으면 자리 표시.
// 비율 4:5(1080×1350): 폰에서 칸 폭이 166px라 9:16은 가는 띠로 보이고, 1:1은 전신이 안 들어간다.
// 촬영은 9:16으로 하고 사람을 가운데 둔 채 위아래만 잘라 뽑는다.
function MediaSlot({ src, poster, label, accent, caption }) {
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
      {caption && (
        <p className={`mt-2 text-[13px] font-black break-keep ${accent ? 'text-accent-green' : 'text-text-secondary'}`}>
          {caption}
        </p>
      )}
    </div>
  );
}

// 90일 막대 — 길이는 실제 비율(28:62). 앞 28일(흰 칸)이 무료 체험, 나머지(점선)는 이어서 하는 본격 훈련.
// 라임은 쓰지 않는다(라임은 버튼 전용). 눈금은 DAY 1 · DAY 28 · DAY 90.
function Bar90() {
  const { tag, freeDays, totalDays, freeLabel, restLabel } = HERO_BAR6;
  const freePct = (freeDays / totalDays) * 100;
  return (
    <div>
      <div className="relative flex h-[58px] gap-[3px] mt-7">
        <div
          className="relative bg-white text-bg-primary rounded-l-[10px] rounded-r-[4px] flex flex-col items-center justify-center"
          style={{ flex: freeDays }}
        >
          <span className="absolute -top-[22px] left-1/2 -translate-x-1/2 bg-white text-bg-primary text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
            {tag}
          </span>
          <p className="text-[15px] font-black leading-none">{freeDays}일</p>
          <p className="text-[10px] font-bold opacity-75 mt-0.5">{freeLabel}</p>
        </div>
        <div
          className="border-2 border-dashed border-white/35 rounded-l-[4px] rounded-r-[10px] flex flex-col items-center justify-center text-text-secondary"
          style={{ flex: totalDays - freeDays }}
        >
          <p className="text-[12px] font-black leading-none">{freeDays + 1}일차부터</p>
          <p className="text-[11px] font-bold opacity-80 mt-1">{restLabel}</p>
        </div>
      </div>
      <div className="relative h-4 mt-1 text-[10px] font-extrabold text-text-muted">
        <span className="absolute left-0">DAY 1</span>
        <span className="absolute -translate-x-1/2" style={{ left: `${freePct}%` }}>DAY {freeDays}</span>
        <span className="absolute right-0">DAY {totalDays}</span>
      </div>
    </div>
  );
}

export default function HeroSection({ onCTA }) {
  useSectionViews();
  const status = useSeason6Status();
  const copy = COPY6[status];
  const isClosed = status === 'closed';
  const isUpcoming = status === 'upcoming';
  const isOfficial = status === 'official';

  const liveCount = useApplicantCount(isOfficial, COHORT6.cohortCode);
  const spots = isOfficial ? spotsInfo(liveCount) : null;
  // 버튼 보조문구: 남은 자리는 마감 임박(9자리 이하)일 때만 — 넉넉할 때 숫자를 보이면
  // 급할 이유가 없다는 신호가 된다. 그 외엔 단계별 문구(마감 시각).
  const ctaSub = spots?.low ? `정원 ${COHORT6.totalSpots}명 중 ${spots.remaining}자리 남음` : copy.ctaSub;

  // 모집 중엔 "21일 챌린지 지원하기"로 — 헤드라인의 90일과 헷갈리지 않게 지원 대상을 버튼에 박는다.
  // 오픈 전/마감 문구는 공용(COPY5) 그대로.
  const ctaLabel = isOfficial ? CTA_LABEL6 : copy.cta.hero;

  // overflow: clip — hidden 이면 안쪽 큰 배경 원(600px) 때문에 스크롤 이동(scrollIntoView 등)에 히어로가 옆으로 밀려
  // 버튼·보너스 카드 왼쪽이 잘려 보인다(가인 2026-10-22 스샷). clip 은 스크롤 자체가 안 생긴다. hidden 은 구형 브라우저용 대비.
  return (
    <section id="hero" className="relative overflow-hidden [overflow:clip]">
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
            <span
              className="block font-sans font-normal text-[44px] md:text-7xl text-accent-green leading-[1.1] mt-2"
              style={{ textShadow: '0 0 32px rgba(200,255,77,0.45)' }}
            >
              {USP.line2}
            </span>
            <span className="block font-sans font-normal text-[31px] md:text-5xl text-text-primary leading-[1.2] mt-1">
              {USP.line3}
            </span>
          </h1>

          {/* 영상 두 칸 — 왼쪽 비포 · 오른쪽 애프터 (각각 러닝 + 몸) */}
          <div className="grid grid-cols-2 gap-2.5 mt-6 animate-fade-up" style={{ animationDelay: '0.14s' }}>
            {HERO_MEDIA.map((m, i) => (
              <MediaSlot key={i} {...m} caption={MEDIA_CAPTIONS[i]} />
            ))}
          </div>

          {/* 90일 프로그램 중 앞 28일 = 무료 체험 */}
          <div className="text-left mt-6">
            <p className="text-text-muted text-xs font-extrabold">{HERO_BAR6.lead}</p>
            <p className="text-text-primary text-[17px] font-black mt-0.5 break-keep">{HERO_BAR6.leadMark}</p>
          </div>
          <Bar90 />

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
