// Vercel serverless function — admin-only read/delete/patch of applications.
// Password (hardcoded, shared with admin page): 'qkffl1000'
// Required env (Vercel Project → Settings → Environment Variables):
//   SUPABASE_URL             (https://arjkkooducikmpjeudnc.supabase.co)
//   SUPABASE_SERVICE_ROLE    (service role JWT; server-only — NEVER inline in src)

const ADMIN_PASSWORD = 'qkffl1000';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (token !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE not configured' });
  }

  if (req.method === 'GET') {
    return handleList(res, SUPABASE_URL, SERVICE_ROLE);
  }
  if (req.method === 'DELETE') {
    return handleDelete(req, res, SUPABASE_URL, SERVICE_ROLE);
  }
  if (req.method === 'PATCH') {
    return handlePatch(req, res, SUPABASE_URL, SERVICE_ROLE);
  }
  return res.status(405).json({ error: 'method not allowed' });
}

async function handleList(res, SUPABASE_URL, SERVICE_ROLE) {
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/applications?select=*&order=created_at.desc`,
      {
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
        },
      }
    );
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: `supabase ${r.status}`, detail: txt });
    }
    const data = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ count: data.length, rows: data });
  } catch (e) {
    return res.status(500).json({ error: 'fetch failed', detail: String(e) });
  }
}

async function handleDelete(req, res, SUPABASE_URL, SERVICE_ROLE) {
  const id = (req.query?.id || '').toString().trim();
  if (!id) return res.status(400).json({ error: 'missing id' });
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return res.status(400).json({ error: 'invalid id format' });
  }
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          Prefer: 'return=minimal',
        },
      }
    );
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: `supabase ${r.status}`, detail: txt });
    }
    return res.status(200).json({ deleted: id });
  } catch (e) {
    return res.status(500).json({ error: 'delete failed', detail: String(e) });
  }
}

async function handlePatch(req, res, SUPABASE_URL, SERVICE_ROLE) {
  const id = (req.query?.id || '').toString().trim();
  if (!id) return res.status(400).json({ error: 'missing id' });
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return res.status(400).json({ error: 'invalid id format' });
  }
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const update = {};
  if ('instagram' in body) {
    const v = body.instagram;
    update.instagram = v === null || v === '' ? null : String(v).trim().slice(0, 200);
  }
  if ('is_acquaintance' in body) {
    update.is_acquaintance = !!body.is_acquaintance;
  }
  if ('excluded' in body) {
    update.excluded = !!body.excluded;
    if (update.excluded) update.team_id = null; // 배제하면 팀 자동 해제
  }
  if ('gender' in body) {
    const v = body.gender;
    if (v === null || v === '') update.gender = null;
    else if (v === 'M' || v === 'F') update.gender = v;
    else return res.status(400).json({ error: 'gender must be M, F, or null' });
  }
  if ('paid' in body) {
    update.paid = !!body.paid;
    update.paid_at = update.paid ? new Date().toISOString() : null;
  }
  if ('intro_done' in body) {
    update.intro_done = !!body.intro_done;
    update.intro_done_at = update.intro_done ? new Date().toISOString() : null;
  }
  if ('team_id' in body) {
    const v = body.team_id;
    if (v === null || v === '') update.team_id = null;
    else {
      const n = parseInt(v, 10);
      if (!Number.isFinite(n)) return res.status(400).json({ error: 'invalid team_id' });
      update.team_id = n;
    }
  }
  if ('memo' in body) {
    const v = body.memo;
    update.memo = v === null || v === '' ? null : String(v).slice(0, 2000);
  }
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'no updatable fields provided' });
  }

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/applications?id=eq.${encodeURIComponent(id)}&select=*`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(update),
      }
    );
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: `supabase ${r.status}`, detail: txt });
    }
    const data = await r.json();
    return res.status(200).json({ updated: id, row: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    return res.status(500).json({ error: 'patch failed', detail: String(e) });
  }
}
