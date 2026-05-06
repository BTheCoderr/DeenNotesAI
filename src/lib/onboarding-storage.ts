export const ONBOARDING_STORAGE_KEY = "deennotes_onboarding_v1";

/** Current onboarding persistence shape */
export type OnboardingAnswers = {
  /** QuranEnc translator row persisted on-device when user selects one during onboarding */
  preferredQuranEncTranslationKey?: string | null;
  /** Reflection / UI language hint (does not replace Arabic Quranic text authority). */
  reflectionLanguage?: string;
  /** Reasons the traveler chose DeenNotes (multi-select). */
  journeyGoals: string[];
  completedAt: string;
};

export function readOnboardingFromLocal(): OnboardingAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const o = parsed as Record<string, unknown>;
    const completedAt = o.completedAt;
    if (typeof completedAt !== "string") return null;

    let journeyGoals: string[] = [];
    if (Array.isArray(o.journeyGoals) && o.journeyGoals.every((x) => typeof x === "string")) {
      journeyGoals = o.journeyGoals;
    } else if (
      Array.isArray(o.struggles) &&
      o.struggles.every((x) => typeof x === "string")
    ) {
      journeyGoals = o.struggles as string[];
    }

    if (
      journeyGoals.length === 0 &&
      typeof o.purpose === "string" &&
      o.purpose.trim().length > 0
    ) {
      journeyGoals = [o.purpose.trim()];
    }

    let preferredQE: string | null | undefined;
    const pk = (o as { preferredQuranEncTranslationKey?: unknown })
      .preferredQuranEncTranslationKey;
    if (pk === null || pk === undefined) preferredQE = undefined;
    else if (typeof pk === "string") preferredQE = pk;
    else preferredQE = undefined;

    const refl = o.reflectionLanguage;
    const reflectionLanguage =
      refl === undefined || refl === null
        ? undefined
        : typeof refl === "string"
          ? refl
          : undefined;

    return {
      ...(preferredQE !== undefined
        ? { preferredQuranEncTranslationKey: preferredQE }
        : {}),
      ...(reflectionLanguage !== undefined ? { reflectionLanguage } : {}),
      journeyGoals,
      completedAt,
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
