"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavNewFabIcon,
  NavNotesIcon,
  NavPrayerIcon,
  NavQuranIcon,
  NavTodayIcon,
} from "@/components/app/AppTabIcons";
import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { FloatingActionButton } from "@/components/ds/FloatingActionButton";
import { APP_PRIMARY_NAV_ITEMS } from "@/config/app-nav";
import { cn } from "@/lib/utils";

function TabGlyph({ href, active }: { href: string; active: boolean }) {
  const cls = cn("h-6 w-6 shrink-0", active ? "text-accent" : "text-muted");
  switch (href) {
    case "/app/notes":
      return <NavNotesIcon className={cls} />;
    case "/app":
      return <NavTodayIcon className={cls} />;
    case "/app/quran":
      return <NavQuranIcon className={cls} />;
    case "/app/prayer":
      return <NavPrayerIcon className={cls} />;
    default:
      return <span className={cn("h-6 w-6 rounded-md bg-black/5", cls)} />;
  }
}

export function MobileAppNav() {
  const pathname = usePathname();
  const { openNewNoteMenu } = useNewNoteMenu();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-black/5 bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80 md:hidden pb-[max(0.875rem,calc(env(safe-area-inset-bottom)+1px))] pt-2"
      aria-label="Primary"
    >
      <ul className="flex items-end justify-between gap-1 px-2 max-w-lg mx-auto pt-1">
        {APP_PRIMARY_NAV_ITEMS.map((item) => {
          if (item.kind === "fab") {
            return (
              <li
                key="fab"
                className="flex flex-col items-center shrink-0 px-1 -top-7 relative"
              >
                <FloatingActionButton
                  type="button"
                  label={item.ariaLabel}
                  onClick={() => openNewNoteMenu()}
                  className="h-14 min-w-[4.5rem] rounded-[1.25rem] px-4 text-white [&_svg]:stroke-white shadow-elev-fab"
                >
                  <NavNewFabIcon className="h-7 w-7" />
                </FloatingActionButton>
                <span className="text-[0.65rem] font-semibold text-accent mt-1">
                  {item.label}
                </span>
              </li>
            );
          }

          const active = item.matches(pathname);

          return (
            <li key={item.href} className="flex-1 min-w-0 pb-3">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 text-[0.7rem] font-semibold tracking-tight transition-colors duration-ds rounded-xl motion-safe:active:opacity-85",
                  active ? "text-accent" : "text-muted hover:text-ink",
                )}
              >
                <TabGlyph href={item.href} active={active} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
