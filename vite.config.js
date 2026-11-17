import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { LINK_PREVIEW, PREVIEW_IMAGE_URL, SITE_URL, DIET_PREVIEW, DIET_PREVIEW_IMAGE_URL } from './src/data/linkPreview.js'

// 링크 미리보기 메타 태그를 src/data/linkPreview.js 에서 채운다 — 기수 바뀔 때 index.html 을 손으로 고치지 않게.
// diet.html(/diet 전용, vercel.json 에서 /diet → /diet.html)은 DIET_PREVIEW 값으로 채운다.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
function linkPreviewPlugin() {
  const main = {
    '%LP_TITLE%': LINK_PREVIEW.title,
    '%LP_DESCRIPTION%': LINK_PREVIEW.description,
    '%LP_META_DESCRIPTION%': LINK_PREVIEW.metaDescription,
    '%LP_IMAGE%': PREVIEW_IMAGE_URL,
    '%LP_SITE%': SITE_URL,
  }
  const diet = {
    '%LP_TITLE%': DIET_PREVIEW.title,
    '%LP_DESCRIPTION%': DIET_PREVIEW.description,
    '%LP_META_DESCRIPTION%': DIET_PREVIEW.metaDescription,
    '%LP_IMAGE%': DIET_PREVIEW_IMAGE_URL,
    '%LP_SITE%': `${SITE_URL}${DIET_PREVIEW.path}`,
  }
  return {
    name: 'link-preview',
    transformIndexHtml(html, ctx) {
      const map = /diet\.html$/.test(ctx?.filename || ctx?.path || '') ? diet : main
      let out = html
      for (const [k, v] of Object.entries(map)) out = out.split(k).join(esc(v))
      return out
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), linkPreviewPlugin()],
  build: {
    rollupOptions: {
      input: { main: resolve(__dirname, 'index.html'), diet: resolve(__dirname, 'diet.html') },
    },
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  },
})
