import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { LINK_PREVIEW, PREVIEW_IMAGE_URL, SITE_URL } from './src/data/linkPreview.js'

// 링크 미리보기 메타 태그를 src/data/linkPreview.js 에서 채운다 — 기수 바뀔 때 index.html 을 손으로 고치지 않게.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
function linkPreviewPlugin() {
  const map = {
    '%LP_TITLE%': LINK_PREVIEW.title,
    '%LP_DESCRIPTION%': LINK_PREVIEW.description,
    '%LP_META_DESCRIPTION%': LINK_PREVIEW.metaDescription,
    '%LP_IMAGE%': PREVIEW_IMAGE_URL,
    '%LP_SITE%': SITE_URL,
  }
  return {
    name: 'link-preview',
    transformIndexHtml(html) {
      let out = html
      for (const [k, v] of Object.entries(map)) out = out.split(k).join(esc(v))
      return out
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), linkPreviewPlugin()],
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
  },
})
