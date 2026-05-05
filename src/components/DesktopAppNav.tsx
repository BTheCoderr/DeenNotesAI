import Link from "next/link";

const links = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/notes", label: "Saved notes" },
  { href: "/app/new", label: "New note" },
  { href: "/app/settings", label: "Settings" },
] as const;

export function DesktopAppNav() {
  return (
    <nav
      className="hidden md:flex gap-1 text-sm font-medium text-muted"
      aria-label="App sections"
    >
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="rounded-full px-4 py-2 hover:bg-accent-soft hover:text-accent transition-colors"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
