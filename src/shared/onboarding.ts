export const ONBOARDING_INTENTIONS = [
  { id: "khutbah_notes", label: "khutbah notes" },
  { id: "quran_reflection", label: "Quran reflection" },
  { id: "prayer_consistency", label: "prayer consistency" },
  { id: "halaqa_class_notes", label: "halaqa/class notes" },
  { id: "ramadan_preparation", label: "Ramadan preparation" },
  { id: "reconnect_spiritually", label: "reconnect spiritually" },
] as const;

export type OnboardingIntentionId = (typeof ONBOARDING_INTENTIONS)[number]["id"];

export type OnboardingStepId =
  | "welcome"
  | "intentions"
  | "quran_language"
  | "reflection_language"
  | "completion";

export type OnboardingStepContract = {
  id: OnboardingStepId;
  title: string;
  description: string;
  emotionalPrompt: string;
};

export const ONBOARDING_STEPS: readonly OnboardingStepContract[] = [
  {
    id: "welcome",
    title: "Welcome to DeenNotes",
    description: "Capture what benefits your heart and revisit it with calm structure.",
    emotionalPrompt: "Start gently; consistency matters more than intensity.",
  },
  {
    id: "intentions",
    title: "Set your intention",
    description: "Choose what you want help remembering and applying.",
    emotionalPrompt: "Let this be a tool for steady, sincere growth.",
  },
  {
    id: "quran_language",
    title: "Choose Quran meaning language",
    description: "Pick a translation key that reads naturally beside Arabic.",
    emotionalPrompt: "Read slowly, reflect deeply, return often.",
  },
  {
    id: "reflection_language",
    title: "Choose reflection language",
    description: "Set your personal reflection language for prompts and summaries.",
    emotionalPrompt: "Use the language that helps your heart stay present.",
  },
  {
    id: "completion",
    title: "You're ready",
    description: "Begin with Today, then Reflect and Quran as your daily rhythm.",
    emotionalPrompt: "Small faithful steps become lasting transformation.",
  },
] as const;

export const ONBOARDING_JOURNEY_GOAL_OPTIONS = ONBOARDING_INTENTIONS;

export type OnboardingAnswersContract = {
  preferredQuranEncTranslationKey?: string | null;
  reflectionLanguage?: string;
  journeyGoals: string[];
  completedAt: string;
};
