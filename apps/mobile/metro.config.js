// Explicit Expo Metro config for the mobile workspace root (npm monorepo).
// Ensures expo-router/babel transforms (_ctx*.js env inlining) use the supported pipeline.
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
