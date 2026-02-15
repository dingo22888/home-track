-- 003b: RLS policies for households and memberships (both tables must exist first)

-- === HOUSEHOLDS POLICIES ===

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

-- === MEMBERSHIPS POLICIES ===

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
