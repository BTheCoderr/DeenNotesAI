"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { TranslationSelector } from "@/components/quran/TranslationSelector";
import {
  QuranSettingsPrinciple,
  QuranSettingsSubnav,
} from "@/features/quran/components/settings/QuranSettingsChrome";
import { useQuranEncGroupedTranslationCatalog } from "@/features/quran/hooks/useQuranData";
import {
  REFLECTION_LANGUAGE_OPTIONS,
  readReflectionLocale,
  type ReflectionLocale,
  writeReflectionLocale,
} from "@/lib/browser/quran-content-prefs";
import {
  readPreferredQuranEncTranslationKey,
  writePreferredQuranEncTranslationKey,
} from "@/lib/browser/quranenc-preference";

export function QuranAppLanguageSettingsScreen() {
  const { languages, loading, error } = useQuranEncGroupedTranslationCatalog();
  const [refl, setRefl] = useState<ReflectionLocale>("en");
  const [qeKey, setQeKey] = useState<string | null>(() => readPreferredQuranEncTranslationKey() ?? null);

  useEffect(() => {
    setRefl(readReflectionLocale() ?? "en");
    setQeKey(readPreferredQuranEncTranslationKey() ?? null);
  }, [languages]);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24">
      <div className="space-y-2">
        <Link href="/app/quran" className="text-xs font-bold text-accent hover:underline">
          ← Back to Quran
        </Link>
        <h2 className="font-display text-[1.65rem] font-semibold text-ink">Language</h2>
        <p className="text-sm text-muted leading-relaxed">
          Reflection language nudges prompts and summaries toward a tone you recognize. QuranEnc
          translation is paired separately so scholars’ renderings stay clearly attributed.
        </p>
      </div>
      <QuranSettingsSubnav active="/app/quran/settings/language" />
      <QuranSettingsPrinciple />

      <label className="block space-y-2 rounded-2xl border border-black/[0.06] bg-surface p-4">
        <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
          App reflection language
        </span>
        <select
          value={refl}
          onChange={(e) => {
            const next = e.target.value as ReflectionLocale;
            setRefl(next);
            writeReflectionLocale(next);
          }}
          className="w-full rounded-xl border border-black/[0.08] bg-background px-3 py-3 text-sm font-medium"
        >
          {REFLECTION_LANGUAGE_OPTIONS.map((o) => (
            <option key={o.code} value={o.code}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-2xl border border-black/[0.06] bg-surface p-4 space-y-3">
        <p id="qe-lang-bundle" className="font-display text-sm font-semibold">
          QuranEnc translation pairing
        </p>
        {loading ? <p className="text-sm text-muted">Loading QuranEnc catalogs…</p> : null}
        {error ? (
          <p className="text-xs text-amber-950 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            {error}
          </p>
        ) : null}
        {languages.length ? (
          <TranslationSelector
            ariaLabelledBy="qe-lang-bundle"
            compact
            languageGroups={languages}
            selectedKey={qeKey}
            onSelectKey={(k) => {
              setQeKey(k);
              writePreferredQuranEncTranslationKey(k);
            }}
            onClearSelection={() => {
              setQeKey(null);
              writePreferredQuranEncTranslationKey(null);
            }}
          />
        ) : !loading ? (
          <p className="text-sm text-muted">No QuranEnc catalogs in this deployment.</p>
        ) : null}
      </div>
    </div>
  );
}
