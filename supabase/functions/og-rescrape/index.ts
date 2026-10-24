// og-rescrape — 랜딩 링크 미리보기가 바뀌면 메타(인스타·페북·스레드)에 "다시 읽어가"를 자동 요청한다.
//
// 랜딩의 og:image 주소에는 내용 버전(?v=)이 붙어 있다(src/data/linkPreview.js).
// 10분마다 cron 이 이 함수를 부르면: 지금 랜딩의 og:image 주소를 읽어 → 지난번과 다르면 메타 scrape 요청 → 기록.
// 기록 = coach_settings key 'landing_og_last' ({ url, scraped_at, result }).
//
// 인증: cron 내부 호출만(public.internal_edge_headers() 의 새 비밀 키 apikey). verify_jwt=false.
// secrets: META_CAPI_TOKEN (메타 픽셀 CAPI 와 같은 토큰)
const SITE = 'https://challenge.samuraihabits.com/'
const GRAPH_VERSION = 'v21.0'
const KEY = 'landing_og_last'

function internalAuth(req: Request): Response | null {
  let secretKeys: string[] = []
  try { secretKeys = Object.values(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}')) as string[] } catch { /* 비어 있음 */ }
  const apikey = req.headers.get('apikey') ?? ''
  return apikey !== '' && secretKeys.includes(apikey)
    ? null
    : new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
}

const SB_URL = Deno.env.get('SUPABASE_URL')!
const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const rest = (path: string, init: RequestInit = {}) =>
  fetch(`${SB_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  })

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  const deny = internalAuth(req)
  if (deny) return deny
  let force = false
  try { force = !!(await req.json())?.force } catch { /* 빈 본문 */ }

  const html = await (await fetch(SITE, { headers: { 'Cache-Control': 'no-cache' } })).text()
  const url = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] || null
  if (!url) return json({ error: 'og_image_not_found' }, 500)

  const prevRes = await rest(`coach_settings?key=eq.${KEY}&select=value`)
  const prev = ((await prevRes.json().catch(() => [])) as { value?: { url?: string } }[])[0]?.value
  if (!force && prev?.url === url) return json({ ok: true, changed: false, url })

  const token = Deno.env.get('META_CAPI_TOKEN')
  if (!token) return json({ error: 'no_token' }, 500)
  const g = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id: SITE, scrape: 'true', access_token: token }),
  })
  // deno-lint-ignore no-explicit-any
  const gBody: any = await g.json().catch(() => null)
  const result = g.ok
    ? { ok: true, title: gBody?.title ?? null, image: gBody?.image?.[0]?.url ?? null }
    : { ok: false, status: g.status, error: gBody?.error?.message ?? null }

  // 실패하면 기록하지 않는다 → 다음 cron 에서 다시 시도.
  if (g.ok) {
    await rest('coach_settings', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({ key: KEY, value: { url, scraped_at: new Date().toISOString(), result }, updated_at: new Date().toISOString() }),
    })
  }
  return json({ changed: true, url, prev: prev?.url ?? null, result }, g.ok ? 200 : 502)
})
