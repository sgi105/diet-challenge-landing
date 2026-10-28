-- 시즌7부터 토스페이먼츠 참가비 결제(/s7/join) 기록. api/toss-confirm.js 가 서비스 키로 INSERT 한다.
-- 결제 취소·환불 대조는 payment_key / order_id 로 한다.
create table if not exists public.toss_orders (
  order_id     text primary key,
  payment_key  text not null unique,
  cohort_code  text not null,
  amount       integer not null,
  status       text,              -- DONE | CANCELED | PARTIAL_CANCELED ...
  method       text,              -- 카드 | 간편결제 ...
  name         text,
  phone        text,
  is_test      boolean not null default false,
  approved_at  timestamptz,
  raw          jsonb,
  created_at   timestamptz not null default now()
);

alter table public.toss_orders enable row level security;  -- anon 접근 없음(서비스 키만)

create index if not exists toss_orders_cohort_idx on public.toss_orders (cohort_code);
