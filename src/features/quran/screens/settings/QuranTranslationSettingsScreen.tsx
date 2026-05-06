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
  readPreferredQuranEncTranslationKey,
  writePreferredQuranEncTranslationKey,
} from "@/lib/browser/quranenc-preference";

export function QuranTranslationSettingsScreen() {
  const { languages, loading, error } = useQuranEncGroupedTranslationCatalog();
  const [key, setKey] = useState<string | null>(() => readPreferredQuranEncTranslationKey() ?? null);

  useEffect(() => {
    setKey(readPreferredQuranEncTranslationKey() ?? null);
  }, [languages]);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24">
      <div className="space-y-2">
        <Link
          href="/app/quran"
          className="text-xs font-bold text-accent hover:underline underline-offset-4"
        >
          ← Back to Quran
        </Link>
        <h2 className="font-display text-[1.65rem] font-semibold text-ink">Quran translation</h2>
        <p className="text-sm text-muted leading-relaxed">
          QuranEnc multilingual packs include translator attribution in each row. Pick the meaning
          language you want beside the Arabic.
        </p>
      </div>
      <QuranSettingsSubnav active="/app/quran/settings/translation" />
      <QuranSettingsPrinciple />
      {loading ? <p className="text-sm text-muted py-8 text-center">Loading catalogs…</p> : null}
      {error ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {error}
        </p>
      ) : null}
      <div className="rounded-2xl border border-black/[0.06] bg-surface p-4">
        <p id="qe-set-label" className="font-display text-sm font-semibold mb-3">
          QuranEnc translations
        </p>
        {languages.length ? (
          <TranslationSelector
            ariaLabelledBy="qe-set-label"
            languageGroups={languages}
            selectedKey={key}
            onSelectKey={(k) => {
              setKey(k);
              writePreferredQuranEncTranslationKey(k);
            }}
            onClearSelection={() => {
              setKey(null);
              writePreferredQuranEncTranslationKey(null);
            }}
          />
        ) : !loading ? (
          <p className="text-sm text-muted">
            No QuranEnc catalog available. Check MOCK_QURANENC_API or deployment configuration.
          </p>
        ) : null}
      </div>
    </div>
  );
}
