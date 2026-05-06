const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { resolve: metroResolve } = require("metro-resolver");

// Monorepo: Babel sometimes never rewrites expo-router `_ctx*.js` in node_modules,
// so Metro sees `require.context(process.env.EXPO_ROUTER_APP_ROOT)` and fails.
// Remap `expo-router/_ctx` to sibling files under this app root with literal `./app`.

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Allow imports from the web app root (e.g. `src/shared/*` from apps/mobile/src/contracts).
const monorepoRoot = path.resolve(__dirname, "../..");
config.watchFolders = [...new Set([...(config.watchFolders ?? []), monorepoRoot])];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "expo-router/_ctx") {
    const plat = platform ?? "ios";
    const basename =
      plat === "android"
        ? "expo-router-ctx.android.js"
        : plat === "web"
          ? "expo-router-ctx.web.js"
          : "expo-router-ctx.ios.js";
    return {
      type: "sourceFile",
      filePath: path.join(__dirname, basename),
    };
  }
  return metroResolve(
    {
      ...context,
      resolveRequest: metroResolve,
    },
    moduleName,
    platform,
  );
};

module.exports = config;
