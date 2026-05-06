-- Optional structured Quran citations from AI (`quran_refs` JSON array of {chapter, verse}).
alter table public.deen_notes
  add column if not exists quran_refs jsonb;

comment on column public.deen_notes.quran_refs is
  'Structured ayah citations (chapter 1–114, verse) from AI JSON; nullable for legacy rows.';
