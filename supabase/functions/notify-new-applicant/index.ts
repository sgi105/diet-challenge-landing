// Edge Function — applications INSERT 트리거가 호출. Telegram으로 새 지원자 알림 발송.
// secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
// invoke shape: { record: <applications row> } (DB webhook trigger style)

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

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('handler error', msg)
    return new Response(JSON.stringify({ error: msg }), { status: 500 })
  }
})
