// 링크 미리보기 이미지 — 요청 때 src/data/linkPreview.js 값으로 그린다(1200x630).
// 디자인 SOT: design-references/og6/og6.html ② · 기수가 바뀌면 데이터만 바꾸면 이미지도 따라 바뀐다.
// 글꼴은 구글 폰트에서 이미지에 쓰는 글자만 받아 쓴다(text= 서브셋) — 가볍고 빠르다.
import { ImageResponse } from '@vercel/og';
import { LINK_PREVIEW, SITE_URL } from '../src/data/linkPreview.js';

export const config = { runtime: 'edge' };

const BG = '#1e3cff';
const GREEN = '#c8ff4d';

async function googleFont(family, weight, text) {
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/);
  if (!src) throw new Error(`font css: ${family}`);
  return (await fetch(src[1])).arrayBuffer();
}

// satori 는 React 없이 {type, props} 객체도 받는다. 자식이 여럿인 div 는 display:flex 필수.
const h = (type, style, children) => ({ type, props: { style, children } });

export function buildTree(origin) {
  const im = LINK_PREVIEW.image;
  const host = SITE_URL.replace(/^https?:\/\//, '');
  return h('div', {
    width: 1200, height: 630, display: 'flex', position: 'relative', background: BG, color: '#fff',
    backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
    backgroundSize: '50px 50px',
  }, [
    // 오른쪽 사진 + 왼쪽으로 번지는 파랑
    h('div', { position: 'absolute', right: 0, top: 0, bottom: 0, width: 470, display: 'flex' }, [
      { type: 'img', props: { src: `${origin}${im.photo}`, width: 470, height: 630, style: { width: 470, height: 630, objectFit: 'cover', objectPosition: 'center 25%' } } },
      h('div', { position: 'absolute', left: 0, top: 0, width: 470, height: 630, display: 'flex', backgroundImage: `linear-gradient(90deg, ${BG} 0%, rgba(30,60,255,0) 35%)` }, []),
    ]),
    h('div', { position: 'absolute', left: 72, top: 64, right: 440, bottom: 56, display: 'flex', flexDirection: 'column' }, [
      h('div', { display: 'flex' }, [
        h('div', { border: `3px solid ${GREEN}`, color: GREEN, borderRadius: 999, padding: '8px 26px', fontSize: 22, fontFamily: 'Noto', fontWeight: 900, letterSpacing: 3 }, im.tag),
      ]),
      h('div', { display: 'flex', marginTop: 34, fontSize: 38, fontFamily: 'Noto', fontWeight: 900, color: 'rgba(255,255,255,0.85)' }, [
        h('span', { color: GREEN }, im.kickerAccent), h('span', { marginLeft: 10 }, im.kicker.trim()),
      ]),
      h('div', { display: 'flex', fontFamily: 'BHS', fontSize: 104, lineHeight: 1.05, marginTop: 6, color: GREEN }, im.headline),
      h('div', { display: 'flex', fontFamily: 'BHS', fontSize: 40, marginTop: 10 }, im.sub),
      h('div', { display: 'flex', marginTop: 34 }, im.chips.map((c) =>
        h('div', { border: '2px solid rgba(255,255,255,0.45)', borderRadius: 999, padding: '8px 20px', marginRight: 12, fontSize: 24, fontFamily: 'Noto', fontWeight: 800 }, c))),
      h('div', { position: 'absolute', left: 0, bottom: 0, display: 'flex', fontSize: 26, fontFamily: 'Noto', fontWeight: 900 }, host),
    ]),
  ]);
}

export default async function handler(req) {
  const origin = new URL(req.url).origin;
  const im = LINK_PREVIEW.image;
  const allText = [im.tag, im.kickerAccent, im.kicker, im.headline, im.sub, ...im.chips, SITE_URL].join('');
  const [bhs, noto] = await Promise.all([
    googleFont('Black+Han+Sans', 400, [im.headline, im.sub].join('')),
    googleFont('Noto+Sans+KR', 900, allText),
  ]);
  return new ImageResponse(buildTree(origin), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'BHS', data: bhs, weight: 400, style: 'normal' },
      { name: 'Noto', data: noto, weight: 900, style: 'normal' },
    ],
    // 주소에 ?v=(내용 버전)가 붙어 있어 내용이 바뀌면 주소도 바뀐다 → 길게 캐시해도 된다.
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable' },
  });
}
