export const ONBOARDING_STORAGE_KEY = "deennotes_onboarding_v1";

export type OnboardingAnswers = {
  /** QuranEnc translator row persisted on-device when user selects one during onboarding */
  preferredQuranEncTranslationKey?: string | null;
  purpose: string;
  ageGroup: string;
  userType: string;
  struggles: string[];
  completedAt: string;
};

export function readOnboardingFromLocal():
  | OnboardingAnswers
  | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    if (
      typeof o.purpose !== "string" ||
      typeof o.ageGroup !== "string" ||
      typeof o.userType !== "string" ||
      !Array.isArray(o.struggles) ||
      !o.struggles.every((x) => typeof x === "string") ||
      typeof o.completedAt !== "string"
    ) {
      return null;
    }
    let preferredQE: string | null | undefined;
    const pk = (o as { preferredQuranEncTranslationKey?: unknown })
      .preferredQuranEncTranslationKey;
    if (pk === null || pk === undefined) preferredQE = undefined;
    else if (typeof pk === "string") preferredQE = pk;
    else preferredQE = undefined;
    return {
      ...(preferredQE !== undefined
        ? { preferredQuranEncTranslationKey: preferredQE }
        : {}),
      purpose: o.purpose,
      ageGroup: o.ageGroup,
      userType: o.userType,
      struggles: o.struggles,
      completedAt: o.completedAt,
    };
  } catch {
    return null;
  }
}

export function writeOnboardingToLocal(data: OnboardingAnswers) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}
