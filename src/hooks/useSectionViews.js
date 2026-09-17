import { useEffect } from 'react';
import { logEvent, once } from '../lib/eventLog';

// 랜딩 섹션 도달 추적 — "어느 섹션까지 내려왔다가 나갔는지"를 보기 위한 훅.
// 페이지의 <section>을 전부 관찰해서, 섹션 윗부분이 화면 위쪽 60% 안으로 들어오면
// (=실제로 읽기 시작한 지점) 세션당 1번 section_view를 남긴다. 섹션 이름은 placement 칸에.
//
// 섹션 컴포넌트마다 감싸지 않고 상단 pill 라벨로 이름을 붙인다.
// 이유: 랜딩 파일(LandingPageS5)은 여러 작업이 동시에 드나드는 파일이라 건드리는 범위를 최소화.
// 비율(threshold) 기준은 쓰지 않는다 — 화면보다 3배 긴 섹션은 30%가 절대 안 보여서 영영 안 찍힌다.

// 순서 주의: 'AFTER 21 DAYS'가 '21 DAYS'보다 먼저 검사돼야 한다.
const PILL_KEYS = [
  ['REAL TALK', 'pain'],
  ['THE SYSTEM', 'system'],
  ['THE GAME', 'game'],
  ['AFTER 21 DAYS', 'benefits'],
  ['21 DAYS', 'pace'],
  ['REAL VOICES', 'voices'],
  ['LIVE', 'live'],
  ['FOR ALL LEVELS', 'levels'],
  ['REWARD', 'reward'],
  ['BONUS', 'bonus'],
  ['DEPOSIT', 'pricing'],
  ['FOUNDER', 'founder'],
  ['DEADLINE', 'urgency'],
  ['OPENS SOON', 'urgency'],
  ['FAQ', 'faq'],
];

function keyOf(section) {
  if (section.id === 'hero') return 'hero';
  const pill = section.querySelector('.pill');
  const label = (pill?.textContent || '').trim().toUpperCase();
  if (label) {
    const hit = PILL_KEYS.find(([p]) => label.startsWith(p));
    if (hit) return hit[1];
  }
  // 최종 CTA는 pill이 없다 — 페이지 마지막 섹션을 최종으로 본다.
  const all = document.querySelectorAll('section');
  if (section === all[all.length - 1]) return 'final';
  return null; // 중간 CTA 버튼 띠 등은 추적하지 않는다
}

export function useSectionViews() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    // 자식 섹션이 전부 마운트된 뒤에 잡도록 한 프레임 미룬다.
    let io;
    const id = requestAnimationFrame(() => {
      const named = Array.from(document.querySelectorAll('section'))
        .map((el) => [el, keyOf(el)])
        .filter(([, k]) => k);
      if (!named.length) return;
      const names = new Map(named);
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const name = names.get(e.target);
            if (name && once(`section_${name}`)) logEvent('section_view', { placement: name });
            io.unobserve(e.target);
          }
        },
        { threshold: 0, rootMargin: '0px 0px -40% 0px' }
      );
      named.forEach(([el]) => io.observe(el));
    });
    return () => {
      cancelAnimationFrame(id);
      io?.disconnect();
    };
  }, []);
}
