// Public submit endpoint — anonymous client posts here, server inserts to Supabase
// + 텔레그램 알림. 서버에서 처리해야 알림 누락이 없음 (브라우저 닫혀도 OK).
//
// Required env (Vercel Project → Settings → Environment Variables):
//   SUPABASE_URL              (https://xxxxx.supabase.co)
//   SUPABASE_SERVICE_ROLE     (server-only)
//   TELEGRAM_BOT_TOKEN        (optional — 없으면 알림만 스킵, 제출은 성공)
//   TELEGRAM_CHAT_ID          (optional)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE not configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'invalid json' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'missing body' });

  // 필수 필드 검증 (클라이언트 검증을 신뢰하지 않음)
  const required = ['name', 'age', 'phone', 'job', 'region', 'running_exp', 'motivation'];
  for (const k of required) {
    if (body[k] == null || body[k] === '') return res.status(400).json({ error: `missing field: ${k}` });
  }

  const referrerName = body.referrer_name ? String(body.referrer_name).trim().slice(0, 50) : null;
  const kakaoId = body.kakao_id ? String(body.kakao_id).trim().slice(0, 50) : null;

  const payload = {
    name: String(body.name).trim().slice(0, 50),
    age: parseInt(body.age, 10),
    gender: body.gender === 'M' || body.gender === 'F' ? body.gender : null,
    phone: String(body.phone).trim().slice(0, 30),
    phone_country: String(body.phone_country || 'KR').slice(0, 4),
    job: String(body.job).trim().slice(0, 100),
    region: String(body.region).trim().slice(0, 100),
    running_exp: String(body.running_exp).slice(0, 30),
    motivation: String(body.motivation).trim().slice(0, 2000),
    instagram: body.instagram ? String(body.instagram).trim().slice(0, 100) : null,
    kakao_id: kakaoId,
    referrer_name: referrerName,
    agree_deposit: !!body.agree_deposit,
    agree_schedule: !!body.agree_schedule,
  };
  if (!Number.isFinite(payload.age) || payload.age < 14 || payload.age > 100) {
    return res.status(400).json({ error: 'invalid age' });
  }

  // 1) Supabase에 삽입 — return=representation 으로 id/created_at 받아옴
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });
  if (!insertRes.ok) {
    const txt = await insertRes.text().catch(() => insertRes.statusText);
    return res.status(insertRes.status).json({ error: 'supabase insert failed', detail: txt });
  }
  const inserted = await insertRes.json().catch(() => null);
  const row = Array.isArray(inserted) ? inserted[0] : inserted;

  // 2) 텔레그램 알림 — 실패해도 응답은 200 (제출 자체는 성공)
  notifyTelegram(payload, row).catch((e) => {
    console.error('[telegram] notify failed:', e?.message || e);
  });

  return res.status(200).json({ ok: true, id: row?.id || null });
}

async function notifyTelegram(p, row) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    p.referrer_name ? '🟧 *새 지원자 (추천인 전형)*' : '🔥 *새 지원자*',
    `*${escapeMd(p.name)}* · ${p.age}세 · ${escapeMd(p.region)}`,
    p.referrer_name ? `👤 추천인: *${escapeMd(p.referrer_name)}*` : null,
    `📞 ${escapeMd(p.phone)} (${p.phone_country})`,
    `💼 ${escapeMd(p.job)}`,
    `🏃 ${escapeMd(runLabel(p.running_exp))}`,
    p.instagram ? `📸 ${escapeMd(p.instagram)}` : null,
    p.kakao_id ? `💬 카톡 ${escapeMd(p.kakao_id)}` : null,
    '',
    `_${escapeMd(truncate(p.motivation, 300))}_`,
    '',
    `${p.agree_deposit ? '✅' : '❌'} 보증금 동의   ${p.agree_schedule ? '✅' : '❌'} 일정 동의`,
    row?.created_at ? `\n🕒 ${new Date(row.created_at).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}` : null,
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

const RUN_LABELS = {
  none: '러닝 경험 없음',
  walking: '걷기만',
  run_3km: '3km까지',
  run_5km: '5km까지',
  run_10km: '10km+',
  almost_none: '러닝 시작',
  run_1km: '1km',
  half_marathon: '하프',
  full_marathon: '풀마라톤',
};
function runLabel(k) { return RUN_LABELS[k] || k; }

function truncate(s, n) {
  const t = (s || '').trim();
  return t.length <= n ? t : t.slice(0, n).trim() + '…';
}

// Markdown v1 특수문자 escape (parse_mode=Markdown 사용 시 _ * [ ` 충돌 방지)
function escapeMd(s) {
  return String(s ?? '').replace(/([_*`[\]])/g, '\\$1');
}
