import AnimateOnScroll from '../ui/AnimateOnScroll';
import { PROOF, PAIN_MEDIA } from '../../data/season5v2';

// v2 공감 섹션 — 가인 문구(2026-09-18) 그대로.
// 흐름: 작심삼일 공감 → 나도 그랬다 → 원인은 '혼자' → 숫자로 확인(혼자 vs 함께).
// 원인(혼자) → "같이 하면, 결국 하게 돼" 제목 → 그래프. 이유 4개 앱 화면은 TogetherSection(후기 다음).
//
// 비교 그래프 — 시안 SOT: design-references/s5v2-bars-3x5.html ③-A 변형
// 세로 막대 두 개(같은 척도 0-100%, 높이 = 값). 퍼센트는 막대 위, 이름표는 기준선 아래:
// 제목 "새로운 습관 한 달 유지할 확률". 왼쪽 "혼자 하면", 오른쪽 "TARZAN에서 함께 하면 누적 90명" — 90명이 오른쪽 막대의 이름표(가인 요청).
// ⚠️ 제목은 "한 달"인데 TARZAN 쪽은 21일 완주율 — 출처 줄에 "21일 챌린지 완주율"로 명시해 둔다.
// 혼자(25% · 한 달)와 함께(96% · 21일)는 측정 방식이 다르다 — 출처와 기준은 맨 아래 작은 글씨로.
const BAR_MAX = 170; // 100%일 때 막대 높이(px)

function CompareChart() {
  return (
    <figure
      className="bg-white/[0.06] border border-white/15 rounded-[20px] p-[18px]"
      role="img"
      aria-label={`새로운 습관 한 달 유지할 확률. 혼자 하면 ${PROOF.soloSuccessRate}%, TARZAN에서 함께 하면 ${PROOF.consistencyRate}% (누적 ${PROOF.newTotal}명)`}
    >
      <p className="text-text-primary text-base font-black text-center mb-4 break-keep">새로운 습관 한 달 유지할 확률</p>
      <div className="flex items-end justify-center gap-6">
        <div className="w-24 flex flex-col items-center">
          <span className="font-display text-[26px] leading-none text-white/60 tabular-nums mb-2">{PROOF.soloSuccessRate}%</span>
          <div className="w-full rounded-t-md bg-white/35" style={{ height: BAR_MAX * PROOF.soloSuccessRate / 100 }} />
        </div>
        <div className="w-28 flex flex-col items-center">
          <span className="font-display text-[38px] leading-none text-accent-green tabular-nums mb-2">{PROOF.consistencyRate}%</span>
          <div className="w-full rounded-t-md bg-accent-green" style={{ height: BAR_MAX * PROOF.consistencyRate / 100 }} />
        </div>
      </div>
      <div className="h-[2px] bg-white/30" />
      {/* 두 라벨 첫 줄을 같은 높이·같은 크기로 (위쪽 정렬) */}
      <div className="flex items-start justify-center gap-6 mt-2.5 text-center">
        <p className="w-24 text-text-secondary text-[12px] font-extrabold leading-normal">혼자 하면</p>
        <div className="w-28">
          <p className="text-text-secondary text-[12px] font-extrabold leading-normal whitespace-nowrap">TARZAN에서 함께 하면</p>
          {/* 누적 인원 배지 — 전역 .pill(머리표)은 v2에서 숨겨지므로 클래스 이름을 쓰지 않는다 */}
          <span className="inline-flex items-center mt-1.5 rounded-full bg-accent-green text-bg-primary px-3 py-1 text-[13px] font-black whitespace-nowrap">
            누적 {PROOF.newTotal}명
          </span>
        </div>
      </div>

      <figcaption className="text-text-muted text-[10px] font-medium leading-relaxed mt-3.5 pt-2.5 border-t border-white/10 break-keep">
        혼자 하면: {PROOF.soloBasis} · {PROOF.soloSource}<br />
        TARZAN: 21일 챌린지 완주율 · 러닝 챌린지 {PROOF.cohortCount}개 기수 누적 · 처음 참가한 사람 기준
      </figcaption>
    </figure>
  );
}

// "나도 똑같았어." 밑 리액션 영상 — 소리 없이 자동 반복. 파일 없으면 자리 표시.
function ShakeClip() {
  if (!PAIN_MEDIA.src) {
    return (
      <div className="w-3/5 aspect-[4/5] mt-4 rounded-2xl border-2 border-dashed border-white/25 bg-white/5 flex items-center justify-center">
        <span className="text-text-muted text-[11px] font-bold">절레절레 영상</span>
      </div>
    );
  }
  return (
    <video
      src={PAIN_MEDIA.src}
      poster={PAIN_MEDIA.poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="w-3/5 aspect-[4/5] mt-4 rounded-2xl object-cover bg-bg-deep shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
    />
  );
}

export default function PainPointSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <p className="text-text-secondary text-base font-bold break-keep">
          새해마다 "이번엔 진짜 운동 꾸준히 해야지" 하고
        </p>
        <h2 className="font-kr text-3xl md:text-5xl font-black mt-2 text-text-primary leading-tight break-keep">
          작심삼일 몇 번째야?
        </h2>
        <p className="text-text-secondary mt-4">나도 똑같았어.</p>
        <ShakeClip />
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-10">
        <p className="text-text-secondary leading-relaxed">근데 이건 네 의지 문제가 아니라</p>
        <p className="text-text-primary text-2xl font-kr font-black leading-tight mt-1">
          <span className="text-accent-green">혼자</span> 했기 때문이야.
        </p>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-10">
        {/* 시안 SOT: design-references/s5v2-together-title.html B — 원인("같이 하면")과 결과("결국 하게 돼")를
            같은 크기 굵은 제목체로 두 줄. (가운데 조건 문장은 뺐다 — "환경"은 다음 섹션 제목이 맡음) */}
        <p className="font-sans font-normal text-[42px] leading-[1.1] text-text-primary">같이 하면,</p>
        <p className="font-sans font-normal text-[42px] leading-[1.1] text-accent-green mt-1">결국 하게 돼.</p>
      </AnimateOnScroll>

      <AnimateOnScroll className="mt-6">
        <CompareChart />
      </AnimateOnScroll>

    </section>
  );
}
