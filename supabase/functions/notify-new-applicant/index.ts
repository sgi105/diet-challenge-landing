// Edge Function — applications INSERT 트리거가 호출.
//  1) Telegram으로 내부 새 지원자 알림
//  2) (프리시즌) 신청자에게 인스타 단톡방 입장 링크 SMS 발송 (솔라피/CoolSMS)
// secrets:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID           (텔레그램 알림)
//   SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER (문자 발송 · SENDER=사전등록 발신번호)
//   PRESEASON_TALK_LINK (선택 · 기본값 하드코딩)
// invoke shape: { record: <applications row> } (DB webhook trigger style)
// SMS는 프리시즌 코호트 + 한국(KR) 번호에만 발송. 시크릿 없으면 조용히 스킵(텔레그램은 그대로).

const PRESEASON_COHORT = '260723_pre_run_3d'

const RUN_LABELS: Record<string, string> = {
  none: '러닝 경험 없음',
  walking: '걷기만',
  run_3km: '3km까지',
  run_5km: '5km까지',
  run_10km: '10km+',
  almost_none: '러닝 시작',
  run_1km: '1km',
  half_marathon: '하프',
  full_marathon: '풀마라톤',
}

function escapeMd(s: unknown): string {
  return String(s ?? '').replace(/([_*`\[\]])/g, '\\$1')
}

function truncate(s: string | null | undefined, n: number): string {
  const t = (s || '').trim()
  return t.length <= n ? t : t.slice(0, n).trim() + '…'
}

// ── 프리시즌 신청자 문자 발송 (솔라피/CoolSMS) ────────────────────────────
async function hmacSha256Hex(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function preseasonSmsText(): string {
  const link = Deno.env.get('PRESEASON_TALK_LINK') || 'https://ig.me/j/AbbPoz-hk6k6Q_TP/'
  return [
    '[발리타잔 런클럽] 작심삼일 챌린지 신청 완료!',
    '',
    '7/23(목) 시작 · 딱 3일 뿌시기',
    '팀 배정이랑 시작 안내는 아래 인스타 단톡방에서 진행해. 지금 바로 들어와줘',
    '',
    link,
  ].join('\n')
}

// 신청자에게 톡방 링크 SMS 발송. 시크릿 미설정/비KR 번호면 스킵(비치명적).
// deno-lint-ignore no-explicit-any
async function sendApplicantSms(r: any): Promise<Record<string, unknown>> {
  const apiKey = Deno.env.get('SOLAPI_API_KEY')
  const apiSecret = Deno.env.get('SOLAPI_API_SECRET')
  const from = Deno.env.get('SOLAPI_SENDER')
  if (!apiKey || !apiSecret || !from) {
    console.warn('solapi not configured — skip sms')
    return { sms: 'skipped_no_config' }
  }
  if ((r.phone_country || 'KR') !== 'KR') return { sms: 'skipped_non_kr' }
  const to = String(r.phone || '').replace(/\D/g, '')
  if (!/^01\d{8,9}$/.test(to)) return { sms: 'skipped_bad_phone' }

  // 서명/엔드포인트는 저장소 내 검증된 패턴(send-otp, booking-reminder)과 동일하게 맞춤.
  const date = new Date().toISOString()
  const salt = crypto.randomUUID()
  const signature = await hmacSha256Hex(apiSecret, date + salt)
  const auth = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`

  const res = await fetch('https://api.solapi.com/messages/v4/send-many/detail', {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ to, from: String(from).replace(/\D/g, ''), text: preseasonSmsText() }],
    }),
  })
  const txt = await res.text().catch(() => '')
  // deno-lint-ignore no-explicit-any
  let body: any = null
  try { body = JSON.parse(txt) } catch { /* non-json */ }
  if (!res.ok) {
    console.error('solapi http error', res.status, txt)
    return { sms: 'http_error', status: res.status, detail: txt.slice(0, 400) }
  }
  // send-many/detail: 실제 실패는 HTTP 200 + body에 담긴다(잔액부족/발신번호 미등록 등).
  // res.ok만 보고 'sent' 처리하면 조용한 실패에 당함 → 반드시 body의 실패 카운트를 검사.
  const cnt = body?.groupInfo?.count || body?.count
  const regFailed = Number(cnt?.registeredFailed ?? 0)
  const failedList = Array.isArray(body?.failedMessageList) ? body.failedMessageList : []
  if (regFailed > 0 || failedList.length > 0) {
    const f = failedList[0] || {}
    const reason = f.statusCode ? `${f.statusCode} ${f.statusMessage || ''}`.trim() : `registeredFailed=${regFailed}`
    console.error('solapi delivery failed', reason, txt.slice(0, 300))
    return { sms: 'delivery_failed', reason }
  }
  return { sms: 'sent' }
}

// deno-lint-ignore no-explicit-any
// [690] 내부 호출 인증 — 이 함수는 cron / DB 트리거만 부른다 (브라우저 호출 없음).
//   verify_jwt=false 로 배포하므로 이 확인이 유일한 관문이다.
//   통과: 새 비밀 키(apikey 헤더) · 전환 기간 한정 옛 service_role(Authorization: Bearer)
//   옛 키를 끄면(legacy 비활성화) 두 번째 경로는 자연히 사라진다.
function __internalAuth(req: Request): Response | null {
  if (req.method === 'OPTIONS') return null
  let secretKeys: string[] = []
  try { secretKeys = Object.values(JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}')) as string[] } catch { /* 비어 있음 */ }
  // 런타임의 SUPABASE_SERVICE_ROLE_KEY 는 cron 에 박힌 옛 JWT 와 값이 다르다(2026-09-17 확인).
  //   cron·트리거가 실제로 보내는 값을 LEGACY_SERVICE_ROLE_JWT 시크릿으로 따로 넣어 비교한다.
  const legacy = Deno.env.get('LEGACY_SERVICE_ROLE_JWT') ?? ''
  const apikey = req.headers.get('apikey') ?? ''
  const bearer = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
  const ok = (apikey !== '' && secretKeys.includes(apikey)) || (legacy !== '' && bearer === legacy)
  return ok ? null : new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
}

Deno.serve(async (__req: Request) => {
  const __deny = __internalAuth(__req)
  if (__deny) return __deny
  const req = __req

  try {
    const body = await req.json()
    const r = body?.record || body
    if (!r || typeof r !== 'object') {
      return new Response(JSON.stringify({ error: 'missing record' }), { status: 400 })
    }

    const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
    if (!token || !chatId) {
      console.error('telegram credentials missing')
      return new Response(JSON.stringify({ error: 'telegram not configured' }), { status: 500 })
    }

    const runLabel = RUN_LABELS[r.running_exp] || r.running_exp
    const lines = [
      r.referrer_name ? '🟧 *새 지원자 (추천인 전형)*' : '🔥 *새 지원자*',
      `*${escapeMd(r.name)}* · ${r.age}세 · ${escapeMd(r.region)}`,
      r.referrer_name ? `👤 추천인: *${escapeMd(r.referrer_name)}*` : null,
      `📞 ${escapeMd(r.phone)} (${r.phone_country || 'KR'})`,
      `💼 ${escapeMd(r.job)}`,
      `🏃 ${escapeMd(runLabel)}`,
      r.instagram ? `📸 ${escapeMd(r.instagram)}` : null,
      r.kakao_id ? `💬 카톡 ${escapeMd(r.kakao_id)}` : null,
      '',
      `_${escapeMd(truncate(r.motivation, 300))}_`,
      '',
      `${r.agree_deposit ? '✅' : '❌'} 보증금 동의   ${r.agree_schedule ? '✅' : '❌'} 일정 동의`,
      r.cohort_code ? `🏷 cohort: ${escapeMd(r.cohort_code)}` : null,
      r.created_at ? `🕒 ${new Date(r.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}` : null,
    ].filter(Boolean)

    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join('\n'),
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    })

    if (!tg.ok) {
      const txt = await tg.text().catch(() => '')
      console.error('telegram error', tg.status, txt)
      return new Response(JSON.stringify({ error: `telegram ${tg.status}`, detail: txt }), { status: 502 })
    }

    // 프리시즌 신청자에게 톡방 링크 문자 발송 (비치명적 — 실패해도 200)
    let smsResult: Record<string, unknown> = { sms: 'skipped_not_preseason' }
    if (r.cohort_code === PRESEASON_COHORT) {
      try {
        smsResult = await sendApplicantSms(r)
      } catch (e) {
        console.error('sms send error', e instanceof Error ? e.message : String(e))
        smsResult = { sms: 'exception' }
      }
    }

    return new Response(JSON.stringify({ ok: true, ...smsResult }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('handler error', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
})
