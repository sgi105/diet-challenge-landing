import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT6, CTA_LABEL6 } from '../../data/season6';
import { PROOF } from '../../data/season5v2';
import { useSeason6Status, COPY6 } from '../../hooks/useSeason6Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import SpotsBadge from '../s2/SpotsBadge';

// v2 최종 신청 — 히어로와 같은 말로 닫는다(가인 2026-09-19 "나머지와 통일감").
// v1(s5/FinalCTASection)은 옛 히어로 문구("상위 1%로 가는 첫 21일")와 옛 숫자(80% 포기 / 97% 성공)라
// v2의 헤드라인·그래프(혼자 25% vs 함께 96%)와 어긋났다.
//   제목 = 히어로 3줄 그대로 · 숫자 = 공감 섹션 그래프와 같은 값 · 선택지 = 페이지 첫 줄(새해 작심삼일)로 되돌아가기
export default function FinalCTASection({ onCTA }) {
  const status = useSeason6Status();
  const copy = COPY6[status];
  const isUpcoming = status === 'upcoming';
  const isOfficial = status === 'official';
  const count = useApplicantCount(isOfficial, COHORT6.cohortCode);
  const showCountdown = status !== 'closed';
  const countdownTarget = isUpcoming ? COHORT6.officialOpen : COHORT6.officialDeadline;
  const countdownLabel = isUpcoming ? '모집 오픈까지' : '마감까지';

  return (
    <section className="px-6 py-16 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="v2-keep break-keep">
          <span className="block font-kr text-[19px] font-black text-text-secondary leading-snug">
            생애 첫 <span className="text-accent-green">하프마라톤</span> 완주하고
          </span>
          <span
            className="block font-sans font-normal text-[44px] text-accent-green leading-[1.1] mt-2"
            style={{ textShadow: '0 0 32px rgba(200,255,77,0.45)' }}
          >
            인생 최고의 몸
          </span>
          <span className="block font-sans font-normal text-[31px] text-text-primary leading-[1.2] mt-1">
            90일 안에 만들자
          </span>
        </h2>
      </AnimateOnScroll>

      {/* 두 갈래 막대 도식(가인 2026-10-22 "위랑 비슷하게 도식으로") — 숫자 줄 + "OR" 두 문장을 그림 하나로 합쳤다.
          막대 높이 = 공감 섹션 그래프와 같은 값(혼자 25% · 함께 96%). 막대 밑 이름표가 곧 결말. */}
      <AnimateOnScroll className="mt-8 mb-10">
        <div className="bg-white/[0.06] border border-white/15 rounded-[20px] px-4 pt-5 pb-4">
          <p className="text-text-primary text-[15px] font-black mb-4">한 달 뒤 너는 어느 쪽이야?</p>
          <div className="flex items-end justify-center gap-5">
            <div className="w-28 flex flex-col items-center">
              <span className="font-display text-[24px] leading-none text-white/60 tabular-nums mb-2">{PROOF.soloSuccessRate}%</span>
              <div className="w-full rounded-t-md bg-white/30" style={{ height: 150 * PROOF.soloSuccessRate / 100 }} />
            </div>
            <div className="w-28 flex flex-col items-center">
              <span className="font-display text-[34px] leading-none text-accent-green tabular-nums mb-2">{PROOF.consistencyRate}%</span>
              <div className="w-full rounded-t-md bg-accent-green" style={{ height: 150 * PROOF.consistencyRate / 100 }} />
            </div>
          </div>
          <div className="h-[2px] bg-white/30" />
          <div className="flex items-start justify-center gap-5 mt-2.5">
            <div className="w-28">
              <p className="text-text-muted text-[11px] font-extrabold">혼자 하면</p>
              <p className="text-accent-orange text-[13px] font-black leading-snug mt-1 break-keep">내년 새해에<br />또 결심</p>
            </div>
            <div className="w-28">
              <p className="text-text-muted text-[11px] font-extrabold whitespace-nowrap">TARZAN에서 함께</p>
              <p className="text-accent-green text-[13px] font-black leading-snug mt-1 break-keep">하프마라톤<br />까지</p>
            </div>
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        {isOfficial && <SpotsBadge count={count} className="mb-5" />}
        <Button
          onClick={onCTA}
          disabled={isUpcoming}
          className="w-full animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] flex flex-col items-center justify-center leading-tight"
        >
          <span className="block">{isOfficial ? CTA_LABEL6 : copy.cta.final}</span>
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
