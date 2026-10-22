import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import { useSeason6Status, COPY6 } from '../../hooks/useSeason6Status';
import { COHORT6, PROGRAM6, CTA_LABEL6 } from '../../data/season6';

// 시즌6 오퍼 — 90일 프로그램의 첫 28일 무료 체험 + 보증금 1만원 (가인 2026-10-22 "돈이 걸려야 제대로 한다").
// 보증금을 처음 밝히는 자리 = 여기와 지원서(가인 결정). 버튼은 "무료로 시작하기".
// 시즌5 v2 보증금 섹션(s5v2/PricingSection)과 같은 두 칸: 해내면 전액 환급 / 포기하면 몰수.
// 환급은 결제 취소(같은 카드로) — 카드로 받은 돈을 계좌로 돌려주지 않는다.
// 조건 표기는 "28일 중 25일 이상 인증" 하나만. 파이널 5K 완주 조건은 FAQ·환불정책에서 안내.
export default function PricingSection({ onCTA }) {
  const status = useSeason6Status();
  const copy = COPY6[status];
  const isUpcoming = status === 'upcoming';

  return (
    <section className="px-6 py-14 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="font-sans font-normal text-[34px] leading-[1.2] text-text-primary break-keep">
          첫 28일은 무료지만<br />
          <span className="text-accent-green">보증금 {PROGRAM6.depositLabel}을 받아</span>
        </h2>
        <p className="text-text-secondary text-[15px] font-bold mt-2.5 break-keep">
          공짜면 안 뛰어. 돈이 걸려야 제대로 해
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="grid grid-cols-2 gap-2 mt-6">
          <div className="rounded-[20px] bg-accent-green text-bg-primary px-2.5 py-4">
            <p className="text-2xl leading-none">✅</p>
            <p className="text-sm font-black mt-1.5">해내면</p>
            <p className="font-sans font-normal text-[22px] leading-tight mt-0.5">전액 환급</p>
            <p className="text-[11px] font-bold opacity-70 mt-1">{COHORT6.durationDays}일 중 {PROGRAM6.successDays}일 이상 인증</p>
          </div>
          <div className="rounded-[20px] border-2 border-accent-orange px-2.5 py-4">
            <p className="text-2xl leading-none">❌</p>
            <p className="text-sm font-black mt-1.5 text-accent-orange">포기하면</p>
            <p className="font-sans font-normal text-[22px] leading-tight mt-0.5 text-accent-orange">{PROGRAM6.depositLabel} 몰수</p>
            <p className="text-[11px] font-bold text-text-muted mt-1">중간에 그만두면</p>
          </div>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <Button
          onClick={onCTA}
          disabled={isUpcoming}
          className="w-full mt-6 shadow-[0_12px_40px_rgba(200,255,77,0.4)] flex flex-col items-center justify-center leading-tight"
        >
          <span className="block">{status === 'official' ? CTA_LABEL6 : copy.cta.pricing}</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
        </Button>
        <p className="text-text-muted text-xs font-semibold mt-3 break-keep">
          못 뛰는 날 {PROGRAM6.passCount}번은 봐줌 · 체험 끝나도 자동 결제 없음 · OT 전까지 취소하면 전액 환불
        </p>
      </AnimateOnScroll>
    </section>
  );
}
