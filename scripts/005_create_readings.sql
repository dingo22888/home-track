-- 005: Create readings table (meter readings / consumption data)
create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  consumer_id uuid not null references public.consumers(id) on delete cascade,
  value numeric not null,
  reading_date date not null,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.readings enable row level security;

-- Users can see readings for consumers in their households
create policy "readings_select_member" on public.readings
  for select using (
    exists (
      select 1 from public.memberships m
      join public.consumers c on c.household_id = m.household_id
      where c.id = readings.consumer_id
      and m.user_id = auth.uid()
    )
  );

-- Members can insert readings for consumers in their households
create policy "readings_insert_member" on public.readings
  for insert with check (
    exists (
      select 1 from public.memberships m
      join public.consumers c on c.household_id = m.household_id
      where c.id = readings.consumer_id
      and m.user_id = auth.uid()
    )
  );

-- Members can update their own readings
create policy "readings_update_own" on public.readings
  for update using (
    readings.created_by = auth.uid()
    and exists (
      select 1 from public.memberships m
      join public.consumers c on c.household_id = m.household_id
      where c.id = readings.consumer_id
      and m.user_id = auth.uid()
    )
  );

-- Only owners/admins can delete readings
create policy "readings_delete_admin" on public.readings
  for delete using (
    exists (
      select 1 from public.memberships m
      join public.consumers c on c.household_id = m.household_id
      where c.id = readings.consumer_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );

-- Performance indexes
create index if not exists idx_readings_consumer_date on public.readings(consumer_id, reading_date desc);
create index if not exists idx_readings_created_by on public.readings(created_by);
