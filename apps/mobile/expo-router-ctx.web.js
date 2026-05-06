// Metro maps `expo-router/_ctx` here — same contract as expo-router `_ctx.web.js`.
export const ctx = require.context(
  "./app",
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+middleware)|(?:\+(html|native-intent))))\.[tj]sx?$).*(?:\.android|\.ios|\.native)?\.[tj]sx?$/,
  "sync",
);
