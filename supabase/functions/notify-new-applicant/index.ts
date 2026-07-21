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

  const date = new Date().toISOString()
  const salt = crypto.randomUUID().replace(/-/g, '')
  const signature = await hmacSha256Hex(apiSecret, date + salt)
  const auth = `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`

  const res = await fetch('https://api.solapi.com/messages/v4/send', {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: { to, from: String(from).replace(/\D/g, ''), text: preseasonSmsText() },
    }),
  })
  const txt = await res.text().catch(() => '')
  if (!res.ok) {
    console.error('solapi error', res.status, txt)
    return { sms: 'error', status: res.status, detail: txt.slice(0, 300) }
  }
  return { sms: 'sent' }
}

// deno-lint-ignore no-explicit-any
Deno.serve(async (req: Request) => {
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
