"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  NavNotesIcon,
  NavPrayerIcon,
  NavQuranIcon,
  NavTodayIcon,
} from "@/components/app/AppTabIcons";
import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { APP_PRIMARY_NAV_ITEMS } from "@/config/app-nav";
import { cn } from "@/lib/utils";

function SideIcon({ href, active }: { href: string; active: boolean }) {
  const cls = cn("h-4 w-4 shrink-0 mt-0.5", active ? "text-accent" : "text-muted");
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
      return null;
  }
}

export function DesktopAppNav() {
  const pathname = usePathname();
  const { openNewNoteMenu } = useNewNoteMenu();

  return (
    <nav
      className="hidden md:flex gap-1 text-sm font-medium text-muted flex-col items-stretch"
      aria-label="App sections"
    >
      {APP_PRIMARY_NAV_ITEMS.map((item) => {
        if (item.kind === "fab") {
          return (
            <button
              key="fab"
              type="button"
              onClick={() => openNewNoteMenu()}
              className="rounded-full px-4 py-2 text-left bg-accent text-white hover:bg-accent-hover transition-colors font-semibold shadow-sm"
            >
              New reflection
            </button>
          );
        }

        const active = item.matches(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 transition-colors flex items-center gap-2",
              active
                ? "bg-accent-soft text-accent font-semibold"
                : "hover:bg-accent-soft hover:text-accent",
            )}
          >
            <SideIcon href={item.href} active={active} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
