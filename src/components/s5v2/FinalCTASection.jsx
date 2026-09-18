import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT5 } from '../../data/season5';
import { PROOF, CTA_LABEL_V2 } from '../../data/season5v2';
import { useSeason5Status, COPY5 } from '../../hooks/useSeason5Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import SpotsBadge from '../s2/SpotsBadge';

// v2 최종 신청 — 히어로와 같은 말로 닫는다(가인 2026-09-19 "나머지와 통일감").
// v1(s5/FinalCTASection)은 옛 히어로 문구("상위 1%로 가는 첫 21일")와 옛 숫자(80% 포기 / 97% 성공)라
// v2의 헤드라인·그래프(혼자 25% vs 함께 96%)와 어긋났다.
//   제목 = 히어로 3줄 그대로 · 숫자 = 공감 섹션 그래프와 같은 값 · 선택지 = 페이지 첫 줄(새해 작심삼일)로 되돌아가기
export default function FinalCTASection({ onCTA }) {
  const status = useSeason5Status();
  const copy = COPY5[status];
  const isUpcoming = status === 'upcoming';
  const isOfficial = status === 'official';
  const count = useApplicantCount(isOfficial, COHORT5.cohortCode);
  const showCountdown = status !== 'closed';
  const countdownTarget = isUpcoming ? COHORT5.officialOpen : COHORT5.officialDeadline;
  const countdownLabel = isUpcoming ? '모집 오픈까지' : '마감까지';

  return (
    <section className="px-6 py-16 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="break-keep">
          <span className="block font-kr text-[19px] font-black text-text-secondary leading-snug">
            90일 안에 <span className="text-accent-green">하프마라톤</span> 완주하고
          </span>
          <span className="block font-sans font-normal text-[31px] text-text-primary leading-[1.2] mt-2">
            결국 해내는 사람이라는 걸
          </span>
          <span
            className="block font-sans font-normal text-[64px] text-accent-green leading-[1.05]"
            style={{ textShadow: '0 0 32px rgba(200,255,77,0.45)' }}
          >
            증명해봐
          </span>
        </h2>
        <p className="text-text-secondary text-[15px] font-extrabold mt-5 mb-10 break-keep">
          혼자 <span className="font-display tabular-nums text-white/60">{PROOF.soloSuccessRate}%</span> → TARZAN에서 함께{' '}
          <span className="font-display tabular-nums text-accent-green text-xl">{PROOF.consistencyRate}%</span>
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="space-y-3 mb-10">
          <p className="font-sans font-normal text-accent-green text-[24px] leading-tight break-keep">
            하프마라톤까지 가는 사람
          </p>
          <p className="text-text-muted font-bold tracking-widest text-xs">OR</p>
          <p className="font-sans font-normal text-accent-orange text-[24px] leading-tight break-keep">
            내년 새해에 또 결심하는 사람
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        {isOfficial && <SpotsBadge count={count} className="mb-5" />}
        <Button
          onClick={onCTA}
          disabled={isUpcoming}
          className="w-full animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] flex flex-col items-center justify-center leading-tight"
        >
          <span className="block">{isOfficial ? CTA_LABEL_V2 : copy.cta.final}</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
        </Button>

        {showCountdown && (
          <div className="mt-6">
            <p className="text-text-muted text-[11px] mb-2 font-bold tracking-widest">{countdownLabel}</p>
            <CountdownTimer targetDate={countdownTarget} size="md" />
          </div>
        )}
      </AnimateOnScroll>
    </section>
  );
}
