-- DeenNotes AI: initial schema
-- Run in Supabase SQL Editor or via supabase db push

create extension if not exists "pgcrypto";

-- Note categories
create type public.note_type as enum (
  'khutbah',
  'lecture',
  'quran_reflection',
  'halaqa',
  'personal_reminder'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deen_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  note_type public.note_type not null,
  title text not null,
  raw_input text not null,
  summary text not null default '',
  short_summary text not null default '',
  main_reminder text not null default '',
  key_reminders jsonb not null default '[]'::jsonb,
  action_steps jsonb not null default '[]'::jsonb,
  reflection_questions jsonb not null default '[]'::jsonb,
  dua_prompts jsonb not null default '[]'::jsonb,
  share_card_text text not null default '',
  disclaimer text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_share_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  deen_note_id uuid references public.deen_notes (id) on delete set null,
  share_card_text text not null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create trigger deen_notes_updated_at
  before update on public.deen_notes
  for each row
  execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.deen_notes enable row level security;
alter table public.saved_share_cards enable row level security;

create policy "Profiles select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Notes select own"
  on public.deen_notes for select
  using (auth.uid() = user_id);

create policy "Notes insert own"
  on public.deen_notes for insert
  with check (auth.uid() = user_id);

create policy "Notes update own"
  on public.deen_notes for update
  using (auth.uid() = user_id);

create policy "Notes delete own"
  on public.deen_notes for delete
  using (auth.uid() = user_id);

create policy "Share cards select own"
  on public.saved_share_cards for select
  using (auth.uid() = user_id);

create policy "Share cards insert own"
  on public.saved_share_cards for insert
  with check (auth.uid() = user_id);

create policy "Share cards delete own"
  on public.saved_share_cards for delete
  using (auth.uid() = user_id);

create index deen_notes_user_created_idx
  on public.deen_notes (user_id, created_at desc);

create index saved_share_cards_user_idx
  on public.saved_share_cards (user_id, created_at desc);
