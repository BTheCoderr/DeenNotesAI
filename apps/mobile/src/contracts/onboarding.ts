export const ONBOARDING_INTENTIONS = [
  { id: "khutbah_notes", label: "khutbah notes" },
  { id: "quran_reflection", label: "Quran reflection" },
  { id: "prayer_consistency", label: "prayer consistency" },
  { id: "halaqa_class_notes", label: "halaqa/class notes" },
  { id: "ramadan_preparation", label: "Ramadan preparation" },
  { id: "reconnect_spiritually", label: "reconnect spiritually" },
] as const;

export type OnboardingStepId =
  | "welcome"
  | "intentions"
  | "quran_language"
  | "reflection_language"
  | "completion";

export const ONBOARDING_STEPS = [
  {
    id: "welcome" as const,
    title: "Welcome to DeenNotes",
    description: "Capture what benefits your heart and revisit it with calm structure.",
    emotionalPrompt: "Start gently; consistency matters more than intensity.",
  },
  {
    id: "intentions" as const,
    title: "Set your intention",
    description: "Choose what you want help remembering and applying.",
    emotionalPrompt: "Let this be a tool for steady, sincere growth.",
  },
  {
    id: "quran_language" as const,
    title: "Choose Quran meaning language",
    description: "Pick a translation key that reads naturally beside Arabic.",
    emotionalPrompt: "Read slowly, reflect deeply, return often.",
  },
  {
    id: "reflection_language" as const,
    title: "Choose reflection language",
    description: "Set your personal reflection language for prompts and summaries.",
    emotionalPrompt: "Use the language that helps your heart stay present.",
  },
  {
    id: "completion" as const,
    title: "You're ready",
    description: "Begin with Today, then Reflect and Quran as your daily rhythm.",
    emotionalPrompt: "Small faithful steps become lasting transformation.",
  },
] as const;
