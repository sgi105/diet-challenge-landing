import AnimateOnScroll from '../ui/AnimateOnScroll';
import { BONUS5, COHORT5 } from '../../data/season5';
import { useSeason5Status } from '../../hooks/useSeason5Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import { useCountdown } from '../../hooks/useCountdown';
import { previewCount } from '../../lib/spots';

// 오픈 당일 선착순 보너스 — 단톡방 런칭 메시지와 같은 오퍼를 랜딩에서도 그대로 보여준다.
// compact: 히어로 CTA 바로 아래(작게) / 기본: 가격 섹션 위 독립 섹션.
export default function BonusSection({ compact = false }) {
  const status = useSeason5Status();
  const isOfficial = status === 'official';
  const count = previewCount(useApplicantCount(isOfficial, COHORT5.cohortCode));
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
    },
    guideOpen && {
      tag: BONUS5.guideDeadlineLabel + '까지',
      hot: days < 1,
      title: BONUS5.guideTitle,
      desc: BONUS5.guideDesc,
      icon: BONUS5.guideIcon,
      timer: isOfficial ? guideLeft : null,
    },
  ].filter(Boolean);

  const list = (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {rows.map((r, i) => (
        <div
          key={i}
          className={`bg-bg-card rounded-2xl ${compact ? 'p-3.5' : 'p-4'} text-left shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex items-center gap-3.5`}
        >
          <span
            aria-hidden="true"
            className={`shrink-0 leading-none ${compact ? 'text-[34px]' : 'text-[40px]'}`}
          >
            {r.icon}
          </span>
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
      <div className="mt-7 max-w-sm mx-auto">
        <p className="text-text-secondary text-[12px] font-extrabold tracking-wide mb-2.5 text-center">
          🎁 선착순 보너스
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
