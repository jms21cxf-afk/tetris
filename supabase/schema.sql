-- Supabase SQL Editor에서 실행하세요.

create table if not exists public.scores (
  id bigint generated always as identity primary key,
  nickname text not null check (char_length(nickname) between 2 and 12),
  score integer not null check (score > 0 and score <= 99999999),
  created_at timestamptz not null default now()
);

create index if not exists scores_score_desc_idx on public.scores (score desc);

alter table public.scores enable row level security;

-- 서버(API)에서 service role key로 접근하므로 anon 정책은 없어도 됩니다.
