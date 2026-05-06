-- Optional onboarding answers (RLS: own row only). App also persists to localStorage when offline.

create table if not exists public.user_onboarding_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  purpose text,
  age_group text,
  user_type text,
  struggles text[] default '{}',
  completed_at timestamptz
);

alter table public.user_onboarding_profiles enable row level security;

-- Idempotent: safe if a previous push partially applied (table + policies already exist).
drop policy if exists "user_onboarding_select_own" on public.user_onboarding_profiles;
drop policy if exists "user_onboarding_insert_own" on public.user_onboarding_profiles;
drop policy if exists "user_onboarding_update_own" on public.user_onboarding_profiles;

create policy "user_onboarding_select_own"
  on public.user_onboarding_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_onboarding_insert_own"
  on public.user_onboarding_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_onboarding_update_own"
  on public.user_onboarding_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
