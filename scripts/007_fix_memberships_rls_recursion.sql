-- 007: Fix infinite recursion in memberships RLS policies.
--
-- Problem: memberships_select_member does "select from memberships" which
-- triggers itself, causing infinite recursion. Same for memberships_delete_admin.
--
-- Fix: For memberships SELECT, the user should simply see rows where they are
-- the member (user_id = auth.uid()) OR rows that share a household_id with a
-- row where they are the member. The simplest non-recursive approach:
-- a user can see any membership row where user_id = auth.uid().
-- To also see OTHER members of their households we need a non-recursive check.
-- The standard Supabase pattern is to use a security-definer function.

-- Step 1: Create a security-definer helper function that bypasses RLS
create or replace function public.get_my_household_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id
  from public.memberships
  where user_id = auth.uid();
$$;

-- Step 2: Drop the old recursive policies
drop policy if exists "memberships_select_member" on public.memberships;
drop policy if exists "memberships_delete_admin" on public.memberships;

-- Step 3: Recreate memberships SELECT policy using the helper function (no recursion)
create policy "memberships_select_member" on public.memberships
  for select using (
    household_id in (select public.get_my_household_ids())
  );

-- Step 4: Recreate memberships DELETE policy using the helper function
-- Only owners/admins can delete. We use a two-part check:
-- 1) The row's household must be one of my households (via helper)
-- 2) My role in that household must be owner or admin (checked via helper too)
create or replace function public.is_household_admin(p_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.memberships
    where household_id = p_household_id
    and user_id = auth.uid()
    and role in ('owner', 'admin')
  );
$$;

create policy "memberships_delete_admin" on public.memberships
  for delete using (
    public.is_household_admin(household_id)
  );

-- Step 5: Also fix the households policies that query memberships.
-- These are not recursive themselves but they hit the memberships SELECT policy.
-- Now that memberships SELECT uses the helper, these should work fine.
-- But let's also update households to use the helper for consistency and performance.

drop policy if exists "households_select_member" on public.households;
drop policy if exists "households_update_owner" on public.households;
drop policy if exists "households_delete_owner" on public.households;

create policy "households_select_member" on public.households
  for select using (
    id in (select public.get_my_household_ids())
  );

create policy "households_update_owner" on public.households
  for update using (
    public.is_household_admin(id)
  );

create policy "households_delete_owner" on public.households
  for delete using (
    exists (
      select 1 from public.memberships
      where household_id = households.id
      and user_id = auth.uid()
      and role = 'owner'
    )
  );
-- Note: households_delete_owner still does a direct memberships query but
-- that's fine because the memberships SELECT policy is now non-recursive.
