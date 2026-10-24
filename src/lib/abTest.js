// 첫 화면(히어로) A/B — 261019_team_run_season6.
//   A = 기존 "생애 첫 하프마라톤 완주하고 / 인생 최고의 몸 / 90일 안에 만들자" + 25일 막대가 버튼 위
//   B = "90일 안에 완성하는 / 인생 최고의 몸 / 하프 뛰면 저절로 따라온다" + 막대를 버튼 아래로
//   시안 SOT: design-references/s6-hero-90d-3.html ① (가인 2026-10-25)
//
// 브라우저마다 한 번 무작위 배정 → localStorage 에 고정(다시 와도 같은 화면).
// 방문 기록(landing_events.variant)과 지원서(applications.hero_variant)에 같이 남겨 /stats 에서 비교한다.
// ?ab=A / ?ab=B 로 열면 그 화면을 강제로 본다(미리보기·스샷용, 저장 안 함).
const KEY = 'ttr_ab_hero6';
const VARIANTS = ['A', 'B'];

export function heroVariant() {
  try {
    const forced = new URLSearchParams(location.search).get('ab');
    if (VARIANTS.includes(forced)) return forced;
    let v = localStorage.getItem(KEY);
    if (!VARIANTS.includes(v)) {
      v = Math.random() < 0.5 ? 'A' : 'B';
      localStorage.setItem(KEY, v);
    }
    return v;
  } catch {
    return 'A'; // 저장소가 막힌 브라우저는 기존 화면
  }
}
