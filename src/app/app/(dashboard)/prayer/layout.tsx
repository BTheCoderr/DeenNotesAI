import { PrayerSubnav } from "@/features/prayer/components/PrayerSubnav";

export default function PrayerSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pb-6">
      <PrayerSubnav />
      <div className="pt-6">{children}</div>
    </div>
  );
}
