// [621] 시즌4 랜딩 헤드리스 스샷 — 아카이브 라우트 회귀 확인 포함.
// 실행: node e2e/621-shot.mjs   (dev 서버 5173 떠 있어야 함)
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const OUT = 'e2e';

const shots = [
  { path: '/', file: '621-s4-full.png', vp: { width: 430, height: 932 } },
  { path: '/', file: '621-s4-mobile.png', vp: { width: 375, height: 812 } },
  { path: '/', file: '621-s4-desktop.png', vp: { width: 1280, height: 900 } },
  { path: '/preseason', file: '621-preseason.png', vp: { width: 375, height: 812 } },
  { path: '/s2', file: '621-s2.png', vp: { width: 375, height: 812 } },
];

const browser = await chromium.launch();
const errors = [];

for (const s of shots) {
  // 페이지가 2만px 넘게 길어서 2x로 뜨면 파일이 10MB+ — 리포에 넣기엔 과함. 1x로 고정.
  const page = await browser.newPage({ viewport: s.vp, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => errors.push(`${s.path} :: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`${s.path} console :: ${m.text()}`); });

  // 헤드리스 빠른 스크롤에서는 IntersectionObserver reveal이 일부 블록에서 안 열려
  // 빈 칸으로 찍힌다(시즌2 페이지도 동일). 스샷에서는 reveal 게이트와 lazy 이미지를 풀어둔다.
  await page.addStyleTag({ content: '.opacity-0{opacity:1 !important}' }).catch(() => {});
  await page.goto(BASE + s.path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: '.opacity-0{opacity:1 !important}' });
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((i) => { i.loading = 'eager'; });
    const step = window.innerHeight * 0.5;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUT}/${s.file}`, fullPage: true });
  const h1 = await page.locator('h1').first().innerText().catch(() => '(no h1)');
  console.log(`${s.path} → ${s.file}  h1="${h1.replace(/\n/g, ' ')}"`);
  await page.close();
}

await browser.close();
if (errors.length) {
  console.log('\n--- PAGE/CONSOLE ERRORS ---');
  errors.forEach((e) => console.log(e));
} else {
  console.log('\nno page errors');
}
