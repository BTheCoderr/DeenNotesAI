# M9 — TestFlight & subscription validation

This milestone wires **beta feedback**, **subscription QA tooling**, **paywall copy + timing polish**, and **lightweight product analytics** (Sentry breadcrumbs + dev console) without new third-party analytics vendors.

## Subscription QA checklist (human + in-app)

Use **Settings → Internal** (`__DEV__`) → **M9 Subscription QA** for pass/fail persistence, and cross-check with the list below.

| Area | Check |
| ---- | ----- |
| **Successful purchase** | Sandbox purchase completes; Plus surfaces unlock; `purchase_success` crumb (if Sentry DSN set). |
| **Failed purchase** | Card decline shows calm error; user can dismiss; `purchase_failed` with `cancelled:false`. |
| **Cancelled purchase** | StoreKit cancel does not trap UI; `purchase_failed` with `cancelled:true` for signal only. |
| **Restore** | Prior subscriber restores; `restore_success` with `entitled:true`. No receipt → copy honest, `entitled:false`. |
| **Offline entitlement cache** | Last known state shows without network; no harsh flip to locked on brief offline. |
| **Relaunch persistence** | AsyncStorage + RevenueCat refresh reconcile; no long “false free” after cold start for subscribers. |
| **Logout / login** | Sign-out clears premium display for session-specific flows; new login re-binds RC user; restore still works. |
| **Expired trial** | After trial end, gates match free tier; paywall can reappear on premium actions without harsh language. |
| **Paywall dismissal** | X / “Stay on complimentary path” closes modal; `paywall_dismissed` with `reason` when user closes. |

## Paywall timing audit (current code)

| Trigger | Delay / behaviour | Intent |
| ------- | ----------------- | ------ |
| `after_onboarding` | **~2.8s** after hydration + one-time storage flag | Soft nudge after Today is visible — not launch-blocking. |
| `after_first_generation` | **~2.2s** after first complimentary AI save | Lets the success screen land first. |
| Feature gates | Immediate on tap / submit | Clear context via `reason` copy on paywall. |
| Yearly emphasis | Emerald primary card, monthly secondary | Visual hierarchy for conversion without dark patterns. |

## Analytics events (non-invasive)

Implemented in `apps/mobile/src/lib/analytics/mobile-product-events.ts` and `observeProductEvent` in `src/lib/sentry/mobile.ts`.

| Event | When |
| ----- | ---- |
| `onboarding_completed` | Onboarding `finish()` |
| `first_reflection_saved` | First successful `/api/generate-note` completion (once per install) |
| `paywall_shown` | `openPaywall` |
| `paywall_dismissed` | User closes modal (X, OS back, complimentary path) |
| `purchase_attempt` / `purchase_success` / `purchase_failed` | StoreKit purchase flow |
| `restore_attempt` / `restore_success` / `restore_failed` | Restore button |
| `trial_started` | RevenueCat entitlement `periodType` TRIAL/INTRO after purchase/restore |
| `retention_session` | At most once per local civil day on launch / resume |
| `quran_listen_start` | Verse play begins (`cache` vs `stream` only) |

**Never logged:** ayah text, reflection bodies, prompts, or personal religious practice beyond coarse feature usage.

## TestFlight readiness audit

- [ ] **Legal**: Terms + Privacy URLs on paywall; App Store Connect matches.
- [ ] **Restore**: Visible on paywall footer.
- [ ] **No dead ends**: Use **Internal → Navigation audit** + M7/M9 QA screens.
- [ ] **Gates**: Verify free vs Plus on device with `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` set.
- [ ] **Not Expo Go–dependent**: Subscriptions require **dev client / TestFlight**; `purchasesAvailable` false opens features for Expo Go without crashing.
- [ ] **Beta feedback inbox**: `EXPO_PUBLIC_BETA_FEEDBACK_EMAIL` (or `extra.betaFeedbackEmail`) for mailto.

## App Store screenshot prep (capture states)

Capture on **production TestFlight** build with real data where possible:

1. **Onboarding** — first step + completion screen.
2. **Today** — calm default with prayer card if available.
3. **Reflect** — list with local + (if Plus) cloud merge.
4. **New reflection** — mode sheet.
5. **Quran** — surah list + reader (verse + optional mini player).
6. **Prayer** — Today + Ramadan/Calendar for Plus messaging.
7. **Paywall** — annual highlighted, restore + legal links visible (use sandbox).
8. **Settings** — Plus card + beta feedback entry.

## Biggest risks

### Conversion risks

- **Offering misconfiguration** (missing annual/monthly in RevenueCat default offering) → empty packages on paywall.
- **Intro/trial copy mismatch** with App Store Connect → review feedback; in-app copy defers to Apple for eligibility.
- **Aggressive timing** if marketing asks for faster paywall — current delays are intentionally gentle; shortening increases drop-off.

### Retention risks

- **Cloud library gated** for free signed-in users may feel abrupt — mitigated by on-device list + soft banner.
- **Trial expiry** without email re-engagement — product analytics are breadcrumb-only today; plan lifecycle messaging off-App if needed.

### Purchase flow risks

- **Restore edge cases** (family sharing, multiple Apple IDs) — verify in sandbox with written tester script.
- **Network flaps during purchase** — user may need to tap restore; ensure support copy in beta channel.

### TestFlight blockers

- Missing **ASC subscription metadata**, **Paid Apps Agreement**, or **RevenueCat ↔ ASC** product wiring.
- **No DSN** is fine for shipping; analytics crumbs simply won’t appear in Sentry.

## Recommended beta tester script (15 min)

1. Install TestFlight build; complete onboarding; note delayed paywall ~3s — dismiss or continue free.
2. Sign in; create one short reflection; notice optional second paywall nudge.
3. Open **Settings → Send feedback (beta)**; send yourself a mailto smoke test.
4. Open **Prayer → Ramadan** (free vs Plus behaviour); **Quran → Listen** once.
5. From paywall: **Restore purchases**; attempt **sandbox purchase** on annual.
6. Kill app (swipe away); relaunch — entitlement persists.
7. Toggle airplane mode briefly; verify no violent UI flicker on Reflect / gates.

## Launch confidence assessment

**Medium–high** for a first subscription ship if: (a) RevenueCat offering resolves in TestFlight, (b) sandbox purchase + restore pass twice on a clean install, (c) App Store metadata and legal URLs are aligned. **Lower** if products or entitlements are still draft-only — block release until ASC + RC dashboards match `deennotes.monthly` / `deennotes.yearly` and entitlement id `premium` (or configured override).

## Related code

- Paywall UI: `apps/mobile/src/components/paywall/PremiumPaywallModal.tsx`
- Premium state: `apps/mobile/src/context/PremiumContext.tsx`
- Beta feedback: `apps/mobile/app/settings/beta-feedback.tsx`
- Internal subscription QA: `apps/mobile/app/internal/subscription-qa.tsx`
- Product events: `apps/mobile/src/lib/analytics/mobile-product-events.ts`
- Session signal: `apps/mobile/src/lib/analytics/retention-daily.ts`
- Lifecycle hook: `apps/mobile/src/components/ProductLifecycleAnalytics.tsx`
