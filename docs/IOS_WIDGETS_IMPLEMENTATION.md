# iOS Widgets — Implementation (1.1.0)

Status: **JS foundation + native scaffolding landed; native target NOT yet wired or built.**
Target release: **1.1.0** (separate from the 1.0.4 Salah Planner / Qibla work).

## 1. Chosen route

**Route B — native WidgetKit extension via `@bacons/apple-targets` + an App Group.**

`expo-widgets` is **not viable**: there is no first-party Expo package that renders iOS
Home Screen widgets from JS. WidgetKit widgets must be SwiftUI. For an Expo SDK 54 app
using Continuous Native Generation (no committed `ios/`), the standard approach is a
config plugin that injects an Apple target at prebuild time.

Route A (`expo-widgets`): rejected — does not exist as a usable WidgetKit renderer.
Route C (defer): partially applied — the **native build** is deferred to a step the repo
owner runs (Apple portal App Group + EAS dev build), because it cannot be validated in CI
or this environment.

## 2. Packages / plugins

| Package | Role | Status |
|---|---|---|
| `@bacons/apple-targets` | Injects the WidgetKit extension target during prebuild | **To install** (`npx expo install @bacons/apple-targets`) |
| App Group entitlement | Shared container between app + widget | **To register in Apple portal** |

No new runtime JS dependency is required for the small widget. New Architecture is **on**
(`newArchEnabled: true`), so any future JS→App Group writer must be New-Arch safe.

## 3. Files in this pass

JS (safe, type-checked, non-breaking):
- `apps/mobile/src/contracts/widget-runtime.ts` — `WIDGETS_NATIVE_ENABLED` flag, App Group id, shared keys.
- `apps/mobile/src/lib/widget-shared-payload.ts` — minimal `WidgetSharedPayloadV1` + pure builder + best-effort writer (AsyncStorage + sandbox mirror today; App Group seam ready).
- `apps/mobile/src/components/WidgetSnapshotEffects.tsx` — also writes the minimal payload after each snapshot.
- `apps/mobile/app/settings/index.tsx` — Widget Preferences row gated behind `WIDGETS_NATIVE_ENABLED` (hidden until native lands).
- `apps/mobile/eslint.config.js` — ignores `targets/**` (SwiftUI is not JS).

Native scaffolding (inert until the plugin is wired + prebuild):
- `apps/mobile/targets/widgets/expo-target.config.js` — apple-target config (type widget, brand colors, App Group entitlement).
- `apps/mobile/targets/widgets/Shared.swift` — `WidgetSharedPayload` Codable mirror + App Group loader + placeholder.
- `apps/mobile/targets/widgets/index.swift` — timeline provider + small + lock-screen views + `@main` bundle.

## 4. App config changes still required (NOT applied — apply on the native pass)

In `apps/mobile/app.config.ts` add the plugin and the **main app** App Group entitlement:

```ts
// plugins: [...existing, "@bacons/apple-targets"]
// ios: {
//   ...baseIos,
//   entitlements: {
//     ...(baseIos.entitlements ?? {}),
//     "com.apple.security.application-groups": ["group.io.deennotes.app"],
//   },
// }
```

These are intentionally **not** committed yet so current 1.0.4 / production builds stay
byte-for-byte safe. The exact App Group id lives in `widget-runtime.ts` and the Swift
files — change it in one place if you use a different id.

## 5. Shared data strategy

A widget extension cannot read the app sandbox. Flow:

```
prayer snapshot (RN) ──build──▶ WidgetSharedPayloadV1 ──write──▶ App Group
                                                                  │
                                       UserDefaults(suiteName) ◀──┘ (+ file mirror)
                                                                  │
                                       SwiftUI TimelineProvider ◀─┘ reads + renders
```

- Key: `deennotes_widget_payload_v1` in suite `group.io.deennotes.app`.
- The JS writer (`writeWidgetSharedPayload`) currently mirrors to AsyncStorage + the app
  sandbox. The **App Group write** turns on when a native bridge is supplied to
  `getAppGroupBridge()` (a tiny Expo module or a vetted New-Arch package). Until then the
  SwiftUI falls back to its placeholder.

## 6. How widget data updates

- `WidgetSnapshotEffects` rebuilds on prayer/Quran/notes changes, on foreground, and on a
  20s tick (throttled 6s), then writes the minimal payload.
- SwiftUI `getTimeline` reloads ~1 min after the next prayer time, else hourly.
- After writing, native code should call `WidgetCenter.shared.reloadAllTimelines()` (added
  with the native bridge) for near-immediate refresh.

## 7. EAS / provisioning implications

1. Register App Group `group.io.deennotes.app` in the Apple Developer portal; attach to
   the app id `io.deennotes.app` and the new widget extension id (e.g. `io.deennotes.app.widgets`).
2. EAS manages provisioning; let it create/update the extension profile on the next build.
3. Install the plugin, wire app.config.ts (section 4), then:
   - `npx expo prebuild -p ios --clean` (local sanity) **or**
   - `eas build --profile development --platform ios` (recommended first).
4. **Run a development build before production** (per project rule).

## 8. Device QA checklist

- [ ] Dev build installs; app launches normally (no regression to prayer/Quran/Adhan).
- [ ] Long-press Home Screen → add **DeenNotes → Next prayer** (small).
- [ ] Small widget shows: "Next prayer", prayer name, time, "in 1h 12m", emerald/stone style.
- [ ] Lock Screen → add rectangular + inline; both show name + time / remaining.
- [ ] Change city in Prayer tab → reopen app → widget reflects new next prayer within a refresh.
- [ ] Toggle branding in Widget Preferences → reflected after refresh.
- [ ] Airplane mode → widget keeps last payload (no crash, no blank).

## 9. Known limitations

- Only the **small** Home Screen widget + lock-screen accessories are in scope. Medium/large deferred.
- Live second-by-second countdown is not implemented; footer is the pre-computed label and
  refreshes on the timeline cadence.
- App Group write is a documented seam; live data requires the native bridge wired.
- Cannot be tested in Expo Go — requires a dev/production native build.
- Widget Preferences stays hidden until `WIDGETS_NATIVE_ENABLED` is flipped after a
  successful device test.
