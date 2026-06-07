# Salah Planner MVP

First step toward a **salah-centered daily operating system** inside DeenNotes AI.

## Product intent

DeenNotes already helps users read Quran, reflect, and stay connected to prayer times. Salah Planner adds a lightweight **day structure around the five daily prayers** — without replacing the Prayer tab, notification scheduling, or existing reminder wiring.

This MVP is intentionally local-first and narrow:

- Five prayer windows (Fajr, Dhuhr, Asr, Maghrib, Isha)
- One or more tasks per window
- Task completion
- One reflection prompt under Dhuhr: *"What do you want to return to before the next prayer?"*
- Progress surfaced on the **Today** tab entry card

Future modules (ADHD-friendly notes, sleep, fitness, habit discipline) can attach to these same slots without re-architecting navigation.

## Where it lives in the app

| Surface | Role |
|--------|------|
| **Today tab** | Entry card with completion summary (`SalahPlannerEntryCard`) |
| **Prayer tab** | Shortcut row → full planner screen |
| **`/salah-planner`** | Stack screen (header back → tabs) — not a new bottom tab |

**Why not a sixth tab?** The five-tab IA (Reflect · Today · New · Quran · Prayer) is stable in production. Planner is a focused sub-flow reachable from Today and Prayer — similar to Quran reader or Settings stacks.

## Storage

- **AsyncStorage** key: `deennotes.mobile.salahPlanner.v1`
- Plans keyed by local calendar day (`YYYY-MM-DD`), last 14 days retained
- Pattern matches existing mobile prefs (`continuity-storage`, `prayer-reminder-storage`)

Supabase sync is deferred until there is a clear cross-device need and a minimal RLS table design.

## Learning mode (secondary)

Settings → **Learning mode** toggles gentler copy on Today and Salah Planner. It does **not** change prayer calculations, Quran API routes, or notification scheduling.

Disclaimer (in-app): learning mode does not replace scholars or formal guidance.

## Out of scope for this MVP

- Calendar sync (Google/Apple)
- Push notifications tied to planner tasks
- Quran reading attachment per slot
- Streak gamification beyond existing journey streak on Today
- Supabase cloud sync
- Premium gating

## Manual test checklist (iPhone)

1. Open **Today** → tap **Salah Planner** card → add tasks under Fajr and Dhuhr
2. Mark a task complete → return to Today → card shows `1 of N complete`
3. Open **Prayer** → tap **Salah Planner** shortcut → same plan visible
4. Write reflection under Dhuhr → kill app → reopen → text persists for today
5. Settings → **Learning mode** ON → planner copy softens; OFF → standard copy
6. Airplane mode → planner still works; prayer times show offline banner

## Related files

```
apps/mobile/app/salah-planner/index.tsx
apps/mobile/src/components/salah-planner/SalahPlannerEntryCard.tsx
apps/mobile/src/contracts/salah-planner.ts
apps/mobile/src/lib/salah-planner-storage.ts
apps/mobile/app/settings/learning-mode.tsx
apps/mobile/src/lib/learning-mode-storage.ts
```

## Strategic direction

Salah Planner is the foundation for DeenNotes as a daily Islamic OS:

1. **Now:** Plan + reflect around salah windows (this MVP)
2. **Next:** Attach Quran reading goals to slots; gentle post-prayer prompts
3. **Later:** Discipline modules (sleep, fitness, budgeting) reuse the same slot model

Do not expand into all ten product ideas at once — ship retention loops first, then module depth.
