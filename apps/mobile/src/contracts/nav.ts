/**
 * Keep in sync with `src/config/app-nav.ts` on web (Phase M2 → packages/shared).
 */

export const PRIMARY_TAB_ORDER = [
  { name: "reflect", title: "Reflect", href: "/reflect" as const },
  { name: "index", title: "Today", href: "/" as const },
  { name: "new", title: "New", href: "/new" as const },
  { name: "quran", title: "Quran", href: "/quran" as const },
  { name: "prayer", title: "Prayer", href: "/prayer" as const },
] as const;
