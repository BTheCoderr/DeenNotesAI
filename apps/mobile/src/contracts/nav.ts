import {
  PRIMARY_TAB_CONTRACT,
  SETTINGS_PROFILE_ROUTE as SHARED_SETTINGS_PROFILE_ROUTE,
  type PrimaryTabId,
} from "@shared/navigation";

export type MobileTabId = PrimaryTabId;

export const PRIMARY_TAB_ORDER = PRIMARY_TAB_CONTRACT.map((tab) => ({
  id: tab.id,
  name: tab.mobileRouteName,
  title: tab.label,
  href:
    tab.id === "today"
      ? ("/" as const)
      : (`/${tab.mobileRouteName}` as `/${string}`),
  a11yLabel: tab.a11yLabel,
})) as readonly {
  id: MobileTabId;
  name: string;
  title: string;
  href: `/${string}`;
  a11yLabel: string;
}[];

export const SETTINGS_PROFILE_ROUTE = `/${SHARED_SETTINGS_PROFILE_ROUTE.mobileRouteName}` as const;
