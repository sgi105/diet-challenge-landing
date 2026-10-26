// meta-ads-control — 메타 광고 세트 상태 확인/끄기. 정원이 차면 DB cron(adset-autopause)이 불러 광고를 끈다.
//
// body: { action: 'check' | 'pause', adset_id: string }
// 인증: cron 내부 호출만(public.internal_edge_headers() 의 새 비밀 키 apikey). verify_jwt=false.
// secrets: META_ADS_TOKEN(광고 관리 권한 토큰) — 없으면 META_CAPI_TOKEN 으로 시도.
const GRAPH = 'https://graph.facebook.com/v21.0'

function internalAuth(req: Request): Response | null {
  let secretKeys: string[] = []
  try { secretKeys = Object.values(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}')) as string[] } catch { /* 비어 있음 */ }
  const apikey = req.headers.get('apikey') ?? ''
  return apikey !== '' && secretKeys.includes(apikey)
    ? null
    : new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  const deny = internalAuth(req)
  if (deny) return deny
  let body: { action?: string; adset_id?: string } = {}
  try { body = await req.json() } catch { /* 빈 본문 */ }
  const id = String(body.adset_id || '').replace(/\D/g, '')
  if (!id) return json({ error: 'adset_id required' }, 400)
  const token = Deno.env.get('META_ADS_TOKEN') || Deno.env.get('META_CAPI_TOKEN')
  if (!token) return json({ error: 'no_token' }, 500)

  if (body.action === 'pause') {
    const r = await fetch(`${GRAPH}/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ status: 'PAUSED', access_token: token }),
    })
    const b = await r.json().catch(() => null)
    return json({ ok: r.ok, result: b }, r.ok ? 200 : 502)
  }
  const r = await fetch(`${GRAPH}/${id}?fields=name,status,effective_status&access_token=${encodeURIComponent(token)}`)
  const b = await r.json().catch(() => null)
  return json({ ok: r.ok, result: b }, r.ok ? 200 : 502)
})
