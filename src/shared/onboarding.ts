export const ONBOARDING_INTENTIONS = [
  { id: "khutbah_notes", label: "Khutbah notes" },
  { id: "quran_reflection", label: "Qur'an reflection" },
  { id: "prayer_consistency", label: "Prayer consistency" },
  { id: "halaqa_class_notes", label: "Halaqa / class notes" },
  { id: "ramadan_preparation", label: "Ramadan preparation" },
  { id: "reconnect_spiritually", label: "Reconnect spiritually" },
] as const;

export type OnboardingIntentionId = (typeof ONBOARDING_INTENTIONS)[number]["id"];

export type OnboardingStepId =
  | "welcome"
  | "intentions"
  | "quran_language"
  | "reflection_language"
  | "permissions_framing"
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
    title: "Welcome",
    description: "Capture what benefits your heart — with calm structure when you return.",
    emotionalPrompt: "Start small. Steadiness matters more than intensity.",
  },
  {
    id: "intentions",
    title: "Your intention",
    description: "Tap the purposes that feel close to you — you can change later.",
    emotionalPrompt: "Honest choices, not a checklist.",
  },
  {
    id: "quran_language",
    title: "Meaning beside Arabic",
    description: "Pick a language key for Qur'an meaning — it reads next to the Arabic in the reader.",
    emotionalPrompt: "Read slowly. Return often.",
  },
  {
    id: "reflection_language",
    title: "Reflection language",
    description: "When you write or generate notes, prompts follow this tongue — separate from the Arabic revelation.",
    emotionalPrompt: "Pick what keeps you inwardly present.",
  },
  {
    id: "permissions_framing",
    title: "If the phone asks permission",
    description:
      "Location is only to align prayer times to where you are. Notifications are optional nudges. Microphone is only if you record a khutbah — nothing uploads until you attach it.",
    emotionalPrompt: "Not now is a valid answer — the rest of the app still opens gently.",
  },
  {
    id: "completion",
    title: "You're settled in",
    description:
      "You’ll open to Today — prayer rhythm first, then Quran and reflection when you’re ready.",
    emotionalPrompt: "Peaceful pacing beats rushing through every feature.",
  },
] as const;

export const ONBOARDING_JOURNEY_GOAL_OPTIONS = ONBOARDING_INTENTIONS;

export type OnboardingAnswersContract = {
  preferredQuranEncTranslationKey?: string | null;
  reflectionLanguage?: string;
  journeyGoals: string[];
  completedAt: string;
};
