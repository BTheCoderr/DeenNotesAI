# M6 — TestFlight, beta, and App Store prep

Operational checklist plus **copy you can paste** into App Store Connect. **Screenshots**: capture manually from Simulator/device when UI matches the flows below — do not bundle synthetic images in the repo yet.

---

## 1. EAS / TestFlight checklist

### One-time Expo project

From `apps/mobile` (repo root):

```bash
npm install -g eas-cli   # if needed
eas login
eas init --id    # creates/links project; note Project ID
```

### OTA updates (optional but recommended before beta)

After init:

```bash
cd apps/mobile
eas update:configure
```

Set **EAS secret** or local env **`EXPO_UPDATES_URL`** to the dashboard URL Expo prints (`https://u.expo.dev/<project-id>`). [`apps/mobile/app.config.ts`](../apps/mobile/app.config.ts) reads this at config time — without it, native builds still work; OTA is disabled until the URL exists.

### Versioning

- **Marketing version:** [`apps/mobile/app.json`](../apps/mobile/app.json) `expo.version` (e.g. `1.0.0`).
- **Runtime:** `runtimeVersion.policy: appVersion` ties native runtime to marketing version — bump **`version`** when native modules change materially.
- **iOS build number:** [`eas.json`](../apps/mobile/eas.json) `production.autoIncrement: true` helps consecutive TestFlight uploads.

### Build commands

```bash
cd apps/mobile

eas build --platform ios --profile development
eas build --platform ios --profile preview
eas build --platform ios --profile production
eas build --platform android --profile preview
eas build --platform android --profile production
```

### Verified static config

| Item | Location |
|------|-----------|
| iOS bundle id | `io.deennotes.app` |
| Android package | `io.deennotes.app` |
| Icons / splash | `app.json` |
| Light mode default | `userInterfaceStyle: "light"` |
| Background audio | `UIBackgroundModes`: `audio` |
| Location | Prayer locality (`expo-location` plugin string) |
| Microphone | Khutbah capture (`expo-av` plugin string) |
| Notifications | Local salah reminders (`expo-notifications`) |

---

## 2. Screenshot-ready UI states (manual capture)

| Theme | Where | Hint |
|--------|--------|------|
| **Today** | Prayer loaded | Hero + wordmark header + countdown + Continue reading |
| **New sheet** | Modal open | Close + centered wordmark + capture list |
| **Today offline** | Airplane Mode | Calm empty/error card |
| **Quran list** | Quran tab | List + offline ribbon optional |
| **Quran immersive** | Reader + Quran settings immersive on | Larger Arabic, translation fade |
| **Prayer settings** | Prayer → Settings segment | Notifications + locality |
| **Compose** | Signed-in | Draft area + accessibility labels |

---

## 3. App Store Connect copy (starter)

**Subtitle (≤30 chars):** Quiet Quran, prayer, notes

**Description (adapt):**

> DeenNotes is a calm companion for remembering what benefits the heart — without a social feed or cluttered dashboard.

> • **Today** — salah rhythm for your locality  
> • **Quran** — read with optional meaning; immersive mode; selective offline caches and listening prep  
> • **Prayer** — timings; optional **local-only** reminders  
> • **Reflect** — capture reminders and structured reflections when you sign in  

> Islamic practice stays with scholars and trusted teachers — this app is remembrance first, opinion second.

**Keywords (examples):**

`Islam,Quran,Muslim,prayer,salah,journaling,Quran offline`

---

## 4. Analytics & logs

- Sentry: `EXPO_PUBLIC_SENTRY_DSN`; `sendDefaultPii: false`; extras sanitized (`apps/mobile/src/lib/sentry/mobile.ts`).
- Tags only: coarse flags — **no scripture text or user drafts** in event extras.

---

## 5. QA commands

```bash
cd apps/mobile && npx expo-doctor && npx tsc --noEmit
cd .. && npm run lint && npm run build
```

---

## 6. Beta flow

1. EAS Internal + TestFlight preview profile  
2. Cold start / offline Quran / compose / playback smoke  
3. Production OTA channel after baseline runtime is stable  

---

## 7. M6.5 — Beta UX polish (what shipped + how to prioritize tests)

### Screenshot-ready states (extend §2)

| State | Hint |
|--------|------|
| **Onboarding / completion** | Success card + disclaimer before “Go to Today” |
| **Reflect empty** | “Quiet shelf” copy + CTAs |

### Biggest UX risks (beta watchlist)

| Risk | Mitigation baked in |
|------|---------------------|
| **Prayer times wrong or blank** | Calm error copy; Prayer → Settings routing hints; pull-to-refresh on Today + Prayer (Today segment) |
| **Permission overwhelm** | Onboarding framing + “Not now” language; reminders still work without notifs in-app |
| **Recording feels fragile** | Clear “keep screen open” copy (iOS/Android); user-facing alert if finalize fails |

### Biggest retention risks

- **Cold start friction:** onboarding must feel optional/light — helper text reinforces “nothing scored.”
- **No obvious “daily win”** if prayer API fails repeatedly — testers should validate offline emotional tone, not numeric accuracy alone.
- **Reflect empty when signed out** — intentional; retention depends on clarity that sign-in connects library.

### Onboarding improvements (recommended next)

1. Consider a **Skip to Today** ghost link on welcome only (if you want even lower funnel drop).
2. **Preview one ayah or prayer line** post-completion optional — defer if it feels like scope creep.

### Test with beta users **first**

1. Onboarding completion → Today hero loads (Wi‑Fi + cellular).
2. Pull-to-refresh on Today and Prayer → Today after location change simulation.
3. Prayer → Settings → manual city vs device; notification permission deny path.
4. Quran reader → immersive toggle; offline ribbon; Save surah audio on Wi‑Fi.
5. Khutbah record → foreground only; discard + save paths.
6. App background 2–5 minutes → resume; note any countdown or audio drift without treating as launch blocker.

### Verify on **real devices** (manual)

- Local salah notifications after granting permission
- Offline: Today error card; cached Quran verses where applicable
- Recording: interruption, short capture, save failure alert
- **Analytics:** crash-only posture (Sentry); no product funnel analytics in-app yet — treat session replays / funnels as post-beta instrumentation if desired.

### Defer until **after beta**

- Rich Ramadan/grid UX; fuller month calendar interactions
- System dark theme; lock-screen Quran artwork
- Automated retention dashboards (unless you add a deliberate minimal event layer)

---

## 8. Explicit launch blockers

| Gap | Resolve |
|-----|---------|
| Apple Developer + ASC record | Ops |
| Expo `eas init` | Link project ID |
| EAS secrets: `EXPO_PUBLIC_NEXT_ORIGIN`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, Sentry | Production env (Supabase baked in at **native build** time) |
| Regenerate raster icons (`npm run mobile:icons`) before `eas build` | Home-screen + OTA update placeholder uses `apps/mobile/assets/icon.png` |
| `EXPO_UPDATES_URL` | If using OTA |

**Backlog (non-blocking beta):** system dark palette; richer lock-screen Quran metadata (`expo-av` limits).
