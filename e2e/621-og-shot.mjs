// [621] 시즌4 OG 이미지 렌더 — e2e/621-og-image.html → public/og-image.png (2400x1260)
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 2400, height: 1260 } });
await p.goto('file://' + process.cwd() + '/e2e/621-og-image.html', { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);
await p.screenshot({ path: 'public/og-image.png' });
await b.close();
console.log('public/og-image.png 갱신');
