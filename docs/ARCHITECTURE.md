# DeenNotes AI Architecture

## Product surfaces

```text
┌──────────────────────────────┐
│ iPhone / iPad                │
│ React Native + Expo Router   │
└──────────────┬───────────────┘
               │
        auth / data / API
               │
      ┌────────▼─────────┐
      │ Next.js          │
      │ web companion/API│
      └───────┬──────────┘
              │
   ┌──────────┼───────────────┐
   │          │               │
   ▼          ▼               ▼
Supabase   AI providers   Quran services
Auth/DB    structured     content/audio
+ RLS      reflection

iOS app ───────────────► RevenueCat ───────────────► App Store subscriptions
```

## Mobile

The primary shipped product lives in `apps/mobile/` and uses React Native, Expo, Expo Router, Supabase, RevenueCat, Sentry, audio/device APIs, notifications, location, and motion sensors.

## Web companion / server

The Next.js app provides the public web experience, account entry points, server routes, legal/product pages, and server-side integrations that should not expose credentials to clients.

## Data

Supabase provides authentication and Postgres persistence. Account-owned tables should remain protected by Row Level Security and least-privilege grants.

## AI

AI-provider selection is pluggable rather than tied to a single vendor. Structured validation is used so reflection output can remain predictable across providers. AI output is scoped to organization/reflection support, not religious rulings.

## Quran

Quran routes support provider-backed content/audio with explicit environment configuration and controlled mock/fallback behavior for development and resilience.

## Monetization

RevenueCat handles the mobile subscription entitlement layer while Apple's App Store remains the purchase platform for iOS.

## Deployment boundary

GitHub code changes, CI verification, Netlify deployment, and App Store release are separate stages. Merging code should not be treated as equivalent to publishing a production release.
