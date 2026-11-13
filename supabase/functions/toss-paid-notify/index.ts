// Edge Function — 토스 결제 텔레그램 알림.
// 호출: api/toss-confirm.js(Vercel) 가 결제 승인 직후 서버 간 호출. 헤더 x-internal-secret = INTERNAL_CAPI_SECRET.
// secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID (페이앱 알림과 같은 봇·채팅), INTERNAL_CAPI_SECRET
// 배포: Management API (verify_jwt=false — 내부 시크릿으로만 인증)

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function s(v: unknown, max = 200): string {
  return typeof v === 'string' || typeof v === 'number' ? String(v).slice(0, max) : ''
}

function fmtPhone(p: string): string {
  const d = p.replace(/\D/g, '')
  return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d
}

function kst(iso: string): string {
  const t = iso ? new Date(iso) : new Date()
  return t.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  const secret = Deno.env.get('INTERNAL_CAPI_SECRET')
  if (!secret || req.headers.get('x-internal-secret') !== secret) return json({ error: 'unauthorized' }, 401)
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID')
  if (!token || !chatId) return json({ skipped: 'no_telegram' })

  let b: Record<string, unknown> = {}
  try { b = await req.json() } catch { return json({ error: 'bad_json' }, 400) }

  const kind = s(b.kind, 20) // 'paid' | 'waiting' | 'probe'
  const head = kind === 'probe' ? '🔔 [연결 확인] 토스 결제 알림 테스트'
    : kind === 'waiting' ? '🏦 시즌7 가상계좌 발급 (입금 대기)'
    : '💳 시즌7 결제 완료'
  const lines = [head]
  if (kind !== 'probe') {
    lines.push(`${s(b.name, 50) || '-'} · ${fmtPhone(s(b.phone, 20)) || '-'}`)
    lines.push(`${Number(b.amount || 0).toLocaleString('ko-KR')}원 · ${s(b.method, 30) || '-'}${s(b.provider, 30) ? ` (${s(b.provider, 30)})` : ''}`)
    lines.push(`${kst(s(b.approvedAt, 40))} · 주문 ${s(b.orderId, 80)}`)
    if (b.paidCount !== undefined && b.paidCount !== null) lines.push(`누적 결제 ${s(b.paidCount, 10)}명 / 정원 ${s(b.capacity, 10) || '-'}명`)
    if (s(b.meta, 20)) lines.push(`메타 전환: ${s(b.meta, 20)}`)
  } else {
    lines.push('이 메시지가 보이면 결제 알림이 정상 연결된 거예요.')
  }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: lines.join('\n'), disable_web_page_preview: true }),
    })
    if (!r.ok) { console.error('telegram failed', r.status, (await r.text()).slice(0, 300)); return json({ ok: false }, 502) }
    return json({ ok: true })
  } catch (e) {
    console.error('telegram error', String(e))
    return json({ ok: false }, 502)
  }
})
