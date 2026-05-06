// Metro maps `expo-router/_ctx` here (metro.config.js) so literals work without Babel rewriting node_modules.
// Regex matches expo-router `_ctx.ios.js`.
export const ctx = require.context(
  "./app",
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+html)|(?:\+middleware)))\.[tj]sx?$).*(?:\.android|\.web)?\.[tj]sx?$/,
  "sync",
);
