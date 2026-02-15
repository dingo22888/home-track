-- 008: Fix household creation.
--
-- Problem: There is no INSERT policy on households, and even if there were,
-- the two-step approach (insert household, then insert membership) fails because
-- after insert the user isn't yet a member so the SELECT policy blocks .select().
--
-- Fix: 
-- 1) Add a permissive INSERT policy (any authenticated user can create a household).
-- 2) Create a security-definer function that atomically creates the household
--    AND the owner membership in one transaction, bypassing RLS.

-- Step 1: Add INSERT policy for households (any logged-in user can create)
drop policy if exists "households_insert_authenticated" on public.households;
create policy "households_insert_authenticated" on public.households
  for insert with check (auth.uid() is not null);

-- Step 2: Add INSERT policy for memberships
-- Users can insert a membership for themselves only
drop policy if exists "memberships_insert_self" on public.memberships;
create policy "memberships_insert_self" on public.memberships
  for insert with check (auth.uid() = user_id);

-- Step 3: Create atomic function that creates household + owner membership
create or replace function public.create_household_with_owner(
  p_name text,
  p_address text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_household_id uuid;
begin
  -- Get the calling user
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Create the household
  insert into public.households (name, address, created_by)
  values (p_name, p_address, v_user_id)
  returning id into v_household_id;

  -- Create the owner membership
  insert into public.memberships (user_id, household_id, role)
  values (v_user_id, v_household_id, 'owner');

  return v_household_id;
end;
$$;
