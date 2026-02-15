-- 002: Create households table
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.households enable row level security;

-- Users can see households they are a member of
create policy "households_select_member" on public.households
  for select using (
    exists (
      select 1 from public.memberships m
      where m.household_id = households.id
      and m.user_id = auth.uid()
    )
  );

-- Any authenticated user can create a household
create policy "households_insert_auth" on public.households
  for insert with check (auth.uid() is not null);

-- Only owners can update a household
create policy "households_update_owner" on public.households
  for update using (
    exists (
      select 1 from public.memberships m
      where m.household_id = households.id
      and m.user_id = auth.uid()
      and m.role = 'owner'
    )
  );

-- Only owners can delete a household
create policy "households_delete_owner" on public.households
  for delete using (
    exists (
      select 1 from public.memberships m
      where m.household_id = households.id
      and m.user_id = auth.uid()
      and m.role = 'owner'
    )
  );

-- Auto-update updated_at
create trigger households_updated_at
  before update on public.households
  for each row
  execute function public.handle_updated_at();
