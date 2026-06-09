const fs = require("node:fs");
const path = require("node:path");

const { parse: parseDotenv } = require("dotenv");

/**
 * EAS and Metro must run with cwd `apps/mobile` (`package.json` `main`: `expo-router/entry`).
 * Canonical `extra.eas.projectId` lives in app.json — keep it aligned with the Expo dashboard.
 * Plain JS (not .ts) so EAS `expo config` never fails TS transpile in monorepo installs.
 */

const LEGAL_TERMS_URL = "https://deennotesai.netlify.app/terms";
const LEGAL_PRIVACY_URL = "https://deennotesai.netlify.app/privacy";

const APP_STORE_REVIEW_NOTE_BACKGROUND_AUDIO =
  "DeenNotes AI uses background audio for Quran recitation playback so users can continue listening while the device is locked or while using other apps.";

const mobileDir = __dirname;
const repoRoot = path.resolve(mobileDir, "..", "..");

function loadEnvLayers() {
  const paths = [
    path.join(repoRoot, ".env"),
    path.join(repoRoot, ".env.local"),
    path.join(mobileDir, ".env"),
    path.join(mobileDir, ".env.local"),
  ];
  const merged = {};
  for (const file of paths) {
    try {
      if (!fs.existsSync(file)) continue;
      const parsed = parseDotenv(fs.readFileSync(file, "utf8"));
      for (const [key, raw] of Object.entries(parsed)) {
        if (raw === undefined) continue;
        merged[key] = String(raw).trim();
      }
    } catch {
      /* ignore missing or unreadable env files */
    }
  }
  for (const [key, val] of Object.entries(merged)) {
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) process.env[key] = val;
  }
}

function bridgeExpoPublicFromNextPublic() {
  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (url) process.env.EXPO_PUBLIC_SUPABASE_URL = url;

  const anon =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (anon) process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = anon;

  if (!process.env.EXPO_PUBLIC_NEXT_ORIGIN?.trim()) {
    const site =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.NEXT_PUBLIC_VERCEL_URL?.trim();
    if (site) {
      const withProto = site.startsWith("http") ? site : `https://${site}`;
      process.env.EXPO_PUBLIC_NEXT_ORIGIN = withProto.replace(/\/$/, "");
    }
  }
}

loadEnvLayers();
bridgeExpoPublicFromNextPublic();

function assertProductionBuildHasStoreClientEnv() {
  if (process.env.EAS_BUILD !== "true") return;
  const profile = (process.env.EAS_BUILD_PROFILE ?? "").trim();
  if (profile !== "production") return;

  bridgeExpoPublicFromNextPublic();

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const rcKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim();

  const missing = [];
  if (!supabaseUrl) missing.push("EXPO_PUBLIC_SUPABASE_URL");
  if (!supabaseAnon) {
    missing.push("EXPO_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }
  if (!rcKey) missing.push("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY (RevenueCat Apple public SDK key, appl_…)");

  if (missing.length === 0) return;

  throw new Error(
    `EAS "${profile}" build blocked: add these at compile time for a shippable binary:\n` +
      missing.map((m) => `  - ${m}`).join("\n") +
      "\n\nExpo: Project → Environment variables → production. CLI: eas env:create --environment production\n" +
      "See docs/MOBILE_EAS_LAUNCH.md §6.",
  );
}

/** @param {{ config: import('@expo/config-types').ExpoConfig }} ctx */
module.exports = ({ config }) => {
  assertProductionBuildHasStoreClientEnv();

  const updatesUrl =
    typeof process.env.EXPO_UPDATES_URL === "string" ? process.env.EXPO_UPDATES_URL.trim() : "";
  const sentryDsn =
    typeof process.env.EXPO_PUBLIC_SENTRY_DSN === "string"
      ? process.env.EXPO_PUBLIC_SENTRY_DSN.trim()
      : "";
  const sentryExpoPluginId = "@sentry/react-native";

  const basePlugins = config.plugins ?? [];
  const plugins =
    sentryDsn.length > 0
      ? basePlugins
      : basePlugins.filter((p) => {
          const id = typeof p === "string" ? p : p[0];
          return id !== sentryExpoPluginId;
        });

  const baseIos = config.ios ?? {};
  const rawPlist = baseIos.infoPlist;
  const basePlist =
    rawPlist && typeof rawPlist === "object" && !Array.isArray(rawPlist) ? { ...rawPlist } : {};
  const existingModes = Array.isArray(basePlist.UIBackgroundModes)
    ? basePlist.UIBackgroundModes.filter((m) => typeof m === "string")
    : [];
  const mergedBackgroundModes = Array.from(new Set([...existingModes, "audio"]));

  return {
    ...config,
    name: config.name ?? "DeenNotes AI",
    slug: config.slug ?? "deennotes",
    runtimeVersion: { policy: "appVersion" },
    plugins,
    updates: updatesUrl
      ? {
          url: updatesUrl,
          checkAutomatically: "WIFI_ONLY",
          fallbackToCacheTimeout: 0,
        }
      : config.updates,
    extra: {
      ...(typeof config.extra === "object" && config.extra !== null && !Array.isArray(config.extra)
        ? config.extra
        : {}),
      revenueCatIosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() ?? "",
      revenueCatPremiumEntitlement:
        process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_PREMIUM?.trim() ?? "",
      appTermsUrl: process.env.EXPO_PUBLIC_APP_TERMS_URL?.trim() || LEGAL_TERMS_URL,
      appPrivacyUrl: process.env.EXPO_PUBLIC_APP_PRIVACY_URL?.trim() || LEGAL_PRIVACY_URL,
      betaFeedbackEmail: process.env.EXPO_PUBLIC_BETA_FEEDBACK_EMAIL?.trim() ?? "",
      appStoreReviewNoteBackgroundAudio: APP_STORE_REVIEW_NOTE_BACKGROUND_AUDIO,
    },
    ios: {
      ...baseIos,
      infoPlist: {
        ...basePlist,
        UIBackgroundModes: mergedBackgroundModes,
      },
    },
  };
};
