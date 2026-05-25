import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import CountdownTimer from '../ui/CountdownTimer';
import { COHORT } from '../../data/config';
import { useCohortStatus, COPY, COPY_REFERRAL } from '../../hooks/useCohortStatus';

export default function FinalCTASection({ onCTA, variant = 'main' }) {
  const status = useCohortStatus(variant);
  const copy = (variant === 'referral' ? COPY_REFERRAL : COPY)[status];
  const isClosed = status === 'closed';
  const isPreopen = status === 'preopen';
  const deadline = variant === 'referral' ? COHORT.referralDeadline : COHORT.deadline;
  const countdownTarget = isPreopen ? COHORT.applyOpenAt : deadline;
  return (
    <section className="px-6 py-16 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black mb-8 leading-tight text-text-primary">
          21일 후, 당신은<br />두 사람 중 하나야.
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <div className="space-y-3 mb-8">
          <p className="text-accent-green font-extrabold text-xl">
            러닝 습관이 만들어진 진짜 러너
          </p>
          <p className="text-text-muted font-bold tracking-widest text-xs">OR</p>
          <p className="text-accent-orange font-extrabold text-xl">
            "다음 달부터 뛰어야지" 미루는 사람
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <p className="text-text-secondary mb-2 leading-relaxed">
          어차피 시작해야 할 러닝이야.
        </p>
        <p className="text-text-primary font-bold text-lg mb-8">
          팀이 있을 때 시작해.
        </p>

        <Button onClick={onCTA} className="animate-pulse-glow shadow-[0_12px_40px_rgba(200,255,77,0.4)] inline-flex flex-col items-center justify-center leading-tight">
          <span className="block">{copy.cta.final}</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
        </Button>

        {isClosed ? (
          <>
            <p className="text-text-muted text-sm mt-4 font-semibold">
              시즌 1 신청 마감 · 다음 기수 우선 안내
            </p>
            <p className="text-text-muted text-[11px] mt-2 font-semibold">
              6/1(월) 시작 · 5K 파이널 6/21(일)
            </p>
          </>
        ) : isPreopen ? (
          <>
            <p className="text-text-muted text-sm mt-4 font-semibold">
              5/25(월) 18:00 오픈 · 선착순 30명
            </p>
            <div className="mt-5">
              <p className="text-text-muted text-[11px] mb-2 font-bold tracking-widest">OPENS IN · 신청 오픈까지</p>
              <CountdownTimer targetDate={countdownTarget} size="md" />
            </div>
            <p className="text-text-muted text-[11px] mt-3 font-semibold">
              6/1(월) 시작 · 5K 파이널 6/21(일)
            </p>
          </>
        ) : (
          <>
            <p className="text-text-muted text-sm mt-4 font-semibold">
              팀 우승 시 20만 환급 + 러닝화 · 30명 한정 · 6/1(월) 시작
            </p>
            <div className="mt-5">
              <p className="text-text-muted text-[11px] mb-2 font-bold tracking-widest">DEADLINE · 마감까지</p>
              <CountdownTimer targetDate={countdownTarget} size="md" />
            </div>
          </>
        )}
      </AnimateOnScroll>
    </section>
  );
}
