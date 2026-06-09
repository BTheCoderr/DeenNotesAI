import SwiftUI
import WidgetKit

// MARK: - Timeline

struct NextPrayerEntry: TimelineEntry {
    let date: Date
    let payload: WidgetSharedPayload
}

struct NextPrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> NextPrayerEntry {
        NextPrayerEntry(date: Date(), payload: WidgetShared.placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (NextPrayerEntry) -> Void) {
        let payload = WidgetShared.loadPayload() ?? WidgetShared.placeholder
        completion(NextPrayerEntry(date: Date(), payload: payload))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NextPrayerEntry>) -> Void) {
        let payload = WidgetShared.loadPayload() ?? WidgetShared.placeholder
        let now = Date()
        let entry = NextPrayerEntry(date: now, payload: payload)

        // Refresh shortly after the next prayer passes, else hourly.
        var refreshDate = Calendar.current.date(byAdding: .hour, value: 1, to: now) ?? now
        if let nextMs = payload.nextAtEpochMs {
            let nextDate = Date(timeIntervalSince1970: nextMs / 1000)
            if nextDate > now {
                refreshDate = nextDate.addingTimeInterval(60)
            }
        }
        completion(Timeline(entries: [entry], policy: .after(refreshDate)))
    }
}

// MARK: - Brand

private enum Brand {
    static let emerald = Color(red: 0x12 / 255, green: 0x7A / 255, blue: 0x63 / 255)
    static let stone = Color(red: 0xF6 / 255, green: 0xF4 / 255, blue: 0xF0 / 255)
    static let ink = Color(red: 0x1C / 255, green: 0x1B / 255, blue: 0x19 / 255)
    static let bronze = Color(red: 0xB8 / 255, green: 0x86 / 255, blue: 0x0B / 255)
}

private func footerText(_ payload: WidgetSharedPayload) -> String {
    if let label = payload.countdownLabel, !label.isEmpty {
        return label.lowercased().hasPrefix("in ") ? label : "in \(label)"
    }
    return ""
}

// MARK: - Home Screen (systemSmall)

struct NextPrayerSmallView: View {
    let payload: WidgetSharedPayload

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            if payload.showBranding {
                Text("DEENNOTES")
                    .font(.system(size: 9, weight: .bold))
                    .tracking(1)
                    .foregroundColor(Brand.emerald)
            }
            Spacer(minLength: 0)
            Text("Next prayer")
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(Brand.bronze)
            Text(payload.nextPrayerName ?? "—")
                .font(.system(size: 26, weight: .semibold, design: .serif))
                .foregroundColor(Brand.ink)
            if let time = payload.nextPrayerTime {
                Text(time)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(Brand.ink)
                    .monospacedDigit()
            }
            let footer = footerText(payload)
            if !footer.isEmpty {
                Text(footer)
                    .font(.system(size: 12))
                    .foregroundColor(Brand.ink.opacity(0.6))
            }
            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .containerBackground(for: .widget) { Brand.stone }
    }
}

// MARK: - Lock Screen

struct NextPrayerRectangularView: View {
    let payload: WidgetSharedPayload

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(spacing: 4) {
                Text(payload.nextPrayerName ?? "—").fontWeight(.semibold)
                if let time = payload.nextPrayerTime {
                    Text("· \(time)").monospacedDigit()
                }
            }
            .font(.headline)
            let footer = footerText(payload)
            if !footer.isEmpty {
                Text(footer).font(.caption2)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .containerBackground(for: .widget) { Color.clear }
    }
}

struct NextPrayerInlineView: View {
    let payload: WidgetSharedPayload

    var body: some View {
        let footer = footerText(payload)
        let name = payload.nextPrayerName ?? "Salah"
        Text(footer.isEmpty ? name : "\(name) \(footer)")
    }
}

// MARK: - Widget

struct NextPrayerWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    var entry: NextPrayerProvider.Entry

    var body: some View {
        switch family {
        case .accessoryRectangular:
            NextPrayerRectangularView(payload: entry.payload)
        case .accessoryInline:
            NextPrayerInlineView(payload: entry.payload)
        default:
            NextPrayerSmallView(payload: entry.payload)
        }
    }
}

struct NextPrayerWidget: Widget {
    let kind = "NextPrayerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NextPrayerProvider()) { entry in
            NextPrayerWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Next prayer")
        .description("The next salah, its time, and time remaining.")
        .supportedFamilies([.systemSmall, .accessoryRectangular, .accessoryInline])
    }
}

@main
struct DeenNotesWidgetBundle: WidgetBundle {
    var body: some Widget {
        NextPrayerWidget()
    }
}
