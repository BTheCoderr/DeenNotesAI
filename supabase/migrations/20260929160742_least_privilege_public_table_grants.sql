-- Production least-privilege grants applied 2026-09-29.
-- Anonymous callers need no direct public-table access. Authenticated callers
-- receive only operations supported by the app's existing RLS policies.

revoke all privileges on table
  public.profiles,
  public.deen_notes,
  public.saved_share_cards,
  public.user_onboarding_profiles
from anon;

revoke all privileges on table
  public.profiles,
  public.deen_notes,
  public.saved_share_cards,
  public.user_onboarding_profiles
from authenticated;

grant select, update
  on table public.profiles
  to authenticated;

grant select, insert, update, delete
  on table public.deen_notes
  to authenticated;

grant select, insert, delete
  on table public.saved_share_cards
  to authenticated;

grant select, insert, update
  on table public.user_onboarding_profiles
  to authenticated;
