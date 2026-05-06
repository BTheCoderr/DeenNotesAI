"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { TranslationSelector } from "@/components/quran/TranslationSelector";
import { DeenNotesLogo } from "@/components/brand/DeenNotesLogo";
import { useQuranEncGroupedTranslationCatalog } from "@/features/quran/hooks/useQuranData";
import {
  writeOnboardingToLocal,
  type OnboardingAnswers,
} from "@/lib/onboarding-storage";
import { readPreferredQuranEncTranslationKey } from "@/lib/browser/quranenc-preference";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const PURPOSE_OPTIONS = [
  "Capture & review khutbahs",
  "Organize Islamic lectures",
  "Reflect on Qur’an study",
  "Build a weekly reminder habit",
] as const;

const AGE_GROUPS = [
  "13–17",
  "18–24",
  "25–34",
  "35–44",
  "45–54",
  "55–64",
  "65+",
] as const;

const USER_TYPES = [
  "New Muslim / Exploring",
  "Everyday Muslim",
  "Student of knowledge",
  "Parent / Family learner",
  "Halaqa or youth group leader",
  "Other",
] as const;

const STRUGGLES = [
  "I forget what I heard after Jumu’ah",
  "I take messy notes but never review them",
  "I want to apply reminders during the week",
  "I want better dua and reflection prompts",
  "I want to organize lectures and halaqas",
] as const;

async function persistOnboardingRemote(answers: OnboardingAnswers) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase.from("user_onboarding_profiles").upsert(
    {
      user_id: user.id,
      purpose: answers.purpose,
      age_group: answers.ageGroup,
      user_type: answers.userType,
      struggles: answers.struggles,
      completed_at: answers.completedAt,
    },
    { onConflict: "user_id" },
  );
  if (process.env.NODE_ENV === "development" && error) {
    console.warn("[onboarding]", error.message);
  }
}

export function OnboardingScreen() {
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const {
    languages: quranLanguages,
    error: quranLangError,
    loading: quranLangLoading,
  } = useQuranEncGroupedTranslationCatalog();
  const [onboardingQEKey, setOnboardingQEKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return readPreferredQuranEncTranslationKey() ?? null;
  });
  const [purpose, setPurpose] = useState<string>(PURPOSE_OPTIONS[0]);
  const [ageGroup, setAgeGroup] = useState<string>(AGE_GROUPS[1]);
  const [userType, setUserType] = useState<string>(USER_TYPES[1]);
  const [struggles, setStruggles] = useState<string[]>([]);

  useEffect(() => {
    const k = readPreferredQuranEncTranslationKey();
    setOnboardingQEKey(k ?? null);
  }, [quranLanguages]);

  const [checks, setChecks] = useState([false, false, false]);

  useEffect(() => {
    if (step !== 6) return;

    const t0 = window.setTimeout(() => {
      setChecks((c) => [true, c[1], c[2]]);
    }, 380);
    const t1 = window.setTimeout(() => {
      setChecks((c) => [c[0], true, c[2]]);
    }, 980);
    const t2 = window.setTimeout(() => {
      setChecks((c) => [c[0], c[1], true]);
    }, 1480);

    const done = window.setTimeout(() => {
      const completedAt = new Date().toISOString();
      const preferredKey = readPreferredQuranEncTranslationKey() ?? undefined;
      const answers: OnboardingAnswers = {
        ...(preferredKey ? { preferredQuranEncTranslationKey: preferredKey } : {}),
        purpose,
        ageGroup,
        userType,
        struggles,
        completedAt,
      };
      writeOnboardingToLocal(answers);
      void persistOnboardingRemote(answers);
      setStep(7);
    }, 2600);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(done);
    };
  }, [step, purpose, ageGroup, userType, struggles]);

  useEffect(() => {
    if (step === 6) {
      setChecks([false, false, false]);
    }
  }, [step]);

  function toggleStruggle(s: string) {
    setStruggles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function advanceFromStep5Struggles() {
    if (struggles.length === 0) return;
    setStep(6);
  }

  const canBack = step > 0 && step < 6;

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-20 space-y-8">
      <div className="flex justify-center">
        <DeenNotesLogo size="md" />
      </div>

      {step > 0 && step < 6 ? (
        <div className="flex gap-2 justify-center px-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <motion.span
              key={n}
              layout={!reduceMotion}
              className={
                step >= n
                  ? "h-1.5 flex-1 rounded-full bg-accent max-w-[2rem]"
                  : "h-1.5 flex-1 rounded-full bg-black/10 max-w-[2rem]"
              }
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              aria-hidden
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
          transition={{
            duration: reduceMotion ? 0 : 0.38,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="space-y-6"
        >
      {step === 0 ? (
        <section className="text-center px-2 space-y-4">
          <h1 className="font-display text-[1.85rem] sm:text-[2rem] font-semibold text-ink leading-snug">
            Welcome to DeenNotes
          </h1>
          <p className="text-muted text-[0.98rem] leading-relaxed">
            Turn what you hear into reminders you actually live by.
          </p>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-6 w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-card hover:bg-accent-hover transition-colors max-w-xs mx-auto"
          >
            Get Started
          </button>
          <Link
            href="/app"
            className="block text-center text-sm font-medium text-muted hover:text-accent"
          >
            Skip for now
          </Link>
        </section>
      ) : null}

      {step === 1 ? (
        <StepPanel
          title="Which Qur’an meaning language resonates first?"
          subtitle="Optional — QuranEnc multilingual packs stay verbatim. You can change this anytime in the reader sheet."
        >
          <div className="space-y-3" role="group" aria-label="QuranEnc translations">
            {quranLangLoading ? (
              <p className="text-sm text-muted text-center py-6">Loading translators…</p>
            ) : null}
            {quranLangError ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-950">
                {quranLangError} You can skip and pick Arabic + translation pairing later in Quran.
              </p>
            ) : null}
            {!quranLangLoading && quranLanguages.length === 0 && !quranLangError ? (
              <p className="rounded-2xl border border-black/[0.08] px-4 py-3 text-center text-sm text-muted">
                No QuranEnc catalogs returned. Enable MOCK_QURANENC_API or check server configuration.
              </p>
            ) : null}
            <p id="ob-quran-lang-heading" className="sr-only">
              QuranEnc multilingual translations
            </p>
            {!quranLangLoading && quranLanguages.length > 0 ? (
              <TranslationSelector
                ariaLabelledBy="ob-quran-lang-heading"
                compact
                languageGroups={quranLanguages}
                selectedKey={onboardingQEKey}
                onSelectKey={(key) => {
                  setOnboardingQEKey(key);
                }}
                onClearSelection={() => setOnboardingQEKey(null)}
              />
            ) : null}
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full text-center text-xs font-semibold text-muted hover:text-accent"
            >
              Choose later · open settings in the reader anytime
            </button>
          </div>
        </StepPanel>
      ) : null}

      {step === 2 ? (
        <StepPanel
          title="What brings you to DeenNotes?"
          subtitle="Choose the option that fits best today—you can capture any kind of reflection later."
        >
          <div className="space-y-2" role="radiogroup">
            {PURPOSE_OPTIONS.map((opt) => (
              <OptionRow
                key={opt}
                selected={purpose === opt}
                onPick={() => setPurpose(opt)}
                label={opt}
              />
            ))}
          </div>
        </StepPanel>
      ) : null}

      {step === 3 ? (
        <StepPanel title="What’s your age group?">
          <div className="space-y-2" role="radiogroup">
            {AGE_GROUPS.map((opt) => (
              <OptionRow
                key={opt}
                selected={ageGroup === opt}
                onPick={() => setAgeGroup(opt)}
                label={opt}
              />
            ))}
          </div>
        </StepPanel>
      ) : null}

      {step === 4 ? (
        <StepPanel title="Which best describes you?">
          <div className="space-y-2" role="radiogroup">
            {USER_TYPES.map((opt) => (
              <OptionRow
                key={opt}
                selected={userType === opt}
                onPick={() => setUserType(opt)}
                label={opt}
              />
            ))}
          </div>
        </StepPanel>
      ) : null}

      {step === 5 ? (
        <StepPanel title="What’s your biggest struggle with Islamic learning?" subtitle="Pick all that apply.">
          <div className="space-y-2">
            {STRUGGLES.map((opt) => {
              const sel = struggles.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={sel}
                  onClick={() => toggleStruggle(opt)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition text-sm leading-relaxed",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                    sel
                      ? "border-accent bg-accent-soft/60 ring-2 ring-accent/20"
                      : "border-black/[0.08] bg-surface hover:border-accent/20",
                  )}
                >
                  <span className="font-semibold text-ink">{opt}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-3">
            Reflection and organization—not rulings or fatwas.
          </p>
        </StepPanel>
      ) : null}

      {step === 6 ? (
        <section className="text-center px-4 space-y-8 py-12">
          <div className="space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-accent/30 border-t-accent motion-safe:animate-spin motion-reduce:animate-none mx-auto" />
            <h2 className="font-display text-xl font-semibold text-ink">
              Crafting your reflection space
            </h2>
          </div>
          <ul className="space-y-3 text-sm text-muted text-left max-w-xs mx-auto">
            <CheckRow done={checks[0]} label="Tailoring to your learning style" />
            <CheckRow done={checks[1]} label="Preparing your personal journal" />
            <CheckRow done={checks[2]} label="Setting up your weekly reminder flow" />
          </ul>
        </section>
      ) : null}

      {step === 7 ? (
        <section className="text-center px-2 space-y-5 pb-8">
          <h2 className="font-display text-[1.75rem] font-semibold text-ink leading-snug">
            Your DeenNotes journey is ready.
          </h2>
          <p className="text-muted leading-relaxed">
            Capture reminders. Reflect deeply. Practice what you learn—for life, not legal verdicts.
          </p>
          <Link
            href="/app"
            className="inline-flex mt-4 w-full max-w-xs mx-auto items-center justify-center rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-card hover:bg-accent-hover transition-colors"
          >
            Start Journey
          </Link>
        </section>
      ) : null}
        </motion.div>
      </AnimatePresence>

      {step >= 1 && step <= 5 ? (
        <div className="flex flex-col-reverse sm:flex-row gap-3 px-2 pt-2">
          <button
            type="button"
            disabled={!canBack}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className={
              canBack
                ? "rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink hover:bg-background"
                : "rounded-full border border-transparent px-6 py-3 text-sm font-semibold text-muted cursor-not-allowed"
            }
          >
            Back
          </button>
          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white hover:bg-accent-hover flex-1 sm:flex-none shadow-card"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              disabled={struggles.length === 0}
              onClick={() => advanceFromStep5Struggles()}
              className={
                struggles.length === 0
                  ? "rounded-full bg-accent/35 px-8 py-3 text-sm font-semibold text-white cursor-not-allowed flex-1"
                  : "rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white hover:bg-accent-hover flex-1 shadow-card"
              }
            >
              Continue
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function StepPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-5 px-1">
      <header className="space-y-2 text-center sm:text-left">
        <h1 className="font-display text-[1.5rem] sm:text-[1.65rem] font-semibold text-ink leading-snug">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-muted text-[0.95rem] leading-relaxed">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function OptionRow({
  label,
  selected,
  onPick,
}: {
  label: string;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onPick}
      className={cn(
        "w-full rounded-2xl border px-4 py-3 text-left transition",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "border-accent bg-accent-soft/50 ring-2 ring-accent/25"
          : "border-black/[0.08] bg-surface hover:border-accent/20",
      )}
    >
      <span className="font-semibold text-ink text-sm leading-snug">{label}</span>
    </button>
  );
}

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex gap-3 items-center">
      <span
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
          done
            ? "border-accent bg-accent text-white"
            : "border-black/15 bg-surface text-transparent",
        )}
        aria-hidden
      >
        ✓
      </span>
      <span className={done ? "text-ink font-medium" : undefined}>{label}</span>
    </li>
  );
}
