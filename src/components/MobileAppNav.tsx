"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { cn } from "@/lib/utils";

function PlusIcon() {
  return (
    <svg
      aria-hidden
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

const sideLinks = [
  { href: "/app", label: "Home" },
  { href: "/app/notes", label: "Notes" },
  { href: "/app/settings", label: "Settings" },
] as const;

export function MobileAppNav() {
  const pathname = usePathname();
  const { openNewNoteMenu } = useNewNoteMenu();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-black/5 bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80 md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Primary"
    >
      <ul className="flex items-end justify-between gap-1 px-3 max-w-lg mx-auto pt-1">
        {sideLinks.slice(0, 2).map(({ href, label }) => {
          const active =
            href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1 min-w-0 pb-3">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center py-1 text-[0.7rem] font-semibold tracking-tight transition-colors",
                  active ? "text-accent" : "text-muted hover:text-ink",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}

        <li className="flex flex-col items-center shrink-0 px-1 -top-7 relative">
          <button
            type="button"
            onClick={() => openNewNoteMenu()}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-card",
              "ring-4 ring-background hover:bg-accent-hover transition-colors",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
            aria-label="New DeenNote"
          >
            <PlusIcon />
          </button>
          <span className="text-[0.65rem] font-semibold text-accent mt-1">New</span>
        </li>

        <li key={sideLinks[2].href} className="flex-1 min-w-0 pb-3">
          <Link
            href={sideLinks[2].href}
            className={cn(
              "flex flex-col items-center justify-center py-1 text-[0.7rem] font-semibold tracking-tight transition-colors",
              pathname.startsWith(sideLinks[2].href)
                ? "text-accent"
                : "text-muted hover:text-ink",
            )}
          >
            {sideLinks[2].label}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
