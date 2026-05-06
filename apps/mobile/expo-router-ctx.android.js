// Metro maps `expo-router/_ctx` here — same contract as expo-router `_ctx.android.js`.
export const ctx = require.context(
  "./app",
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+html)|(?:\+middleware)))\.[tj]sx?$).*(?:\.ios|\.web)?\.[tj]sx?$/,
  "sync",
);
