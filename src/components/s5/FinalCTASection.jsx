import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT5 } from '../../data/season5';
import { useSeason5Status, COPY5 } from '../../hooks/useSeason5Status';
import { useApplicantCount } from '../../hooks/useApplicantCount';
import SpotsBadge from '../s2/SpotsBadge';

export default function FinalCTASection({ onCTA }) {
  const status = useSeason5Status();
  const copy = COPY5[status];
  const isUpcoming = status === 'upcoming';
  const count = useApplicantCount(status === 'official', COHORT5.cohortCode);
  const showCountdown = status !== 'closed';
  const countdownTarget = isUpcoming ? COHORT5.officialOpen : COHORT5.officialDeadline;
  const countdownLabel = isUpcoming ? '모집 오픈까지' : '마감까지';

  return (
    <section className="px-6 py-16 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        {/* 히어로와 같은 언어로 닫는다 — 상위 1% · 혼자 80% 포기 / 함께 97% 성공. */}
        <h2 className="font-kr text-3xl md:text-5xl font-black text-text-primary leading-tight text-center mb-3">
          상위 1%로 가는<br />첫 21일
        </h2>
        <p className="text-accent-green text-xl md:text-2xl font-black text-center mb-8 break-keep">
          혼자 하면 80%가 포기<br />함께하면 97% 성공
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
