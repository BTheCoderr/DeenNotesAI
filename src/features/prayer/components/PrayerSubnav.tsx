"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string }[] = [
  { href: "/app/prayer", label: "Today" },
  { href: "/app/prayer/ramadan", label: "Ramadan" },
  { href: "/app/prayer/calendar", label: "Calendar" },
];

export function PrayerSubnav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Prayer sections"
      className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
    >
      {LINKS.map(({ href, label }) => {
        const active =
          href === "/app/prayer"
            ? pathname === "/app/prayer"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={[
              "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors border",
              active
                ? "bg-emerald-950 text-white border-emerald-950 shadow-sm"
                : "bg-stone-100/90 text-emerald-950/85 border-black/[0.06] hover:bg-stone-200/90",
            ].join(" ")}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
