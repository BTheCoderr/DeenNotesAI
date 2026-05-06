module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // expo-router transforms (EXPO_ROUTER_APP_ROOT → string for require.context) live in
    // babel-preset-expo; it only registers when `expo-router` is resolvable from the root
    // node_modules (see root package.json devDependency in this monorepo).
    // Do not add expo-router/babel — in SDK 54 it is a no-op warning stub.
  };
};
