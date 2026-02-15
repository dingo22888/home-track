-- 006: Add location and notes columns to consumers (align with app types)
-- Also rename description to notes if it exists

-- Add location column if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'consumers' and column_name = 'location'
  ) then
    alter table public.consumers add column location text;
  end if;
end $$;

-- Add notes column if not exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'consumers' and column_name = 'notes'
  ) then
    alter table public.consumers add column notes text;
  end if;
end $$;

-- Rename created_by to recorded_by in readings if needed (the column is already created_by, which is fine)
-- The readings table uses 'created_by' in DB but we reference it as 'recorded_by' in types
-- Let's add recorded_by alias - actually let's just align types to match DB
