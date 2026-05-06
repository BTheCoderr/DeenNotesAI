const fs = require("node:fs");
const path = require("path");

const { getDefaultConfig } = require("expo/metro-config");
const { resolve: metroResolve } = require("metro-resolver");

// Monorepo: Babel sometimes never rewrites expo-router `_ctx*.js` in node_modules,
// so Metro sees `require.context(process.env.EXPO_ROUTER_APP_ROOT)` and fails.
// Remap `expo-router/_ctx` to sibling files under this app root with literal `./app`.

/** Monorepo root (`DeenNotesAI/`), resolved from apps/mobile/. */
const monorepoRoot = path.resolve(__dirname, "../..");

/**
 * Absolute path to `<repo>/src/shared/<subpath>` plus optional extension/index.
 */
function resolveRepoSharedSourceFile(moduleName) {
  if (!moduleName.startsWith("@shared/")) return null;
  const rel = moduleName.slice("@shared/".length);
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) return null;

  const baseWithoutExt = path.join(monorepoRoot, "src", "shared", ...rel.split("/"));

  /** @type {string[]} */
  const candidates = [
    baseWithoutExt,
    `${baseWithoutExt}.ts`,
    `${baseWithoutExt}.tsx`,
    `${baseWithoutExt}.js`,
    `${baseWithoutExt}.jsx`,
  ];
  for (const f of candidates) {
    try {
      if (fs.statSync(f).isFile()) return f;
    } catch {
      /* continue */
    }
  }
  try {
    const st = fs.statSync(baseWithoutExt);
    if (st.isDirectory()) {
      for (const ext of ["ts", "tsx", "js", "jsx"]) {
        const f = path.join(baseWithoutExt, `index.${ext}`);
        try {
          if (fs.statSync(f).isFile()) return f;
        } catch {
          /* continue */
        }
      }
    }
  } catch {
    /* not a dir */
  }
  return null;
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.watchFolders = [...new Set([...(config.watchFolders ?? []), monorepoRoot])];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const sharedFile = resolveRepoSharedSourceFile(moduleName);
  if (sharedFile) {
    return { type: "sourceFile", filePath: sharedFile };
  }

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
