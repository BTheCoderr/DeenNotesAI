# DeenNotes mobile — launch & QA (read this before screenshots)

Full guide (Expo Go vs EAS, RevenueCat, troubleshooting):  
**[`docs/MOBILE_EAS_LAUNCH.md`](../../docs/MOBILE_EAS_LAUNCH.md)**

## Quick rules

1. **Expo Go** — layout / smoke tests only while Metro runs. Not final QA.
2. **App Store screenshots** — **TestFlight** or **`eas build` production** IPA only — **never Expo Go**.
3. **RevenueCat, notifications, native plugins** — validate on a **compiled EAS build**.
4. **Metro:** `CommandError: Must specify "expo-platform"` — safe to ignore if **`iOS Bundled`** still succeeds; usually Safari/browser hitting `:8081` without `exp://`.

## Final QA commands

```bash
cd apps/mobile
eas build --platform ios --profile production
eas submit --platform ios --latest
```

## Troubleshooting (short)

- **Don’t open** `http://localhost:8081` or `http://192.168.x.x:8081` in **Safari** for the app — use **`exp://…`** with Expo Go, or install the **standalone** build from EAS/TestFlight.

More: **[`docs/MOBILE_EAS_LAUNCH.md`](../../docs/MOBILE_EAS_LAUNCH.md)** — **§6** lists **required Expo production env vars** (Supabase + RevenueCat); missing vars caused blank Sign In/IAP on review builds.
