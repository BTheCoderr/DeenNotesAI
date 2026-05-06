import fs from "node:fs";
import path from "node:path";

import type { ConfigContext, ExpoConfig } from "@expo/config";
import { parse as parseDotenv } from "dotenv";

const mobileDir = __dirname;
const repoRoot = path.resolve(mobileDir, "..", "..");

/**
 * Merge `.env` files into `process.env` (later files win). Keeps Expo and Next.js aligned in local dev:
 * web uses `NEXT_PUBLIC_*`; Metro inlines only `EXPO_PUBLIC_*`.
 */
function loadEnvLayers(): void {
  const paths = [
    path.join(repoRoot, ".env"),
    path.join(repoRoot, ".env.local"),
    path.join(mobileDir, ".env"),
    path.join(mobileDir, ".env.local"),
  ];
  const merged: Record<string, string> = {};
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
    // Later files overwrite earlier entries in merged; never clobber vars already exported in the shell.
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) process.env[key] = val;
  }
}

function bridgeExpoPublicFromNextPublic(): void {
  const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (url) process.env.EXPO_PUBLIC_SUPABASE_URL = url;

  const anon =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
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

/**
 * EAS / runtime: `runtimeVersion` stays tied to `version` in app.json (`appVersion` policy).
 *
 * OTA: set `EXPO_UPDATES_URL` in EAS env (or `.env` for local) after `eas update:configure`:
 *   https://u.expo.dev/<project-id>
 * Dev clients without this variable skip remote update URL — native builds still succeed.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const updatesUrl =
    typeof process.env.EXPO_UPDATES_URL === "string" ? process.env.EXPO_UPDATES_URL.trim() : "";
  const sentryDsn =
    typeof process.env.EXPO_PUBLIC_SENTRY_DSN === "string" ? process.env.EXPO_PUBLIC_SENTRY_DSN.trim() : "";
  const sentryExpoPluginId = "@sentry/react-native";

  const basePlugins = config.plugins ?? [];
  const plugins =
    sentryDsn.length > 0
      ? basePlugins
      : basePlugins.filter((p) => {
          const id = typeof p === "string" ? p : p[0];
          return id !== sentryExpoPluginId;
        });

  return {
    ...config,
    name: config.name ?? "DeenNotes",
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
  };
};
