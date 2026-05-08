# Mobile launch — Expo Go vs EAS builds

Use this doc for **final QA**, **App Store screenshots**, and **RevenueCat / notifications** validation. The project uses native modules that **do not** behave like production inside **Expo Go**.

---

## 1. Expo Go is only for quick UI checks

- **Expo Go** is fine for a **fast layout / navigation** smoke test when Metro is running.
- It is **not** a substitute for a compiled app: StoreKit, entitlements, and many native plugins differ or run in degraded modes.
- You may see **Metro noise** and **limited** RevenueCat / notification behavior — that is expected.

---

## 1b. Quran background audio — EAS **development** / **development:device** (not Expo Go)

Background **Quran recitation** with the app backgrounded or the screen locked requires:

- A **native binary** with `UIBackgroundModes` → `audio` (already set in this project) **and**
- `expo-av` **`staysActiveInBackground: true`** (configured in `QuranPlaybackProvider`).

**Expo Go (`executionEnvironment: storeClient`) does not validate this.** Use a **development client** from EAS:

```bash
cd apps/mobile
# Simulator (quick iteration)
eas build --profile development --platform ios

# Physical iPhone (lock screen / app switcher — recommended for audio QA)
eas build --profile development:device --platform ios
```

Install the `.ipa` / Development build, then from `apps/mobile` start Metro **for dev client** (not Expo Go):

```bash
npm run start:dev
# or: npx expo start --dev-client
```

Scan the QR code or open the dev client app and connect to the bundler.

---

## 2. App Store screenshots must use TestFlight or an EAS production build

- **App Store Connect** screenshots must be taken from:
  - an install via **TestFlight** (build produced with **`production`** profile), or
  - the same **standalone `.ipa`** from **`eas build --platform ios --profile production`** distributed outside the store only for internal capture (TestFlight is preferred).
- **Do not** submit screenshots captured from **Expo Go** — they are not representative of the shipping binary and may omit or misrepresent IAP and native flows.

---

## 3. RevenueCat, notifications, and native plugins need a compiled EAS build

The app includes (non‑exhaustive):

- **RevenueCat** (`react-native-purchases`, `react-native-purchases-ui`) — requires a **compiled** iOS app; Expo Go uses preview/browser-style modes, not real App Store purchases.
- **`expo-notifications`** — remote push and full behavior are **not** supported in Expo Go as of recent SDKs; use a **development** or **production** EAS build.
- **Config plugins** (e.g. Sentry, `expo-av`, location) — validate on a **real build**, not Expo Go.

**Rule:** Treat **EAS `production`** (or a **device `development` client** from EAS) as the first environment where subscription and notification conclusions count.

---

## 4. `CommandError: Must specify "expo-platform"` (often safe to ignore)

If Metro logs:

```text
CommandError: Must specify "expo-platform" header or "platform" query parameter
```

and the **client still bundles** (e.g. you see `iOS Bundled …` and the app loads in Expo Go):

- This is **usually** caused by a **browser or tool** hitting `http://localhost:8081` or `http://<LAN-IP>:8081` **without** a platform — not by a broken project.
- **You can ignore** these lines when bundling succeeds for the device.

See **Troubleshooting** below to reduce noise.

---

## 5. Final QA commands (production → TestFlight)

From the repo root:

```bash
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios --latest
```

- Configure **`eas.json`** **`submit.production.ascAppId`** (or run `eas submit` **interactively**) if `--non-interactive` submit fails.
- Ensure production env mirrors **§6** (Supabase + RevenueCat + `EXPO_PUBLIC_NEXT_ORIGIN`). **`eas.json`** `production.env` includes **`EXPO_PUBLIC_NEXT_ORIGIN`**; other **`EXPO_PUBLIC_*`** vars must live in Expo **production** environment variables.

Install the resulting build via **TestFlight** on hardware (including iPad) for screenshots and IAP sandbox testing.

---

## 6. EAS production environment (App Store review) — required

Production TestFlight binaries **bundle** whatever is available in **`process.env` during `eas build`**. Expo **does not** send your `.env` from the repo to builders unless mirrored in **Expo → Environment variables → `production`** (or `eas env:create`).

**Guardrail:** `app.config.ts` **fails production EAS builds** if any of these are missing when **`EAS_BUILD_PROFILE=production`**:

| Variable | Purpose |
|---------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Sign-in, reflection/note APIs |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` *or* `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase client (`publishable` is merged into anon at config time) |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | RevenueCat / StoreKit (public `appl_…` key) |

Without them, review builds surface **“Missing EXPO_PUBLIC_SUPABASE…”** on Sign In, subscription alerts (“RevenueCat keys”), and khutbah save failures — **Guideline 2.1**.

**Examples (fill with your values):**

```bash
cd apps/mobile

eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value 'https://YOUR_PROJECT.supabase.co'
eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value 'YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY'
eas env:create --environment production --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value 'appl_YOUR_REVENUECAT_IOS_PUBLIC_SDK_KEY'
```

Keep **`EXPO_PUBLIC_NEXT_ORIGIN`** aligned with **`eas.json`** production `env` **or** set the same variable in Expo’s **production** environment.

---

## 7. IAP submission, Paid Apps Agreement, metadata (Apple 2.1(b), 3.1.2)

1. **Submit IAP for review:** App Store Connect → **In‑App Purchases / Subscriptions** → complete metadata plus any **subscription review screenshots** Apple requests → submit with your next binary.

2. **Paid Applications Agreement:** App Store Connect → **Agreements, Tax, and Banking** → **Active** for the Account Holder.

3. **Terms of Use URL (Guideline 3.1.2(c)):** Add functional Terms to ASC metadata—for example append to App Description:

   **`Terms of Use (EULA): https://deennotesai.netlify.app/terms`**

   Confirm **Privacy Policy URL** remains **`https://deennotesai.netlify.app/privacy`**.

4. After resubmitting, reply in App Review with an **iPad screen recording**: Sign In works → subscriptions open **paywall** (not alerts) → optional sandbox purchase → **Restore purchases**.

---

## Troubleshooting

### Safari / Chrome opened the wrong URL

- Opening **`http://localhost:8081`** or **`http://192.168.x.x:8081`** directly in **Safari** (or another browser) often triggers **`expo-platform`** errors — the bundler expects a client that sends platform metadata.
- **For Expo Go:** connect using the **`exp://`** URL or QR flow from the CLI, not a bare `http://…:8081` tab.
- **For real validation:** stop using Expo Go for that path — install **`eas build`** output (production or dev client).

### Expo Go shows project Home / Diagnostics / “No EAS Update branches”

- You opened the **Expo Go shell** for a project without a running dev bundle or compatible **EAS Update** branch — not the standalone **DeenNotes AI** binary.
- **Fix:** Use **TestFlight** or **`eas build --profile production`** and launch the installed app icon, not Expo Go.

### Need a development build instead of Expo Go

- Prefer **`eas build --platform ios --profile development`** once your [`eas.json`](../apps/mobile/eas.json) profile targets **devices** you need (the default **`development`** profile may be **simulator-only** — adjust for physical iPads if required).

---

## Related docs

- [M6_TESTFLIGHT_LAUNCH_READINESS.md](./M6_TESTFLIGHT_LAUNCH_READINESS.md) — full checklist, ASC copy, screenshot ideas  
- [M8_MONETIZATION.md](./M8_MONETIZATION.md) — RevenueCat / products  
- [M9_TESTFLIGHT_SUBSCRIPTION_VALIDATION.md](./M9_TESTFLIGHT_SUBSCRIPTION_VALIDATION.md) — subscription QA on TestFlight
