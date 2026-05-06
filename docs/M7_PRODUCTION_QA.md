# M7 Production hardening & real-device QA

Internal checklist for DeenNotes mobile before widening beta. Pair with **`Settings → Internal QA checklist`** (development builds only).

## Critical flows

- **Cold start**: app opens Today; onboarding gate works for first launch.
- **Today**: prayers load / graceful offline card; pull-to-refresh.
- **Prayer tab**: month view, reminders, offline cache survives relaunch.
- **Quran**: surah list; open surah; cached reading in airplane mode; audio play/pause/background where applicable.
- **Reflect**: list load; open note; sign-in gated paths behave.
- **New sheet modal**: modes navigate; Coming soon alerts.
- **Compose**: paste / quran reflection / reminders complete without crash.
- **Recording**: start/stop khutbah; title edit; persists after restart; player works.
- **Recording detail**: play, rename, delete, link to reflection.
- **Settings**: profile, continuity, widgets, offline, sign out.

## Known issues (tracked in QA screen / code)

- **React Query offline**: globally aligned with NetInfo (`queryClient`), but individual hooks may still show stale timestamps until verified on device.
- **Long reflection bodies**: Markdown/render path not stress-tested at very large payloads on oldest supported iPhones.
- **Widgets**: payloads depend on snapshot jobs; validate on physical device after reinstall.

## Release blockers

- [ ] **No red-screen regressions** on Quran reader, Prayer, Reflect, Compose, Recording, note detail paths (manual + Sentry sanity).
- [ ] **Offline**: open previously visited surah in airplane mode; Today + Prayer degrade without hard crash.
- [ ] **Permissions**: location + notifications flows explained and dismissal paths safe.
- [ ] **Sentry DSN**: staging/prod environments receive at least one controlled test event (then resolve).

## Deferred items

- Full **VoiceOver audit** script (automate or checklist per screen).
- **Spring physics** on all cards vs. standardized press feedback (risk of inconsistent feel).
- Systematic migration of legacy `StyleSheet` literals to **`design-tokens`** only where duplicated.
- **Memory profiling** (Instruments): Quran audio prefetch window, longest reflection, khutbah file sizes.

## TestFlight checklist

- [ ] Version + build number bumped; changelog written.
- [ ] Internal testers added; mandatory update path tested.
- [ ] Install from TF over prior build (migration sanity).
- [ ] Sign in/out with real Supabase project.
- [ ] Crash-free session smoke (15 min mixed navigation).

## OTA (Expo) checklist

- [ ] `eas update` channel matches release track.
- [ ] Native module changes flagged (if any) — require new binary not OTA-only.
- [ ] Rollback plan documented (previous compatible revision).

## Sentry checklist

- [ ] DSN loaded in prod profile (`MobileMonitoringBootstrap` / env).
- [ ] `captureAppIssue` receives **render boundary** events (`ScreenErrorBoundary`).
- [ ] Privacy: no raw reflection text in breadcrumbs by default.

## Offline checklist

- [ ] Airplane mode: Today shows calm error + retry, no infinite spin.
- [ ] Quran: previously opened surah readable from cache; ribbon when network uncertain.
- [ ] Prayer: cached month/today after prior online session.
- [ ] Recordings: list + detail from local storage after force-quit.
- [ ] Reflect: cached list where implemented; sign-in expectations clear.

## Permissions checklist

- [ ] Location: prayer accuracy message; denied path still usable with manual city (if supported).
- [ ] Notifications: opt-in copy; OS settings deep link if applicable.
- [ ] Microphone: recording flow explains use; denial path exits gracefully.

## QA commands (CI / local)

```bash
cd apps/mobile && npx tsc --noEmit && npx expo-doctor
```

Repository root:

```bash
npm run lint && npm run build
```

---

_Update this file as blockers clear; keep “deferred” honest so release notes stay trusted._
