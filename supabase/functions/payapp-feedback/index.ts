// payapp-feedback — 페이앱 결제 결과 통보(feedbackurl) 수신.
//
// 페이앱이 결제 요청·완료·취소 때마다 이 주소로 form POST 한다.
// 본문이 정확히 "SUCCESS" 가 아니면 페이앱은 실패로 보고(70080), pay_state=1(요청) 통보에서
// SUCCESS 를 못 받으면 결제 자체가 진행되지 않는다. 그래서 처리할 게 없어도 SUCCESS 를 돌려준다.
// 단, 검증 실패(남이 보낸 가짜 통보)는 SUCCESS 를 주지 않는다.
//
// 검증: userid · linkkey · linkval 이 판매자 설정값과 같아야 하고, 금액이 참가비와 같아야 한다.
// 기록: applications 행(var1 = 지원서 id)의 pay_* 칸 + 기존 paid / paid_at.
// 결제 완료(pay_state=4) 첫 통보 때만 메타 Conversions API 로 Purchase 1건 전송.
//   event_id = "pay-<mul_no>" — 결제 완료 화면 픽셀도 같은 값을 써서 메타가 한 건으로 합친다.
//
// secrets:
//   PAYAPP_USERID / PAYAPP_LINKKEY / PAYAPP_LINKVAL   판매자 사이트 → 설정 → 연동정보
//   PAYAPP_PRICE                                       참가비(원). 금액 대조용
//   PAYAPP_TEST_MODE=1 (선택)                          테스트 아이디 payapptest 통보 허용. 실서비스 전환 시 삭제
//   META_PIXEL_ID / META_CAPI_TOKEN / META_TEST_EVENT_CODE(선택) — meta-capi 와 공유
//
// 배포: verify_jwt=false (페이앱 서버가 호출하므로)

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const GRAPH_VERSION = 'v21.0'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const ok = () => new Response('SUCCESS', { status: 200, headers: { 'Content-Type': 'text/plain' } })
const reject = (why: string) => {
  console.error('payapp-feedback reject', why)
  return new Response(`FAIL ${why}`, { status: 400, headers: { 'Content-Type': 'text/plain' } })
}

// 페이앱 pay_state → 우리 상태. 모르는 값은 null(기록만 하고 상태는 안 바꿈).
function mapState(s: string): string | null {
  switch (s) {
    case '1': case '10': return 'requested'
    case '4': return 'paid'
    case '8': case '32': case '9': case '64': return 'cancelled'
    case '70': case '71': return 'partial_cancelled'
    default: return null
  }
}

async function rest(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function normalizePhone(phone: unknown, country: unknown): string | null {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return null
  if ((country ?? 'KR') === 'KR') return digits.startsWith('0') ? `82${digits.slice(1)}` : digits
  return digits.length >= 7 ? digits : null
}

type App = {
  id: string
  phone: string | null
  phone_country: string | null
  pay_state: string | null
  pay_mul_no: string | null
  meta_fbp: string | null
  meta_fbc: string | null
  client_ua: string | null
}

async function sendPurchase(app: App, mulNo: string, price: number) {
  const pixelId = Deno.env.get('META_PIXEL_ID')
  const token = Deno.env.get('META_CAPI_TOKEN')
  if (!pixelId || !token) return
  const ph = normalizePhone(app.phone, app.phone_country)
  const hashed = ph ? await sha256Hex(ph) : undefined
  const userData: Record<string, unknown> = {
    fbp: app.meta_fbp || undefined,
    fbc: app.meta_fbc || undefined,
    client_user_agent: app.client_ua || undefined,
  }
  if (hashed) {
    userData.ph = [hashed]
    userData.external_id = [hashed]
  }
  const payload: Record<string, unknown> = {
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: `pay-${mulNo}`,
      action_source: 'website',
      event_source_url: 'https://challenge.samuraihabits.com/apply',
      user_data: userData,
      custom_data: { currency: 'KRW', value: price, content_name: 'apply_fee' },
    }],
  }
  const testCode = Deno.env.get('META_TEST_EVENT_CODE')
  if (testCode) payload.test_event_code = testCode
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.error('payapp-feedback capi failed', res.status, (await res.text()).slice(0, 300))
  } catch (e) {
    console.error('payapp-feedback capi error', String(e))
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method', { status: 405 })

  let f: Record<string, string>
  try {
    const form = await req.formData()
    f = Object.fromEntries([...form.entries()].map(([k, v]) => [k, String(v)]))
  } catch {
    return reject('bad_body')
  }

  // 1) 보낸 쪽 검증 — 판매자 연동정보와 일치해야 한다.
  const testMode = Deno.env.get('PAYAPP_TEST_MODE') === '1'
  const isTest = testMode && f.userid === 'payapptest'
  if (!isTest) {
    const uid = Deno.env.get('PAYAPP_USERID')
    const key = Deno.env.get('PAYAPP_LINKKEY')
    const val = Deno.env.get('PAYAPP_LINKVAL')
    if (!uid || !key || !val) return reject('no_secrets')
    if (f.userid !== uid || f.linkkey !== key || f.linkval !== val) return reject('auth')
  }

  // 2) 어느 지원서인지 + 금액 확인.
  const appId = f.var1 || ''
  if (!UUID_RE.test(appId)) return reject('var1')
  const price = parseInt(f.price || '', 10)
  const expected = parseInt(Deno.env.get('PAYAPP_PRICE') || '', 10)
  if (!isTest && (!expected || price !== expected)) return reject(`price ${price}`)

  const state = mapState(f.pay_state || '')
  const mulNo = f.mul_no || null

  const sel = await rest(`applications?id=eq.${appId}&select=id,phone,phone_country,pay_state,pay_mul_no,meta_fbp,meta_fbc,client_ua`)
  const rows = (await sel.json().catch(() => [])) as App[]
  const app = rows[0]
  if (!app) return reject('no_application')

  // 이미 결제 완료된 지원서에 다른 결제번호가 또 오면 덮어쓰지 않는다(중복 결제는 수동 취소 대상).
  if (app.pay_state === 'paid' && mulNo && app.pay_mul_no && app.pay_mul_no !== mulNo) {
    console.error('payapp-feedback duplicate payment', appId, app.pay_mul_no, mulNo)
    return ok()
  }

  const firstPaid = state === 'paid' && app.pay_state !== 'paid'
  const patch: Record<string, unknown> = {
    pay_raw: { ...f, linkkey: undefined, linkval: undefined },
    pay_type: f.pay_type || null,
  }
  if (mulNo) patch.pay_mul_no = mulNo
  if (state) patch.pay_state = state
  if (state === 'paid') {
    patch.pay_amount = price
    patch.paid = true
    if (firstPaid) patch.paid_at = new Date().toISOString()
  } else if (state === 'cancelled') {
    patch.paid = false
  }

  const upd = await rest(`applications?id=eq.${appId}`, { method: 'PATCH', body: JSON.stringify(patch) })
  if (!upd.ok) {
    console.error('payapp-feedback update failed', upd.status, (await upd.text()).slice(0, 300))
    // 기록 실패는 SUCCESS 를 주지 않는다 → 페이앱이 재시도(checkretry=y).
    return new Response('FAIL db', { status: 500 })
  }

  // 테스트 아이디(payapptest) 결제는 메타에 구매로 보내지 않는다 — 10/22 테스트 6건이 실제 Purchase 로 섞였다.
  if (firstPaid && mulNo && !isTest) await sendPurchase(app, mulNo, price)
  return ok()
})
