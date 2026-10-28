import AnimateOnScroll from '../ui/AnimateOnScroll';
import Button from '../ui/Button';
import { useSeason7Status, COPY7 } from '../../hooks/useSeason7Status';
import { COHORT7, PROGRAM7, REFUND7, CTA_LABEL7 } from '../../data/season7';

// 시즌7 오퍼 — 90일 하프 프로그램의 첫 28일 = 1만원 체험 (가인 2026-10-27).
// 참가비 1만원 · 환급 없음. 보증금·환급·몰수 표현은 쓰지 않는다(PG 정책).
// 무엇을 받는지(포함 내역) + 환불 기준 한 줄을 여기서 밝힌다 — 결제 페이지(/s7/join)와 같은 내용.
const INCLUDES = [
  { icon: '👟', title: '레벨 맞춤 28일 러닝 프로그램', desc: '지원할 때 레벨 테스트 · 출발점에 맞게' },
  { icon: '👥', title: `${COHORT7.teamSize}인 1팀 배정`, desc: '앱 인증 피드 · 팀 점수 · 응원' },
  { icon: '💬', title: '단톡방 + 주간 라이브 점검', desc: `온라인 OT ${COHORT7.otDate} ${COHORT7.otTime}` },
  { icon: '🏁', title: `파이널 ${PROGRAM7.finalDistanceKm}km 테스트`, desc: `${COHORT7.finalDate} · 각자 동네에서` },
];

export default function PricingSection({ onCTA }) {
  const status = useSeason7Status();
  const copy = COPY7[status];

  return (
    <section className="px-6 py-14 max-w-lg mx-auto text-center">
      <AnimateOnScroll>
        <h2 className="font-sans font-normal text-[34px] leading-[1.2] text-text-primary break-keep">
          90일 중 첫 {COHORT7.trialDays}일<br />
          <span className="text-accent-green">{PROGRAM7.feeLabel}으로 체험해</span>
        </h2>
        <p className="text-text-secondary text-[15px] font-bold mt-2.5 break-keep">
          커피 두 잔 값으로 28일 동안 매일 뛰는 사람이 돼
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-bg-card rounded-[20px] p-5 mt-6 text-left shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <div className="flex items-baseline justify-between border-b border-black/10 pb-3 mb-3">
            <p className="text-card-ink font-black text-[15px]">시즌7 · {COHORT7.startDate} - {COHORT7.finalDate}</p>
            <p className="text-card-ink font-black text-[22px]">{PROGRAM7.fee.toLocaleString()}원</p>
          </div>
          <ul className="space-y-2.5">
            {INCLUDES.map((it) => (
              <li key={it.title} className="flex items-start gap-2.5">
                <span className="text-lg leading-none mt-0.5">{it.icon}</span>
                <div>
                  <p className="text-card-ink font-bold text-sm leading-tight">{it.title}</p>
                  <p className="text-card-ink-muted text-xs mt-0.5">{it.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll>
        <Button
          onClick={onCTA}
          className="w-full mt-6 shadow-[0_12px_40px_rgba(200,255,77,0.4)] flex flex-col items-center justify-center leading-tight"
        >
          <span className="block">{status === 'official' ? CTA_LABEL7 : copy.cta.pricing}</span>
          <span className="block text-[11px] font-bold opacity-80 mt-1 tracking-wide">{copy.ctaSub}</span>
        </Button>
        <p className="text-text-muted text-xs font-semibold mt-4 break-keep">
          자동 결제 없음 · {REFUND7.summary}
        </p>
      </AnimateOnScroll>
    </section>
  );
}
