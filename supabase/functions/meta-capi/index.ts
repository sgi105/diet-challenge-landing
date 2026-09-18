// Edge Function — 메타 Conversions API(서버 전송).
// 지원서 제출 성공 시 랜딩(src/lib/metaPixel.js)이 호출한다.
// 브라우저 픽셀과 같은 event_id를 보내 메타가 한 건으로 합친다(중복 제거).
//
// secrets:
//   META_PIXEL_ID      픽셀 ID
//   META_CAPI_TOKEN    이벤트 관리자 → 설정 → Conversions API 액세스 토큰
//   META_TEST_EVENT_CODE (선택) 이벤트 관리자 "테스트 이벤트" 탭 코드. 검증 끝나면 삭제
// 시크릿 없으면 조용히 스킵(200).
//
// 배포: supabase functions deploy meta-capi --no-verify-jwt
//   (랜딩 공개 키로 호출하므로 JWT 검증 끔)

const ALLOWED_EVENTS = new Set(['Lead', 'WaitlistLead'])
const GRAPH_VERSION = 'v21.0'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// 메타 규격: 국가번호 포함 숫자만. 010-1234-5678 → 821012345678
function normalizePhone(phone: unknown, country: unknown): string | null {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return null
  if (country === 'KR') return digits.startsWith('0') ? `82${digits.slice(1)}` : digits
  return digits.length >= 7 ? digits : null
}

function str(v: unknown, max = 500): string | undefined {
  return typeof v === 'string' && v ? v.slice(0, max) : undefined
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'method' }, 405)

  const pixelId = Deno.env.get('META_PIXEL_ID')
  const token = Deno.env.get('META_CAPI_TOKEN')
  if (!pixelId || !token) return json({ skipped: 'no_secrets' })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'bad_json' }, 400)
  }

  const eventName = String(body.event_name || '')
  const eventId = str(body.event_id, 100)
  if (!ALLOWED_EVENTS.has(eventName) || !eventId) return json({ error: 'bad_event' }, 400)

  const ph = normalizePhone(body.phone, body.phone_country)
  const hashedPh = ph ? await sha256Hex(ph) : undefined
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || undefined

  const userData: Record<string, unknown> = {
    client_ip_address: ip,
    client_user_agent: str(req.headers.get('user-agent')),
    fbp: str(body.fbp, 200),
    fbc: str(body.fbc, 500),
  }
  if (hashedPh) {
    userData.ph = [hashedPh]
    userData.external_id = [hashedPh]
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        event_source_url: str(body.event_source_url, 1000),
        user_data: userData,
        custom_data: typeof body.custom_data === 'object' && body.custom_data ? body.custom_data : undefined,
      },
    ],
  }
  const testCode = Deno.env.get('META_TEST_EVENT_CODE')
  if (testCode) payload.test_event_code = testCode

  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const out = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error('meta-capi failed', res.status, JSON.stringify(out).slice(0, 500))
      return json({ ok: false, status: res.status }, 502)
    }
    return json({ ok: true, events_received: out.events_received })
  } catch (e) {
    console.error('meta-capi error', String(e))
    return json({ ok: false }, 502)
  }
})
