# M8 — Monetization (RevenueCat + App Store)

DeenNotes mobile uses **RevenueCat** (`react-native-purchases`) as the only subscription source of truth. There is no custom receipt backend. **iOS is in scope** for M8; Android gates are treated as “store unavailable” (features stay open when `purchasesAvailable` is false).

## Product & entitlement IDs

| App Store product | Purpose |
| ----------------- | ------- |
| `deennotes.monthly` | Monthly DeenNotes Plus |
| `deennotes.yearly` | Annual DeenNotes Plus (primary in paywall) |

| RevenueCat entitlement | Default env / constant |
| ---------------------- | ------------------------ |
| `premium` | `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM` or `extra.revenueCatPremiumEntitlement` |

## Environment & Expo `extra`

Loaded via `apps/mobile/app.config.ts` and `src/lib/purchases/expo-extra.ts`:

- `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` — **required** for native iOS subscriptions.
- `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM` — optional override.
- `EXPO_PUBLIC_APP_TERMS_URL`, `EXPO_PUBLIC_APP_PRIVACY_URL` — optional (defaults: `https://deennotes.ai/terms`, `https://deennotes.ai/privacy`).

## RevenueCat dashboard (checklist)

1. Create iOS app + connect App Store Connect API key / shared secret as RevenueCat requires.
2. Create entitlement **`premium`** (or match `EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM`).
3. Add products **`deennotes.monthly`** and **`deennotes.yearly`** and attach them to the entitlement.
4. Create a default Offering; include **annual** and **monthly** packages mapped to those products (or rely on RevenueCat `$rc_annual` / `$rc_monthly` slotting).
5. Optional: configure introductory offer / free trial in **App Store Connect**; RevenueCat surfaces StoreKit-eligible intros — copy in-app stays factual (“trial when offered”).
6. Set **REST API** / webhook only if needed later — **not** required for client-only M8.

## App Store Connect (checklist)

1. Create subscription group; add **`deennotes.yearly`** and **`deennotes.monthly`** with correct duration and pricing tiers.
2. Attach **localized subscription display names**, **`Terms of Use` / Privacy Policy URLs** per Apple requirements.
3. Configure **introductory pricing** / free trial per product if desired.
4. Ensure **Paid Applications Agreement**, tax/banking completed.
5. In app review notes, mention subscriptions are unlocked via RevenueCat / StoreKit and **Restore purchases** exists on the paywall.

## Trigger map (paywall reasons)

| Reason | When |
| ------ | ---- |
| `after_onboarding` | AsyncStorage flag consumed once after onboarding (`setPaywallTriggerAfterOnboarding`). |
| `after_first_generation` | After first successful complimentary AI generation (local counter). |
| `compose_ai_quota` | Signed-in user exceeded `FREE_AI_REFLECTION_LIMIT` (5) AI generations. |
| `khutbah_recording` | Khutbah flow from New sheet or recording screen. |
| `offline_quran_audio` | Surah download / prefetch-heavy prefs / cache budget edits. |
| `advanced_prayer_reminders` | Lead-times or speciality reminder toggles. |
| `ramadan_planning` | Prayer Ramadan & Calendar tabs, Quran tarawīh tone, Hijri settings. |
| `reflect_cloud_sync` | Reflect tab upsell banner; blocked cloud note opened by ID without local copy. |
| `general` | Settings Plus card |

## Feature gate map

| Surface | Free | Plus (entitled) |
| ------- | --- | ---------------- |
| Quran reading | ✓ | ✓ |
| Basic salah times (`Prayer` → Today + location/method prefs) | ✓ | ✓ |
| Compose AI reflections | Limited (counter) | ✓ unlimited |
| Khutbah recording | ✗ | ✓ |
| Reflect cloud merge + Supabase list query | ✗ while `purchasesAvailable` && !premium | ✓ |
| Offline Quran prefetch / save surah / auto-queue / cache MB | ✗ | ✓ |
| Lead-time + special reminders | ✗ | ✓ |
| Ramadan / calendar planner + hijri screen + tarawīh tone | ✗ | ✓ |

When **no** iOS RevenueCat key is present (`purchasesAvailable === false`), gates are **off** so Expo web/Android simulators keep working.

## QA commands

From repo root:

```bash
cd apps/mobile && npm run typecheck
cd apps/mobile && npx expo-doctor
```

Optional:

```bash
cd apps/mobile && npm run lint
```

## Remaining launch blockers (typical)

- [ ] RevenueCat + App Store products live and **Offering** resolves in a **TestFlight** build (not Expo Go).
- [ ] Legal URLs in ASC match in-app **Terms** / **Privacy** links.
- [ ] Subscription review screenshot / metadata for DeenNotes Plus.
- [ ] Sandbox Apple ID purchase + **Restore purchases** validation.
- [ ] Confirm Supabase RLS still matches your cloud-library policy for entitled users.
