/**
 * Primary app navigation — web PWA now; Expo bottom tabs later.
 * Order: Reflect · Today · New (FAB) · Quran · Prayer
 */
import { PRIMARY_TAB_CONTRACT } from "@/shared/navigation";

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
    href: PRIMARY_TAB_CONTRACT[0].webHref,
    label: PRIMARY_TAB_CONTRACT[0].label,
    matches: (pathname) =>
      pathname === "/app/notes" || pathname.startsWith("/app/notes/"),
  },
  {
    kind: "link",
    href: PRIMARY_TAB_CONTRACT[1].webHref,
    label: PRIMARY_TAB_CONTRACT[1].label,
    matches: (pathname) => pathname === "/app",
  },
  {
    kind: "fab",
    label: PRIMARY_TAB_CONTRACT[2].label,
    ariaLabel: "New",
  },
  {
    kind: "link",
    href: PRIMARY_TAB_CONTRACT[3].webHref,
    label: PRIMARY_TAB_CONTRACT[3].label,
    matches: (pathname) => pathname.startsWith("/app/quran"),
  },
  {
    kind: "link",
    href: PRIMARY_TAB_CONTRACT[4].webHref,
    label: PRIMARY_TAB_CONTRACT[4].label,
    matches: (pathname) => pathname.startsWith("/app/prayer"),
  },
];
