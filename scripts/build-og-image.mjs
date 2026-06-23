// Generates /public/og-image.png (1200x630) using system Chrome via puppeteer-core.
// Run: node scripts/build-og-image.mjs

import puppeteer from 'puppeteer-core';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const outPath = path.join(projectRoot, 'public', 'og-image.png');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    font-family: "Pretendard Variable", "Pretendard", -apple-system, sans-serif;
    background: #1e3cff;
    color: #fff;
    overflow: hidden;
    position: relative;
    background-image:
      linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
    background-size: 60px 60px;
  }
  .glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
    height: 800px;
    background: rgba(200, 255, 77, 0.12);
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
  }
  .container {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: 70px 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .top-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    padding: 12px 22px;
    border: 2px solid #c8ff4d;
    color: #c8ff4d;
    border-radius: 9999px;
    font-family: "Archivo Black", sans-serif;
    font-size: 18px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .brand {
    color: rgba(255,255,255,0.7);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .center {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  h1 {
    font-weight: 900;
    font-size: 116px;
    line-height: 1.05;
    letter-spacing: -0.035em;
    color: #ffffff;
  }
  h1 .accent {
    color: #c8ff4d;
  }
  .sub {
    font-size: 32px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    letter-spacing: -0.02em;
    margin-top: 8px;
  }
  .bottom-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .bottom-pill {
    display: inline-flex;
    align-items: center;
    padding: 14px 24px;
    background: #ffffff;
    color: #1e3cff;
    border-radius: 9999px;
    font-size: 22px;
    font-weight: 800;
  }
  .bottom-pill.lime {
    background: #c8ff4d;
    color: #1e3cff;
  }
</style>
</head>
<body>
  <div class="glow"></div>
  <div class="container">
    <div class="top-row">
      <span class="pill">21D RUN · TEAM</span>
    </div>

    <div class="center">
      <h1>
        30명 중 30명 전원<br/>
        <span class="accent">성공한 미친 결과</span>
      </h1>
      <p class="sub">참가비 무료 · 4인 1팀 · 선착순 30명</p>
    </div>

    <div class="bottom-row">
      <span class="bottom-pill lime">🏃 지금 모집 중</span>
      <span class="bottom-pill">challenge.samuraihabits.com</span>
    </div>
  </div>
</body>
</html>`;

async function main() {
  // Verify Chrome exists
  try {
    await fs.access(CHROME_PATH);
  } catch {
    throw new Error(`Chrome not found at: ${CHROME_PATH}`);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // 폰트 로딩 시간 추가 확보
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({
      path: outPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
    console.log(`✅ Generated: ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error('❌ OG image generation failed:', e);
  process.exit(1);
});
