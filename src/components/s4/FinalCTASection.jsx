import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT4 } from '../../data/season4';
import { useSeason4Status, COPY4 } from '../../hooks/useSeason4Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import SpotsBadge from '../s2/SpotsBadge';

export default function FinalCTASection({ onCTA }) {
  const status = useSeason4Status();
  const copy = COPY4[status];
  const isUpcoming = status === 'upcoming';
  const count = useApplicantCount(status === 'official', COHORT4.cohortCode);
  const showCountdown = status !== 'closed';
  const countdownTarget = isUpcoming ? COHORT4.officialOpen : COHORT4.officialDeadline;
  const countdownLabel = isUpcoming ? '모집 오픈까지' : '마감까지';

  return (
    <section className="px-6 py-16 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-text-primary leading-tight text-center mb-3">
          혼자선 맨날 실패한 러닝
        </h2>
        <p className="text-accent-green text-xl md:text-2xl font-black text-center mb-8">
          30명 중 30명 전원 성공한 미친 결과
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="space-y-3 mb-8">
          <p className="text-accent-green font-extrabold text-xl break-keep">
            21일 뒤에 5K를 뛰고 있는 사람
          </p>
          <p className="text-text-muted font-bold tracking-widest text-xs">OR</p>
          <p className="text-accent-orange font-extrabold text-xl break-keep">
            "다음 달부터 뛰어야지" 미루는 사람
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <p className="text-text-secondary mb-2 leading-relaxed">
          어차피 시작해야 할 러닝이야.
        </p>
        <p className="text-text-primary font-bold text-lg mb-3">
          팀이 있을 때 시작해.
        </p>
        <p className="text-text-muted text-[13px] font-semibold mb-8 break-keep">
          30자리뿐이고, 지원서 읽고 같이 갈 사람만 뽑아.
        </p>

        {status === 'official' && <SpotsBadge count={count} className="mb-5" />}
        <Button onClick={onCTA} disabled={isUpcoming} className="animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] inline-flex flex-col items-center justify-center leading-tight">
          <span className="block">{copy.cta.final}</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
        </Button>

        {showCountdown && (
          <div className="mt-5">
            <p className="text-text-muted text-[11px] mb-2 font-bold tracking-widest">{countdownLabel}</p>
            <CountdownTimer targetDate={countdownTarget} size="md" />
          </div>
        )}
      </AnimateOnScroll>
    </section>
  );
}
