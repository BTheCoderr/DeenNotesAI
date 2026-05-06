"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { TranslationSelector } from "@/components/quran/TranslationSelector";
import { DeenNotesLogo } from "@/components/brand/DeenNotesLogo";
import { useQuranEncGroupedTranslationCatalog } from "@/features/quran/hooks/useQuranData";
import {
  REFLECTION_LANGUAGE_OPTIONS,
  type ReflectionLocale,
  writeReflectionLocale,
} from "@/lib/browser/quran-content-prefs";
import {
  readPreferredQuranEncTranslationKey,
  writePreferredQuranEncTranslationKey,
} from "@/lib/browser/quranenc-preference";
import {
  writeOnboardingToLocal,
  type OnboardingAnswers,
} from "@/lib/onboarding-storage";
import { createClient } from "@/lib/supabase/client";
import { APP_DISCLAIMER } from "@/lib/constants";
import { cn } from "@/lib/utils";

const JOURNEY_GOALS = [
  "Jumu’ah khutbah notes",
  "Quran reflection",
  "Halaqa or class notes",
  "Personal reminders",
  "Family learning",
  "Ramadan preparation",
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
      purpose: answers.journeyGoals[0] ?? "DeenNotes reflection",
      age_group: "",
      user_type: "",
      struggles: answers.journeyGoals,
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
  const [qeKey, setQeKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return readPreferredQuranEncTranslationKey() ?? null;
  });
  const [reflectionLocale, setReflectionLocale] = useState<ReflectionLocale>("en");
  const [goals, setGoals] = useState<string[]>([]);

  useEffect(() => {
    const k = readPreferredQuranEncTranslationKey();
    setQeKey(k ?? null);
  }, [quranLanguages]);

  function toggleGoal(g: string) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function finish() {
    const completedAt = new Date().toISOString();
    const preferredKey = readPreferredQuranEncTranslationKey() ?? qeKey ?? undefined;
    writeReflectionLocale(reflectionLocale);
    if (preferredKey) writePreferredQuranEncTranslationKey(preferredKey);
    const answers: OnboardingAnswers = {
      journeyGoals: goals,
      completedAt,
      ...(preferredKey ? { preferredQuranEncTranslationKey: preferredKey } : {}),
      reflectionLanguage: reflectionLocale,
    };
    writeOnboardingToLocal(answers);
    void persistOnboardingRemote(answers);
  }

  const showDots = step >= 1 && step <= 6;
  const canBack = step > 0 && step < 7;

  return (
    <div className="max-w-md mx-auto px-4 py-8 pb-28 space-y-8 min-h-[80dvh]">
      <div className="flex justify-center">
        <DeenNotesLogo size="md" />
      </div>

      {showDots ? (
        <div className="flex gap-2 justify-center px-2">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <motion.span
              key={n}
              layout={!reduceMotion}
              className={
                step >= n
                  ? "h-1.5 flex-1 rounded-full bg-emerald-900 max-w-[2rem]"
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
          className="space-y-6 min-h-[12rem]"
        >
          {step === 0 ? (
            <section className="text-center px-1 space-y-5 pt-6">
              <h1 className="font-display text-[1.9rem] sm:text-[2.05rem] font-semibold text-[#1f1b16] leading-[1.18] tracking-tight">
                Welcome to DeenNotes
              </h1>
              <p className="text-[1.02rem] text-[#4a453d] leading-relaxed">
                Turn Islamic reminders into notes you can live by.
              </p>
              <p className="text-sm text-muted leading-relaxed px-2">
                Capture khutbahs, halaqas, Quran reflections, and personal reminders in one calm
                journal.
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-8 w-full max-w-xs mx-auto rounded-2xl bg-emerald-950 px-6 py-4 text-base font-semibold text-[#fcfbf7] shadow-md hover:bg-emerald-900 transition-colors"
              >
                Continue
              </button>
              <Link
                href="/app"
                className="block text-center text-sm font-medium text-muted hover:text-emerald-900"
              >
                Skip for now
              </Link>
            </section>
          ) : null}

          {step === 1 ? (
            <Story
              eyebrow="Rediscover"
              title="Don't let the khutbah fade by Monday."
              body="DeenNotes helps you turn what you heard into action steps, duas, and reflection prompts."
            />
          ) : null}

          {step === 2 ? (
            <Story
              eyebrow="Quran reflection"
              title="Read, reflect, and remember."
              body="Explore Quran ayat with translation, tafsir, audio, bookmarks, and reflection notes."
            />
          ) : null}

          {step === 3 ? (
            <Story
              eyebrow="Ask gently"
              title="Ask about your notes."
              body={`Get organization, summaries, and study support. ${APP_DISCLAIMER}`}
            />
          ) : null}

          {step === 4 ? (
            <section className="space-y-5 px-1">
              <header className="space-y-2 text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-900/85">
                  Language
                </p>
                <h1 className="font-display text-[1.55rem] font-semibold text-[#1f1b16] leading-snug">
                  Choose your reflection language
                </h1>
                <p className="text-sm text-muted leading-relaxed">
                  Then pick which QuranEnc meaning language reads most naturally beside the Arabic —
                  you can change both anytime in Quran settings.
                </p>
              </header>
              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted">
                  Preferred reflection language
                </span>
                <select
                  className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm font-medium text-ink shadow-sm"
                  value={reflectionLocale}
                  onChange={(e) =>
                    setReflectionLocale(e.target.value as ReflectionLocale)
                  }
                >
                  {REFLECTION_LANGUAGE_OPTIONS.map((o) => (
                    <option key={o.code} value={o.code}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="space-y-3 rounded-2xl border border-black/[0.06] bg-white/85 p-4 shadow-sm">
                <p id="ob-qe-heading" className="font-display text-sm font-semibold text-ink">
                  QuranEnc translation pairing
                </p>
                {quranLangLoading ? (
                  <p className="text-sm text-muted py-6 text-center">Loading translators…</p>
                ) : null}
                {quranLangError ? (
                  <p className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950">
                    {quranLangError}
                  </p>
                ) : null}
                {!quranLangLoading && quranLanguages.length > 0 ? (
                  <TranslationSelector
                    ariaLabelledBy="ob-qe-heading"
                    compact
                    languageGroups={quranLanguages}
                    selectedKey={qeKey}
                    onSelectKey={(key) => {
                      setQeKey(key);
                      writePreferredQuranEncTranslationKey(key);
                    }}
                    onClearSelection={() => {
                      setQeKey(null);
                      writePreferredQuranEncTranslationKey(null);
                    }}
                  />
                ) : null}
              </div>
              <p className="text-xs text-center text-muted">
                Arabic Quranic text stays authoritative — translations assist reflection only.
              </p>
            </section>
          ) : null}

          {step === 5 ? (
            <Story
              eyebrow="Prayer rhythm"
              title="Build your day around salah."
              body={
                <>
                  Add prayer times so reflections connect with your daily rhythm. You can tune city,
                  calculation method, and school in the Prayer tab after onboarding.
                  <span className="block mt-4 text-[0.8rem] text-muted">
                    Times may differ by masjid — follow local guidance when schedules conflict.
                  </span>
                </>
              }
            />
          ) : null}

          {step === 6 ? (
            <section className="space-y-5 px-1">
              <header className="space-y-2 text-center">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-900/85">
                  Personalize
                </p>
                <h1 className="font-display text-[1.55rem] font-semibold text-[#1f1b16] leading-snug">
                  What brings you here?
                </h1>
                <p className="text-sm text-muted leading-relaxed">Select all that apply.</p>
              </header>
              <div className="space-y-2">
                {JOURNEY_GOALS.map((opt) => {
                  const sel = goals.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={sel}
                      onClick={() => toggleGoal(opt)}
                      className={cn(
                        "w-full rounded-2xl border px-4 py-3.5 text-left transition text-[0.95rem] leading-relaxed",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
                        sel
                          ? "border-emerald-900/40 bg-emerald-950/[0.06] ring-2 ring-emerald-900/12"
                          : "border-black/[0.06] bg-white/90 hover:border-emerald-900/18",
                      )}
                    >
                      <span className="font-semibold text-[#1f1b16]">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {step === 7 ? (
            <section className="text-center px-3 space-y-5 pt-10">
              <h2 className="font-display text-[1.9rem] font-semibold text-[#1f1b16] leading-snug">
                Your DeenNotes journey is ready.
              </h2>
              <p className="text-muted leading-relaxed text-[1.02rem]">
                Start with one reflection. Messy notes are welcome.
              </p>
              <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto">{APP_DISCLAIMER}</p>
              <Link
                href="/app?from=onboarding"
                onClick={() => finish()}
                className="inline-flex mt-8 w-full max-w-xs mx-auto items-center justify-center rounded-2xl bg-emerald-950 px-6 py-4 text-base font-semibold text-[#fcfbf7] shadow-md hover:bg-emerald-900 transition-colors"
              >
                Begin
              </Link>
            </section>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {step >= 1 && step <= 6 ? (
        <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 px-6 max-w-md mx-auto flex flex-col gap-3 pb-6">
          <div className="flex gap-3">
            <button
              type="button"
              disabled={!canBack}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={
                canBack
                  ? "rounded-2xl border border-black/12 px-5 py-3.5 text-sm font-semibold text-[#2C2419] hover:bg-white/70"
                  : "rounded-2xl border border-transparent px-5 py-3.5 text-sm font-semibold text-muted cursor-not-allowed"
              }
            >
              Back
            </button>
            {step === 6 ? (
              <button
                type="button"
                disabled={goals.length === 0}
                onClick={() => setStep(7)}
                className={cn(
                  "flex-1 rounded-2xl px-8 py-3.5 text-sm font-semibold text-[#fcfbf7] shadow-md",
                  goals.length === 0
                    ? "bg-emerald-950/35 cursor-not-allowed"
                    : "bg-emerald-950 hover:bg-emerald-900",
                )}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(7, s + 1))}
                className="flex-1 rounded-2xl bg-emerald-950 px-8 py-3.5 text-sm font-semibold text-[#fcfbf7] shadow-md hover:bg-emerald-900"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Story({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
}) {
  return (
    <section className="text-center px-2 space-y-5 pt-8">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-emerald-900/85">
        {eyebrow}
      </p>
      <h1 className="font-display text-[1.75rem] sm:text-[1.9rem] font-semibold text-[#1f1b16] leading-snug">
        {title}
      </h1>
      <div className="text-[1.02rem] text-[#4a453d] leading-relaxed space-y-3">{body}</div>
    </section>
  );
}
