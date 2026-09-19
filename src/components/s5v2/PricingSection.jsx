import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import { useSeason5Status, COPY5 } from '../../hooks/useSeason5Status';
import { COHORT5, PROGRAM5 } from '../../data/season5';
import { CTA_LABEL_V2 } from '../../data/season5v2';

// v2 보증금 — 시안 SOT: design-references/s5v2-deposit-5.html ⑤ (가인 2026-09-19)
// 이전 버전은 설명 문단 · 환급 박스 · 포함 내역 5줄까지 있어서 너무 복잡했다.
// "참가비 0원 → 대신 보증금 → 해내면 환급 / 포기하면 몰수" 두 칸으로 끝낸다.
// 이 두 칸이 v1의 "일어날 수 있는 건 딱 3가지"(MoneyMechanic)와 같은 얘기라 v2에선 그 섹션을 뺐다.
// 환급 조건 표기는 "21일 중 18일 이상 인증" 하나만(가인 2026-09-19, 19→18일). 파이널 5K 완주 조건은 FAQ·지원서에서 안내.
// "무료 체험"이라는 말은 쓰지 않는다 — 21일은 체험이 아니라 1단계고, 보증금과 같은 화면에 있어야 신뢰가 산다.

// 완주 기준 인증 일수 — 21일 중 (수행률 85% / 최대 3회 패스) 둘 중 더 엄격한 쪽
const requiredDays = Math.max(
  Math.ceil((COHORT5.durationDays * PROGRAM5.successRate) / 100),
  COHORT5.durationDays - PROGRAM5.passCount
);

export default function PricingSection({ onCTA }) {
  const status = useSeason5Status();
  const copy = COPY5[status];
  const isUpcoming = status === 'upcoming';

  return (
    <section className="px-6 py-14 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="font-sans font-normal text-[34px] leading-[1.2] text-text-primary break-keep">
          참가비는 무료지만<br />
          <span className="text-accent-green">보증금을 받아</span>
        </h2>
        <p className="text-text-secondary text-[15px] font-bold mt-2.5 break-keep">
          끝까지 책임감 있게 할 사람만 와
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="grid grid-cols-2 gap-2 mt-6">
          <div className="rounded-[20px] bg-accent-green text-bg-primary px-2.5 py-4">
            <p className="text-2xl leading-none">✅</p>
            <p className="text-sm font-black mt-1.5">해내면</p>
            <p className="font-sans font-normal text-[22px] leading-tight mt-0.5">전액 환급</p>
            <p className="text-[11px] font-bold opacity-70 mt-1">{COHORT5.durationDays}일 중 {requiredDays}일 이상 인증</p>
          </div>
          <div className="rounded-[20px] border-2 border-accent-orange px-2.5 py-4">
            <p className="text-2xl leading-none">❌</p>
            <p className="text-sm font-black mt-1.5 text-accent-orange">포기하면</p>
            <p className="font-sans font-normal text-[22px] leading-tight mt-0.5 text-accent-orange">{PROGRAM5.depositLabel} 몰수</p>
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
          <span className="block">{status === 'official' ? CTA_LABEL_V2 : copy.cta.pricing}</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
        </Button>
        <p className="text-text-muted text-xs font-semibold mt-3 break-keep">
          못 뛰는 날 {PROGRAM5.passCount}번은 봐줌 · 합격 후 시작 전 전액 환불 가능
        </p>
      </AnimateOnScroll>
    </section>
  );
}
