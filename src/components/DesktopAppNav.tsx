"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { APP_PRIMARY_NAV_ITEMS } from "@/config/app-nav";
import { cn } from "@/lib/utils";

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
              New DeenNote
            </button>
          );
        }

        const active = item.matches(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 transition-colors",
              active
                ? "bg-accent-soft text-accent font-semibold"
                : "hover:bg-accent-soft hover:text-accent",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
