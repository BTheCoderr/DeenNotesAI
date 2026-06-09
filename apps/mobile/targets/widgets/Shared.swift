import Foundation

/// Mirrors `WidgetSharedPayloadV1` in apps/mobile/src/lib/widget-shared-payload.ts.
/// Keep these two in lockstep — the JS writer and this decoder must agree exactly.
struct WidgetSharedPayload: Codable {
    let schemaVersion: Int
    let generatedAtEpochMs: Double
    let hasPrayer: Bool
    let nextPrayerName: String?
    let nextPrayerTime: String?
    let nextAtEpochMs: Double?
    let countdownLabel: String?
    let locationLabel: String?
    let hijriLabel: String?
    let showBranding: Bool
}

enum WidgetShared {
    /// Must match WIDGET_APP_GROUP in src/contracts/widget-runtime.ts.
    static let appGroup = "group.io.deennotes.app"
    /// Must match WIDGET_SHARED_PAYLOAD_KEY.
    static let payloadKey = "deennotes_widget_payload_v1"
    /// Must match WIDGET_SHARED_PAYLOAD_FILE.
    static let payloadFile = "deennotes_widget_payload_v1.json"

    /// Reads the latest payload from the App Group: UserDefaults first, file mirror as fallback.
    static func loadPayload() -> WidgetSharedPayload? {
        if let defaults = UserDefaults(suiteName: appGroup),
           let raw = defaults.string(forKey: payloadKey),
           let data = raw.data(using: .utf8),
           let decoded = try? JSONDecoder().decode(WidgetSharedPayload.self, from: data) {
            return decoded
        }

        let fm = FileManager.default
        if let container = fm.containerURL(forSecurityApplicationGroupIdentifier: appGroup) {
            let url = container.appendingPathComponent(payloadFile)
            if let data = try? Data(contentsOf: url),
               let decoded = try? JSONDecoder().decode(WidgetSharedPayload.self, from: data) {
                return decoded
            }
        }
        return nil
    }

    /// Placeholder shown in the widget gallery and while data loads.
    static var placeholder: WidgetSharedPayload {
        WidgetSharedPayload(
            schemaVersion: 1,
            generatedAtEpochMs: 0,
            hasPrayer: true,
            nextPrayerName: "Asr",
            nextPrayerTime: "3:42 PM",
            nextAtEpochMs: nil,
            countdownLabel: "in 1h 12m",
            locationLabel: "Providence",
            hijriLabel: nil,
            showBranding: true
        )
    }
}
