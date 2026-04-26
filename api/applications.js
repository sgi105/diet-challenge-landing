// Vercel serverless function — admin-only read of applications.
// Password (hardcoded, shared with admin page): 'qkffl1000'
// Required env (Vercel Project → Settings → Environment Variables):
//   SUPABASE_URL             (https://arjkkooducikmpjeudnc.supabase.co)
//   SUPABASE_SERVICE_ROLE    (service role JWT; server-only — NEVER inline in src)

const ADMIN_PASSWORD = 'qkffl1000';

export default async function handler(req, res) {
  // CORS not needed (same origin), but allow preflight just in case
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

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
