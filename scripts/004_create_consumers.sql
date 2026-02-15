-- 004: Create consumers table (generic consumption entity)
create table if not exists public.consumers (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  type text not null default 'custom',
  unit text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.consumers enable row level security;

-- Users can see consumers for households they belong to
create policy "consumers_select_member" on public.consumers
  for select using (
    exists (
      select 1 from public.memberships m
      where m.household_id = consumers.household_id
      and m.user_id = auth.uid()
    )
  );

-- Members can insert consumers for their households
create policy "consumers_insert_member" on public.consumers
  for insert with check (
    exists (
      select 1 from public.memberships m
      where m.household_id = consumers.household_id
      and m.user_id = auth.uid()
    )
  );

-- Members can update consumers for their households
create policy "consumers_update_member" on public.consumers
  for update using (
    exists (
      select 1 from public.memberships m
      where m.household_id = consumers.household_id
      and m.user_id = auth.uid()
    )
  );

-- Only owners/admins can delete consumers
create policy "consumers_delete_admin" on public.consumers
  for delete using (
    exists (
      select 1 from public.memberships m
      where m.household_id = consumers.household_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

-- Auto-update updated_at
create trigger consumers_updated_at
  before update on public.consumers
  for each row
  execute function public.handle_updated_at();

-- Index for common queries
create index if not exists idx_consumers_household on public.consumers(household_id);
