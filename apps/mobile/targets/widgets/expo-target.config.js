/**
 * @bacons/apple-targets config for the DeenNotes "Next prayer" WidgetKit extension.
 *
 * Activation (do NOT enable until the App Group is registered in the Apple portal):
 *   1. npx expo install @bacons/apple-targets
 *   2. Add "@bacons/apple-targets" to plugins in app.config.ts
 *   3. Add the App Group entitlement to the MAIN app (see docs/IOS_WIDGETS_IMPLEMENTATION.md)
 *   4. npx expo prebuild -p ios --clean  (or EAS dev build)
 *
 * @type {import("@bacons/apple-targets").Config}
 */
module.exports = {
  type: "widget",
  name: "DeenNotes Widgets",
  icon: "../../assets/icon.png",
  colors: {
    // DeenNotes brand — keep aligned with src/theme/design-tokens.
    $emerald: "#127A63",
    $stone: "#F6F4F0",
    $ink: "#1C1B19",
    $bronze: "#B8860B",
  },
  entitlements: {
    "com.apple.security.application-groups": ["group.io.deennotes.app"],
  },
};
