-- Add structured summary fields for projects that ran 001 before these columns existed.
-- Safe to run after 001; no-op if columns already exist (e.g. fresh 001 already includes them).

alter table public.deen_notes
  add column if not exists short_summary text not null default '',
  add column if not exists main_reminder text not null default '';

update public.deen_notes
set short_summary = summary
where trim(short_summary) = ''
  and trim(coalesce(summary, '')) <> '';

comment on column public.deen_notes.short_summary is 'Concise paraphrase of the user notes';
comment on column public.deen_notes.main_reminder is 'Single primary takeaway line';
