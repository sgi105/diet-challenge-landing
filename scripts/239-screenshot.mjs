import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const OUT = '/tmp/239-screenshots';
mkdirSync(OUT, { recursive: true });

const PORT = process.env.PORT || 5186;
const URL = `http://localhost:${PORT}/`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

// Season0ResultsSection 까지 스크롤
await page.evaluate(() => {
  const h2s = Array.from(document.querySelectorAll('h2'));
  const target = h2s.find((h) => /혼자였으면|30명|REAL DATA/.test(h.textContent));
  if (target) target.scrollIntoView({ block: 'start' });
});
await page.waitForTimeout(1200);

// 전체 섹션 캡처: 가장 가까운 <section> 요소
const sectionHandle = await page.evaluateHandle(() => {
  const h2s = Array.from(document.querySelectorAll('h2'));
  const target = h2s.find((h) => /혼자였으면|30명|REAL DATA/.test(h.textContent));
  return target ? target.closest('section') : null;
});
const section = sectionHandle.asElement();
if (section) {
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await section.screenshot({ path: resolve(OUT, 'full-section.png') });
  console.log('✓ full-section.png');
}

// PhotoGrid 캡처: data-testid 안 박았으니 텍스트로 찾기
const gridHandle = await page.evaluateHandle(() => {
  const ps = Array.from(document.querySelectorAll('p'));
  const target = ps.find((p) => p.textContent.includes('인증샷 그리드'));
  if (!target) return null;
  // 가장 가까운 카드 (bg-bg-card)
  return target.closest('.bg-bg-card');
});
const grid = gridHandle.asElement();
if (grid) {
  await grid.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await grid.screenshot({ path: resolve(OUT, 'photo-grid.png') });
  console.log('✓ photo-grid.png');
}

// 데스크탑 뷰 (3열)
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const page2 = await ctx2.newPage();
await page2.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
const grid2 = await page2.evaluateHandle(() => {
  const ps = Array.from(document.querySelectorAll('p'));
  const target = ps.find((p) => p.textContent.includes('인증샷 그리드'));
  return target ? target.closest('.bg-bg-card') : null;
});
const g2 = grid2.asElement();
if (g2) {
  await g2.scrollIntoViewIfNeeded();
  await page2.waitForTimeout(600);
  await g2.screenshot({ path: resolve(OUT, 'photo-grid-desktop.png') });
  console.log('✓ photo-grid-desktop.png');
}

await browser.close();
console.log('done →', OUT);
