import type { Metadata } from "next";

import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";

export const metadata: Metadata = {
  title: "Welcome",
  description:
    "Choose how you want to start reflecting with DeenNotes AI.",
};

export default function OnboardingPage() {
  return <OnboardingScreen />;
}
