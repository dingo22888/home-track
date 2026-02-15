-- 002: Create households table (no RLS policies yet - memberships table needed first)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.households enable row level security;

-- Auto-update updated_at
create trigger households_updated_at
  before update on public.households
  for each row
  execute function public.handle_updated_at();
