// Public read endpoint — masked applicants for social proof on landing.
// 노출: 마스킹된 이름, 나이, 시(도)만, 러닝 경력, 동기 일부, 정규화된 인스타 핸들(아바타용), 시간
// 비노출: 핸드폰, 동의 여부, 풀 지역
// Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return res.status(500).json({ error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE not configured' });
  }

  try {
    // ⚠️ select 화이트리스트 — referrer_name은 절대 포함 금지 (개인정보 + 추천인 신원 보호).
    //    phone, agree_*, referrer_name 추가 금지. 새 컬럼은 검토 후에만 노출.
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/applications?select=name,age,region,running_exp,motivation,instagram,created_at&order=created_at.desc&limit=50`,
      {
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          Prefer: 'count=exact',
        },
      }
    );
    if (!r.ok) {
      const txt = await r.text();
      return res.status(r.status).json({ error: `supabase ${r.status}`, detail: txt });
    }
    const rows = await r.json();

    // 전체 count는 Content-Range 헤더에서
    let count = rows.length;
    const range = r.headers.get('content-range');
    if (range) {
      const m = range.match(/\/(\d+)/);
      if (m) count = parseInt(m[1], 10);
    }

    const recent = rows.map((row) => ({
      name: maskName(row.name),
      age: row.age,
      region: shortRegion(row.region),
      running_exp: row.running_exp,
      motivation: truncate(row.motivation, 90),
      instagram: normalizeInstagram(row.instagram),
      created_at: row.created_at,
    }));

    // 30s 캐시 — 너무 짧으면 Supabase 비용↑, 너무 길면 실시간감↓
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30');
    return res.status(200).json({ count, recent });
  } catch (e) {
    return res.status(500).json({ error: 'fetch failed', detail: String(e) });
  }
}

function maskName(name) {
  if (!name) return '익명';
  const s = name.trim();
  if (s.length <= 1) return s;
  if (s.length === 2) return s[0] + 'O';
  if (s.length === 3) return s[0] + 'O' + s[2];
  // 4+
  return s[0] + 'O'.repeat(s.length - 2) + s[s.length - 1];
}

function shortRegion(region) {
  if (!region) return '';
  // 첫 단어만 — "서울 마포구" → "서울"
  return region.trim().split(/\s+/)[0];
}

function truncate(s, n) {
  if (!s) return '';
  const t = s.trim();
  if (t.length <= n) return t;
  return t.slice(0, n).trim() + '…';
}

// "@user", "user", "https://instagram.com/user/..." → "user"
// 영문/숫자/._ 만 허용. 부적절하면 빈 문자열.
function normalizeInstagram(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  if (!s) return '';
  // URL 형태에서 핸들 추출
  const urlMatch = s.match(/instagram\.com\/([^\/?#\s]+)/i);
  if (urlMatch) s = urlMatch[1];
  // 선두 @ 제거
  s = s.replace(/^@+/, '');
  // 트레일링 슬래시 제거
  s = s.replace(/\/+$/, '');
  // 한글/공백/특수문자 들어오면 무효 처리
  if (!/^[A-Za-z0-9._]{1,30}$/.test(s)) return '';
  return s.toLowerCase();
}
