"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useNewNoteMenu } from "@/components/app/NewNoteMenuContext";
import { cn } from "@/lib/utils";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active =
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-2 transition-colors",
        active
          ? "bg-accent-soft text-accent font-semibold"
          : "hover:bg-accent-soft hover:text-accent",
      )}
    >
      {label}
    </Link>
  );
}

export function DesktopAppNav() {
  const { openNewNoteMenu } = useNewNoteMenu();

  return (
    <nav
      className="hidden md:flex gap-1 text-sm font-medium text-muted flex-col items-stretch"
      aria-label="App sections"
    >
      <NavLink href="/app" label="Home" />
      <NavLink href="/app/notes" label="Notes" />
      <button
        type="button"
        onClick={() => openNewNoteMenu()}
        className="rounded-full px-4 py-2 text-left bg-accent text-white hover:bg-accent-hover transition-colors font-semibold shadow-sm"
      >
        New DeenNote
      </button>
      <NavLink href="/app/settings" label="Settings" />
    </nav>
  );
}
