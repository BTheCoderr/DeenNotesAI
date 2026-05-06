/**
 * Single source of truth for primary app navigation (web now; Expo-style tabs later).
 */
export type AppNavLinkItem = {
  kind: "link";
  href: string;
  label: string;
  /** True when this item should show the active accent state */
  matches: (pathname: string) => boolean;
};

export type AppNavFabItem = {
  kind: "fab";
  label: string;
  ariaLabel: string;
};

export type AppNavItem = AppNavLinkItem | AppNavFabItem;

export const APP_PRIMARY_NAV_ITEMS: AppNavItem[] = [
  {
    kind: "link",
    href: "/app/notes",
    label: "Notes",
    matches: (pathname) =>
      pathname === "/app/notes" || pathname.startsWith("/app/notes/"),
  },
  {
    kind: "link",
    href: "/app",
    label: "Today",
    matches: (pathname) => pathname === "/app",
  },
  {
    kind: "fab",
    label: "New",
    ariaLabel: "New DeenNote",
  },
  {
    kind: "link",
    href: "/app/quran",
    label: "Quran",
    matches: (pathname) => pathname.startsWith("/app/quran"),
  },
  {
    kind: "link",
    href: "/app/settings",
    label: "Settings",
    matches: (pathname) => pathname.startsWith("/app/settings"),
  },
];
