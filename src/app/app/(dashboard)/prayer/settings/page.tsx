import { Suspense } from "react";

import { PrayerSettingsScreen } from "@/features/prayer/screens/PrayerSettingsScreen";

export default function PrayerSettingsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted py-10 text-center">Loading settings…</p>}>
      <PrayerSettingsScreen />
    </Suspense>
  );
}
