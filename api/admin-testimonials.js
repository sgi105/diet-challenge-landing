// Vercel serverless — admin CRUD for public.testimonials + public.testimonial_settings.
// Password (hardcoded, shared with /admin pages): 'qkffl1000'
//
// Routes (single endpoint, branched by query/method):
//   GET    /api/admin-testimonials              → list all rows (ordered by display_order)
//   POST   /api/admin-testimonials              → insert one
//   PATCH  /api/admin-testimonials?id=<uuid>    → update one
//   DELETE /api/admin-testimonials?id=<uuid>    → delete one
//   GET    /api/admin-testimonials?type=settings   → read settings row
//   PATCH  /api/admin-testimonials?type=settings   → update card_style
//
// Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE

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

  const isSettings = (req.query?.type || '').toString() === 'settings';

  if (isSettings) {
    if (req.method === 'GET') return handleSettingsGet(res, SUPABASE_URL, SERVICE_ROLE);
    if (req.method === 'PATCH') return handleSettingsPatch(req, res, SUPABASE_URL, SERVICE_ROLE);
    return res.status(405).json({ error: 'method not allowed for settings' });
  }

  if (req.method === 'GET') return handleList(res, SUPABASE_URL, SERVICE_ROLE);
  if (req.method === 'POST') return handleInsert(req, res, SUPABASE_URL, SERVICE_ROLE);
  if (req.method === 'PATCH') return handlePatch(req, res, SUPABASE_URL, SERVICE_ROLE);
  if (req.method === 'DELETE') return handleDelete(req, res, SUPABASE_URL, SERVICE_ROLE);
  return res.status(405).json({ error: 'method not allowed' });
}

async function handleList(res, SUPABASE_URL, SERVICE_ROLE) {
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/testimonials?select=*&order=display_order.asc,created_at.desc`,
      {
        headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
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

function sanitize(body) {
  const out = {};
  if ('name' in body) out.name = String(body.name || '').trim().slice(0, 100);
  if ('caption' in body) out.caption = String(body.caption || '').trim().slice(0, 5000);
  if ('highlight' in body) {
    const v = body.highlight;
    if (Array.isArray(v)) out.highlight = v.map((x) => String(x).slice(0, 500)).filter(Boolean);
    else if (v === null) out.highlight = [];
    else out.highlight = [];
  }
  if ('type' in body) {
    const v = body.type;
    out.type = v === null || v === '' ? null : String(v).slice(0, 50);
  }
  if ('cohort_code' in body) {
    const v = body.cohort_code;
    out.cohort_code = v === null || v === '' ? null : String(v).slice(0, 100);
  }
  if ('prompt_text' in body) {
    const v = body.prompt_text;
    out.prompt_text = v === null || v === '' ? null : String(v).slice(0, 1000);
  }
  if ('prompt_date' in body) {
    const v = body.prompt_date;
    out.prompt_date = v === null || v === '' ? null : String(v).slice(0, 20);
  }
  if ('img' in body) {
    const v = body.img;
    out.img = v === null || v === '' ? null : String(v).slice(0, 1000);
  }
  if ('likes' in body) {
    const n = parseInt(body.likes, 10);
    out.likes = Number.isFinite(n) ? n : 0;
  }
  if ('comments' in body) {
    const n = parseInt(body.comments, 10);
    out.comments = Number.isFinite(n) ? n : 0;
  }
  if ('is_selected' in body) out.is_selected = !!body.is_selected;
  if ('display_order' in body) {
    const n = parseInt(body.display_order, 10);
    out.display_order = Number.isFinite(n) ? n : 0;
  }
  return out;
}

async function handleInsert(req, res, SUPABASE_URL, SERVICE_ROLE) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  if (!body.name || !body.caption) {
    return res.status(400).json({ error: 'name and caption required' });
  }
  const row = sanitize(body);
  // Default display_order to end of list if not given
  if (!('display_order' in row)) {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/testimonials?select=display_order&order=display_order.desc&limit=1`,
        { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` } }
      );
      const arr = r.ok ? await r.json() : [];
      const max = arr[0]?.display_order ?? 0;
      row.display_order = max + 10;
    } catch {
      row.display_order = 9999;
    }
  }
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/testimonials?select=*`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE,
        Authorization: `Bearer ${SERVICE_ROLE}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: `supabase ${r.status}`, detail: txt });
    }
    const data = await r.json();
    return res.status(201).json({ row: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    return res.status(500).json({ error: 'insert failed', detail: String(e) });
  }
}

async function handlePatch(req, res, SUPABASE_URL, SERVICE_ROLE) {
  const id = (req.query?.id || '').toString().trim();
  if (!id) return res.status(400).json({ error: 'missing id' });
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return res.status(400).json({ error: 'invalid id format' });
  }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const update = sanitize(body);
  if (Object.keys(update).length === 0) {
    return res.status(400).json({ error: 'no updatable fields provided' });
  }
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/testimonials?id=eq.${encodeURIComponent(id)}&select=*`,
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

async function handleDelete(req, res, SUPABASE_URL, SERVICE_ROLE) {
  const id = (req.query?.id || '').toString().trim();
  if (!id) return res.status(400).json({ error: 'missing id' });
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return res.status(400).json({ error: 'invalid id format' });
  }
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/testimonials?id=eq.${encodeURIComponent(id)}`,
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

async function handleSettingsGet(res, SUPABASE_URL, SERVICE_ROLE) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/testimonial_settings?id=eq.1&select=*`, {
      headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: `supabase ${r.status}`, detail: txt });
    }
    const arr = await r.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ settings: arr[0] || { id: 1, card_style: 'classic' } });
  } catch (e) {
    return res.status(500).json({ error: 'settings fetch failed', detail: String(e) });
  }
}

const ALLOWED_STYLES = new Set(['classic', 'compact', 'quote', 'polaroid', 'minimal']);

async function handleSettingsPatch(req, res, SUPABASE_URL, SERVICE_ROLE) {
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};
  const style = String(body.card_style || '').trim();
  if (!ALLOWED_STYLES.has(style)) {
    return res.status(400).json({ error: 'invalid card_style', allowed: [...ALLOWED_STYLES] });
  }
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/testimonial_settings?id=eq.1&select=*`,
      {
        method: 'PATCH',
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ card_style: style, updated_at: new Date().toISOString() }),
      }
    );
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: `supabase ${r.status}`, detail: txt });
    }
    const data = await r.json();
    return res.status(200).json({ settings: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    return res.status(500).json({ error: 'settings patch failed', detail: String(e) });
  }
}
