"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { FloatingActionButton } from "@/components/ds/FloatingActionButton";
import { APP_PRIMARY_NAV_ITEMS } from "@/config/app-nav";
import { cn } from "@/lib/utils";

function GeometricCenterIcon() {
  return (
    <svg
      aria-hidden
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <path d="M12 3 19 8v8l-7 5-7-5V8l7-5Z" opacity="0.9" />
      <path d="M12 8 16 11v6l-4 3-4-3v-6l4-3Z" />
    </svg>
  );
}

export function MobileAppNav() {
  const pathname = usePathname();
  const { openNewNoteMenu } = useNewNoteMenu();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-black/5 bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80 md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1"
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
                  className="text-white [&_svg]:stroke-white"
                >
                  <GeometricCenterIcon />
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
                  "flex flex-col items-center justify-center py-1 text-[0.7rem] font-semibold tracking-tight transition-colors duration-ds rounded-xl motion-safe:active:opacity-85",
                  active ? "text-accent" : "text-muted hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
