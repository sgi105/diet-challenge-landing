// 사전알림 신청 — Supabase waitlist 테이블이 없을 수 있어 텔레그램 캡처를 1차 채널로 사용.
// 테이블이 있으면 동시에 DB에도 저장 (best-effort, 실패해도 텔레그램은 발송).

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'invalid json' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'missing body' });

  const name = body.name ? String(body.name).trim().slice(0, 50) : '';
  const contact = body.contact ? String(body.contact).trim().slice(0, 100) : '';
  const contactType = body.contact_type ? String(body.contact_type).trim().slice(0, 20) : 'instagram';
  const note = body.note ? String(body.note).trim().slice(0, 500) : '';

  if (!name) return res.status(400).json({ error: 'missing name' });
  if (!contact) return res.status(400).json({ error: 'missing contact' });

  // 1) DB 시도 — 테이블 없으면 무시. 있으면 정상 저장.
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
    if (SUPABASE_URL && SERVICE_ROLE) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ name, contact, contact_type: contactType, note: note || null }),
      });
      if (!r.ok) {
        const txt = await r.text().catch(() => '');
        console.warn('[waitlist] supabase insert failed (non-fatal):', r.status, txt.slice(0, 200));
      }
    }
  } catch (e) {
    console.warn('[waitlist] supabase fetch error (non-fatal):', e?.message || e);
  }

  // 2) 텔레그램 알림 — 실패해도 200 반환하지 않고 throw해서 사용자에게 재시도 유도.
  try {
    await notifyTelegram({ name, contact, contactType, note });
  } catch (e) {
    console.error('[waitlist] telegram failed:', e?.message || e);
    return res.status(500).json({ error: 'notify failed', detail: String(e?.message || e) });
  }

  return res.status(200).json({ ok: true });
}

async function notifyTelegram({ name, contact, contactType, note }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    throw new Error('telegram credentials not configured');
  }
  const lines = [
    '📬 *사전알림 신청*',
    `*${escapeMd(name)}*`,
    `${contactType === 'kakao' ? '💬 카톡' : '📸 인스타'} ${escapeMd(contact)}`,
    note ? `\n_${escapeMd(note)}_` : null,
    `\n🕒 ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}`,
  ].filter(Boolean);

  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
    }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`telegram ${r.status}: ${txt}`);
  }
}

function escapeMd(s) {
  return String(s ?? '').replace(/([_*`[\]])/g, '\\$1');
}
