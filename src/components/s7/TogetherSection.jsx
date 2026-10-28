import AnimateOnScroll from '../ui/AnimateOnScroll';
import TogetherMockups from './TogetherMockups';

// 같이 하면 되는 이유 4개(팀 배정 · 응원 · 책임감 · 팀 우승) 앱 화면.
// "같이 하면, 결국 하게 돼" 제목은 공감 섹션 그래프 위로 옮겼다(가인 2026-09-19). 순서: 공감(제목+그래프) → 후기 → 이 섹션.
export default function TogetherSection() {
  return (
    <section className="px-6 py-14 max-w-lg mx-auto">
      <AnimateOnScroll>
        <h2 className="font-sans font-normal text-[32px] leading-[1.2] text-text-primary mb-6 break-keep">
          <span className="text-accent-green">TARZAN</span>은<br />
          할 수밖에 없는 환경이야
        </h2>
      </AnimateOnScroll>
      <TogetherMockups />
    </section>
  );
}
