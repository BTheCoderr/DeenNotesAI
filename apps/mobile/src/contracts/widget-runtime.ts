/**
 * Single source of truth for whether the native iOS WidgetKit extension is bundled.
 *
 * Keep this `false` until ALL of the following are true on a real EAS build:
 *   1. `@bacons/apple-targets` plugin is wired in `app.config.ts`.
 *   2. The App Group (`WIDGET_APP_GROUP`) is registered in the Apple Developer portal
 *      and attached to both the app and the widget extension.
 *   3. An EAS development build installs the widget and it renders live data on a device.
 *
 * Flipping this to `true` re-exposes the Widget Preferences row in Settings.
 * Until then the preview-only screen stays hidden in production.
 */
export const WIDGETS_NATIVE_ENABLED = false;

/**
 * Shared App Group container id. Must match:
 *   - Apple Developer portal App Group
 *   - `ios.entitlements["com.apple.security.application-groups"]` on the app
 *   - the widget target entitlements
 *   - the SwiftUI `UserDefaults(suiteName:)` / shared container lookup
 */
export const WIDGET_APP_GROUP = "group.io.deennotes.app";

/** UserDefaults key (within the App Group suite) the SwiftUI widget reads. */
export const WIDGET_SHARED_PAYLOAD_KEY = "deennotes_widget_payload_v1";

/** Filename mirror inside the App Group container (fallback / diagnostics). */
export const WIDGET_SHARED_PAYLOAD_FILE = "deennotes_widget_payload_v1.json";
