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
//     agree_deposit boolean default false,
//     agree_schedule boolean default false
//   );
//   alter table public.applications enable row level security;
//   create policy "Allow anonymous insert" on public.applications
//     for insert to anon with check (true);

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function submitApplication(form) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다.');
  }

  const payload = {
    name: form.name.trim(),
    age: parseInt(form.age, 10),
    phone: form.phone.trim(),
    phone_country: form.phoneCountry,
    job: form.job.trim(),
    region: form.region.trim(),
    running_exp: form.runningExp,
    motivation: form.motivation.trim(),
    instagram: form.instagram.trim() || null,
    agree_deposit: !!form.agreeDeposit,
    agree_schedule: !!form.agreeSchedule,
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`제출 실패 (${res.status}): ${errText}`);
  }
}
