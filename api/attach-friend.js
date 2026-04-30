// Public endpoint — 지원 완료 후 thank-you 페이지에서 친구 정보를 덧붙이기 위한 PATCH.
// 가벼운 인증: 제출 시 응답으로 받은 id + 본인 phone 일치를 서버에서 확인.
//
// Required env:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE
// Optional env:
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return res.status(500).json({ error: 'SUPABASE not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'invalid json' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'missing body' });

  const id = String(body.id || '').trim();
  const phone = String(body.phone || '').trim();
  const friend = String(body.friend || '').trim().slice(0, 200);
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) return res.status(400).json({ error: 'invalid id' });
  if (!phone) return res.status(400).json({ error: 'phone required' });
  if (!friend) return res.status(400).json({ error: 'friend required' });

  const lookup = await fetch(
    `${SUPABASE_URL}/rest/v1/applications?id=eq.${encodeURIComponent(id)}&select=id,name,phone,motivation`,
    { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
  );
  if (!lookup.ok) {
    const txt = await lookup.text().catch(() => lookup.statusText);
    return res.status(500).json({ error: 'lookup failed', detail: txt });
  }
  const rows = await lookup.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) return res.status(404).json({ error: 'application not found' });
  if (row.phone !== phone) return res.status(403).json({ error: 'phone mismatch' });

  if (/\[같이 지원한 친구\]/.test(row.motivation || '')) {
    return res.status(200).json({ ok: true, alreadyAttached: true });
  }

  const updatedMotivation = `${row.motivation || ''}\n\n[같이 지원한 친구] ${friend}`.slice(0, 2000);

  const u = await fetch(
    `${SUPABASE_URL}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ motivation: updatedMotivation }),
    }
  );
  if (!u.ok) {
    const txt = await u.text().catch(() => u.statusText);
    return res.status(u.status).json({ error: 'update failed', detail: txt });
  }

  notifyTelegram(row.name, friend).catch((e) => {
    console.error('[telegram] friend notify failed:', e?.message || e);
  });

  return res.status(200).json({ ok: true });
}

async function notifyTelegram(applicantName, friend) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const text = `👯 *친구 매칭 추가*\n${escapeMd(applicantName)} → ${escapeMd(friend)}`;
  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', disable_web_page_preview: true }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(`telegram ${r.status}: ${txt}`);
  }
}

function escapeMd(s) {
  return String(s ?? '').replace(/([_*`[\]])/g, '\\$1');
}
