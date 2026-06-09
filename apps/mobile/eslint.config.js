"use strict";

/** @see https://docs.expo.dev/guides/using-eslint/ */
module.exports = [
  // Native Apple target scaffolding (SwiftUI + expo-target config) is not JS source.
  { ignores: ["targets/**"] },
  ...require("eslint-config-expo/flat"),
];
