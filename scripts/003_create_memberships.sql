-- 003: Create memberships table (user <-> household with role)
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  household_id uuid not null references public.households(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(user_id, household_id)
);

alter table public.memberships enable row level security;

-- Users can see memberships for households they belong to
create policy "memberships_select_member" on public.memberships
  for select using (
    exists (
      select 1 from public.memberships m
      where m.household_id = memberships.household_id
      and m.user_id = auth.uid()
    )
  );

-- Any authenticated user can insert memberships (needed for creating households)
create policy "memberships_insert_auth" on public.memberships
  for insert with check (auth.uid() is not null);

-- Only owners/admins can delete memberships
create policy "memberships_delete_admin" on public.memberships
  for delete using (
    exists (
      select 1 from public.memberships m
      where m.household_id = memberships.household_id
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin')
    )
  );
