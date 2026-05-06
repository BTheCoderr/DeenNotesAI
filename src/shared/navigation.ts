export type PrimaryTabId = "reflect" | "today" | "new" | "quran" | "prayer";

export type PrimaryTabContract = {
  id: PrimaryTabId;
  label: "Reflect" | "Today" | "New" | "Quran" | "Prayer";
  webHref: string;
  mobileRouteName: string;
  a11yLabel: string;
  kind: "link" | "action";
};

/** Source of truth for primary IA ordering across web + mobile. */
export const PRIMARY_TAB_CONTRACT: readonly PrimaryTabContract[] = [
  {
    id: "reflect",
    label: "Reflect",
    webHref: "/app/notes",
    mobileRouteName: "reflect",
    a11yLabel: "Open Reflect tab",
    kind: "link",
  },
  {
    id: "today",
    label: "Today",
    webHref: "/app",
    mobileRouteName: "index",
    a11yLabel: "Open Today tab",
    kind: "link",
  },
  {
    id: "new",
    label: "New",
    webHref: "/app/new",
    mobileRouteName: "new",
    a11yLabel: "Open New sheet",
    kind: "action",
  },
  {
    id: "quran",
    label: "Quran",
    webHref: "/app/quran",
    mobileRouteName: "quran",
    a11yLabel: "Open Quran tab",
    kind: "link",
  },
  {
    id: "prayer",
    label: "Prayer",
    webHref: "/app/prayer",
    mobileRouteName: "prayer",
    a11yLabel: "Open Prayer tab",
    kind: "link",
  },
] as const;

export const SETTINGS_PROFILE_ROUTE = {
  webHref: "/app/settings",
  mobileRouteName: "settings",
} as const;
