import AnimateOnScroll from '../ui/AnimateOnScroll';
import { BONUS6 as BONUS5, COHORT6 } from '../../data/season6';
import { useSeason6Status } from '../../hooks/useSeason6Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import { useCountdown } from '../../hooks/useCountdown';
import { previewCount } from '../../lib/spots';

// 썸네일 — 시안 SOT: design-references/s6-bonus-cards-3.html A (가인 2026-10-22).
// 러닝폼 분석 = 히어로 AFTER 러닝 영상을 슬로우모션으로 · 가이드 = 전자책 표지 목업(책등 + 종이 단면 + 살짝 기울임).
function SlowRunThumb({ size }) {
  // public/s6/run-slow.mp4 = 히어로 AFTER 영상의 뛰는 구간(앞 1.95초)만 잘라 2.5배 슬로우로 굽고(프레임 보간) 360px로 줄인 것.
  //   뒤의 포징 구간은 뺐다(가인 2026-10-22). 재생 속도 조절 없이 파일 자체가 슬로우.
  //   재생성: ffmpeg -ss 0 -t 1.95 -i public/s5v2/after.mp4 -an -vf "setpts=2.5*PTS,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:vsbmc=1,scale=360:-2"
  //          -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart public/s6/run-slow.mp4
  return (
    <div className="relative shrink-0 overflow-hidden rounded-xl bg-bg-deep" style={{ width: size, height: size }}>
      <video
        src="/s6/run-slow.mp4?v=1"
        poster="/s6/run-slow.jpg?v=1"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover object-[22%_40%]"
      />
    </div>
  );
}

// 전자책 목업 — 책등(왼쪽 두께 + 하이라이트) · 표지 접힘선 · 오른쪽/아래 종이 단면 · 바닥 그림자로 "책"처럼.
function EbookThumb({ size }) {
  const w = Math.round(size * 0.66);
  const h = Math.round(size * 0.9);
  return (
    <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
      {/* 바닥 그림자 */}
      <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 w-[70%] h-[10%] rounded-[50%] bg-black/25 blur-[4px]" />
      <div className="relative" style={{ width: w, height: h, transform: 'rotate(-4deg)' }}>
        {/* 종이 단면 — 오른쪽·아래로 겹친 페이지 */}
        <div
          className="absolute top-[4px] -right-[6px] bottom-[-5px] left-[8px] rounded-[2px_6px_6px_2px]"
          style={{ background: 'repeating-linear-gradient(0deg,#ffffff 0 1.5px,#dfe3f5 1.5px 2.5px)', boxShadow: 'inset -1px 0 0 #c9cfee' }}
        />
        {/* 뒷표지 두께 */}
        <div className="absolute top-[6px] -right-[8px] bottom-[-7px] left-[10px] rounded-[2px_7px_7px_2px] bg-[#0e29d6] -z-10" />
        {/* 앞표지 */}
        <div
          className="absolute inset-0 rounded-[3px_7px_7px_3px] overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#3552ff 0%,#1e3cff 50%,#1530e0 100%)', boxShadow: '2px 3px 8px rgba(0,0,0,0.3)' }}
        >
          {/* 책등 — 왼쪽 두꺼운 띠 + 하이라이트 + 접힘선 */}
          <div className="absolute inset-y-0 left-0 w-[13%] bg-gradient-to-r from-[#0a1f9e] via-[#1834e6] to-[#0e29d6]" />
          <div className="absolute inset-y-0 left-[3%] w-[1.5px] bg-white/25" />
          <div className="absolute inset-y-0 left-[13%] w-[1.5px] bg-black/25" />
          <div className="absolute inset-y-0 left-[14.5%] w-[1px] bg-white/20" />
          {/* 표지 글씨는 2배 크기로 그리고 0.5배로 줄인다 — 브라우저 최소 글자 크기(9-10px)에 막혀 작은 글씨가 넘치는 걸 피한다 */}
          <div
            className="absolute top-0 left-[18%] origin-top-left flex flex-col justify-between py-[22%]"
            style={{ width: `${(w * 0.78) * 2}px`, height: `${h * 2}px`, transform: 'scale(0.5)' }}
          >
            <span className="whitespace-nowrap text-accent-green text-[12px] font-black tracking-[0.1em]">ROAD TO 1%</span>
            <p className="text-white font-black leading-[1.18] text-[17px] whitespace-nowrap">
              <span className="text-accent-green text-[32px] leading-none block mb-1.5">90일</span>하프마라톤<br />완주 가이드
            </p>
            <p className="text-white/60 text-[10px] font-bold tracking-wide">BALI TARZAN</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 오픈 당일 선착순 보너스 — 단톡방 런칭 메시지와 같은 오퍼를 랜딩에서도 그대로 보여준다.
// compact: 히어로 CTA 바로 아래(작게) / 기본: 가격 섹션 위 독립 섹션.
export default function BonusSection({ compact = false }) {
  const status = useSeason6Status();
  const isOfficial = status === 'official';
  const count = previewCount(useApplicantCount(isOfficial, COHORT6.cohortCode));
  const { days, hours, minutes, seconds, isExpired } = useCountdown(BONUS5.guideDeadline);

  // 마감 뒤에는 통째로 숨긴다 — 못 받는 보너스를 계속 보여주면 신뢰가 깨진다.
  const formLeft = count == null ? BONUS5.formSpots : Math.max(0, BONUS5.formSpots - count);
  const guideOpen = !isExpired;
  if (status === 'closed' || (formLeft === 0 && !guideOpen)) return null;

  const pad = (n) => String(n).padStart(2, '0');
  const guideLeft = days >= 1 ? `${days}일 ${hours}시간` : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const rows = [
    formLeft > 0 && {
      tag: count == null ? `선착순 ${BONUS5.formSpots}명` : `${formLeft}자리 남음`,
      hot: count != null && formLeft <= 5,
      title: BONUS5.formTitle,
      desc: BONUS5.formDesc,
      icon: BONUS5.formIcon,
      thumb: 'form',
    },
    guideOpen && {
      tag: BONUS5.guideDeadlineLabel + '까지',
      hot: days < 1,
      title: BONUS5.guideTitle,
      desc: BONUS5.guideDesc,
      icon: BONUS5.guideIcon,
      thumb: 'guide',
      timer: isOfficial ? guideLeft : null,
    },
  ].filter(Boolean);

  const list = (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div
          key={i}
          className={`bg-bg-card rounded-2xl ${compact ? 'p-3' : 'p-3.5'} text-left shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex items-center gap-3.5`}
        >
          {r.thumb === 'form' && <SlowRunThumb size={compact ? 84 : 96} />}
          {r.thumb === 'guide' && <EbookThumb size={compact ? 84 : 96} />}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {/* 디자인 SOT: pill은 채우지 않고 테두리 + 글자색으로만 상태를 표시한다. */}
              <span
                className={`inline-block rounded-full border px-2 py-[2px] text-[10.5px] font-extrabold tracking-wide ${
                  r.hot
                    ? 'border-accent-orange/60 text-accent-orange bg-accent-orange/10'
                    : 'border-card-ink/25 text-card-ink-muted'
                }`}
              >
                {r.tag}
              </span>
              {r.timer && (
                <span className="text-card-ink-muted text-[11px] font-extrabold tabular-nums tracking-wide">
                  ⏰ {r.timer}
                </span>
              )}
            </div>
            <h3 className={`font-bold text-card-ink leading-tight break-keep ${compact ? 'text-[14px]' : 'text-[15px]'}`}>
              {r.title}
            </h3>
            <p className="text-card-ink-muted text-[12.5px] leading-relaxed mt-0.5 break-keep">{r.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  if (compact) {
    return (
      <div className="mt-12 max-w-sm mx-auto">
        {/* 신청 버튼과 딱 붙어 보여서(가인 2026-10-22) 간격을 벌리고 제목 줄을 따로 세운다 */}
        <p className="text-text-primary text-[15px] font-black mb-3.5 text-center">
          🎁 지금 신청하면 선착순 보너스
        </p>
        {list}
      </div>
    );
  }

  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <div className="text-center mb-3">
          <span className="pill text-accent-green">BONUS</span>
        </div>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-3 text-text-primary leading-tight">
          빨리 신청하면<br />
          <span className="text-accent-green">이것까지 가져가</span>
        </h2>
        <p className="text-text-secondary text-center text-sm mb-8 font-semibold break-keep">
          먼저 움직이는 사람한테 더 주고 싶어서 준비했어
        </p>
      </AnimateOnScroll>
      <AnimateOnScroll>{list}</AnimateOnScroll>
    </section>
  );
}
