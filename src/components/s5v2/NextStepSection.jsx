import AnimateOnScroll from '../ui/AnimateOnScroll';
import { NEXT_STEP } from '../../data/season5v2';
import { COHORT5, PROGRAM5 } from '../../data/season5';

// v2 신규 — 21일이 어디로 이어지는지 닫아주는 자리.
// 21일과 90일은 하나의 111일 프로그램이 아니라 별개의 두 단계다. 여기서 파는 건 21일뿐이고,
// 90일은 "이어서 할 수 있는 다음 단계"로만 보여준다.
//
// 21일을 정당화하는 논리는 선발/시험이 아니라 순서다:
// 90일 훈련을 소화하려면 기초 체력과 빠지지 않는 습관이 먼저 있어야 한다.
//
// 가격(50만원)은 쓰지 않는다 — 지금 결정할 건 21일이고, 금액을 미리 꺼내면 판단만 흐려진다.
export default function NextStepSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="font-kr text-3xl md:text-5xl font-black text-center mb-8 text-text-primary leading-tight break-keep">
          21일 다음은 본격적인<br />
          <span className="text-accent-orange">하프마라톤 훈련</span>
        </h2>
      </AnimateOnScroll>

      <AnimateOnScroll animation="animate-scale-in">
        <div className="bg-bg-card rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.15)]">
          <p className="text-card-ink-faint text-[10px] font-extrabold tracking-widest mb-2">STEP 2</p>
          <h3 className="font-kr text-xl font-black text-card-ink mb-1.5 break-keep">
            {NEXT_STEP.title}
          </h3>
          <p className="text-card-ink-muted text-sm font-bold mb-5 break-keep">
            {NEXT_STEP.goal}
          </p>

          <div className="space-y-2">
            {NEXT_STEP.weeks.map((w) => (
              <div key={w.label} className="flex items-center gap-3 rounded-xl bg-bg-primary/5 px-4 py-3">
                <span className="text-[11px] font-extrabold tracking-wide text-bg-primary shrink-0 w-14">
                  {w.label}
                </span>
                <span className="text-card-ink-muted text-[13px] font-bold break-keep">{w.desc}</span>
              </div>
            ))}
          </div>

          <p className="text-card-ink-faint text-xs font-semibold mt-5 leading-relaxed break-keep">
            21일 끝나고 이어서 하고 싶은 사람만. 지금 결정할 건 아니야.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-7">
        <p className="text-text-primary text-center text-lg font-kr font-black leading-tight break-keep">
          {COHORT5.durationDays}일로 습관을 만들고,<br />
          90일로 <span className="text-accent-green">하프마라톤을 완주해</span>
        </p>
      </AnimateOnScroll>
    </section>
  );
}
