-- Production hardening applied 2026-09-29.
-- Keeps current app behavior while tightening privileged functions,
-- optimizing ownership RLS checks, and covering the share-card FK.

alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

alter function public.set_updated_at() set search_path = '';

alter policy "Profiles select own"
  on public.profiles
  using ((select auth.uid()) = id);

alter policy "Profiles update own"
  on public.profiles
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Notes select own"
  on public.deen_notes
  using ((select auth.uid()) = user_id);

alter policy "Notes insert own"
  on public.deen_notes
  with check ((select auth.uid()) = user_id);

alter policy "Notes update own"
  on public.deen_notes
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Notes delete own"
  on public.deen_notes
  using ((select auth.uid()) = user_id);

alter policy "Share cards select own"
  on public.saved_share_cards
  using ((select auth.uid()) = user_id);

alter policy "Share cards insert own"
  on public.saved_share_cards
  with check ((select auth.uid()) = user_id);

alter policy "Share cards delete own"
  on public.saved_share_cards
  using ((select auth.uid()) = user_id);

alter policy "user_onboarding_select_own"
  on public.user_onboarding_profiles
  using ((select auth.uid()) = user_id);

alter policy "user_onboarding_insert_own"
  on public.user_onboarding_profiles
  with check ((select auth.uid()) = user_id);

alter policy "user_onboarding_update_own"
  on public.user_onboarding_profiles
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists saved_share_cards_deen_note_id_idx
  on public.saved_share_cards (deen_note_id);
