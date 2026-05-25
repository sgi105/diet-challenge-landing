// Supabase REST insert (no SDK dependency)
//
// 환경변수 (.env 또는 Vercel):
//   VITE_SUPABASE_URL       (예: https://xxxxx.supabase.co)
//   VITE_SUPABASE_ANON_KEY  (eyJ... JWT)
//
// Supabase 테이블 SQL (Supabase SQL Editor에서 실행):
//   create table public.applications (
//     id uuid primary key default gen_random_uuid(),
//     created_at timestamptz default now(),
//     name text not null,
//     age int not null,
//     phone text not null,
//     phone_country text default 'KR',
//     job text not null,
//     region text not null,
//     running_exp text not null,
//     motivation text not null,
//     instagram text,
//     referrer_name text,
//     agree_deposit boolean default false,
//     agree_schedule boolean default false
//   );
//   -- 추천인 전형용 referrer_name 컬럼 (이미 테이블이 있다면):
//   --   alter table public.applications add column if not exists referrer_name text;
//   alter table public.applications enable row level security;
//   create policy "Allow anonymous insert" on public.applications
//     for insert to anon with check (true);
//
// Waitlist 테이블 SQL (다음 시즌 사전알림용 — Supabase SQL Editor에서 1회 실행):
//   create table public.waitlist (
//     id uuid primary key default gen_random_uuid(),
//     created_at timestamptz default now(),
//     name text not null,
//     contact text not null,
//     contact_type text not null default 'instagram',
//     note text
//   );
//   alter table public.waitlist enable row level security;
//   create policy "Allow anonymous insert" on public.waitlist
//     for insert to anon with check (true);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function submitApplication(form) {
  const payload = {
    name: form.name.trim(),
    age: parseInt(form.age, 10),
    gender: form.gender === 'M' || form.gender === 'F' ? form.gender : null,
    phone: form.phone.trim(),
    phone_country: form.phoneCountry,
    job: form.job.trim(),
    region: form.region.trim(),
    running_exp: form.runningExp,
    motivation: form.motivation.trim(),
    instagram: form.instagram?.trim() || null,
    kakao_id: form.kakaoId?.trim() || null,
    referrer_name: form.referrerName?.trim() || null,
    agree_deposit: !!form.agreeDeposit,
    agree_schedule: !!form.agreeSchedule,
  };

  const API_BASE = import.meta.env.DEV ? 'https://challenge.samuraihabits.com' : '';
  const res = await fetch(`${API_BASE}/api/submit-application`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`제출 실패 (${res.status}): ${errText}`);
  }

  const data = await res.json().catch(() => ({}));
  return { id: data?.id || null };
}

export async function attachFriend({ id, friend }) {
  if (!id) return;
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/applications?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ friend_name: friend.trim() }),
    }
  );
  // friend_name 컬럼 없으면 에러 무시 — attachFriend는 optional
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    if (!errText.includes('friend_name')) {
      throw new Error(`친구 추가 실패 (${res.status}): ${errText}`);
    }
  }
}

export async function submitWaitlist({ name, contact, contactType, note }) {
  // 서버 엔드포인트 — 텔레그램 캡처가 1차, DB는 best-effort.
  const res = await fetch('/api/submit-waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: (name || '').trim(),
      contact: (contact || '').trim(),
      contact_type: contactType || 'instagram',
      note: (note || '').trim() || undefined,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`사전알림 신청 실패 (${res.status}): ${errText}`);
  }
}

