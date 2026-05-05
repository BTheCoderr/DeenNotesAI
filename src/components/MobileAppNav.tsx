"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/app", label: "Home" },
  { href: "/app/notes", label: "Notes" },
  { href: "/app/new", label: "New" },
  { href: "/app/settings", label: "Settings" },
] as const;

export function MobileAppNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-black/5 bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/80 md:hidden"
      aria-label="Primary"
    >
      <ul className="flex justify-around items-stretch max-w-lg mx-auto">
        {links.map(({ href, label }) => {
          const active =
            href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center py-3 text-xs font-medium transition-colors",
                  active ? "text-accent" : "text-muted hover:text-ink",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
