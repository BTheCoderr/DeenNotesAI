"use client";

import type { PrayerName } from "@/lib/prayer/types";
import { cn } from "@/lib/utils";

type Props = {
  name: PrayerName;
  time: string;
  highlight?: boolean;
};

export function PrayerTimeCard({ name, time, highlight }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border px-4 py-3",
        highlight
          ? "border-emerald-800/35 bg-emerald-950/08"
          : "border-black/[0.06] bg-surface/90",
      )}
    >
      <span className="font-display text-base font-semibold text-ink">{name}</span>
      <span className="tabular-nums text-[0.95rem] font-semibold text-ink/90">
        {time}
      </span>
    </div>
  );
}
