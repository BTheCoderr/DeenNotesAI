"use client";

import { BottomSheet } from "@/components/ds/BottomSheet";
import { TranslationSelector } from "@/components/quran/TranslationSelector";
import type { TranslationCatalogItem } from "@/features/quran/hooks/useQuranData";
import type { QuranEncLanguageGroupDto } from "@/lib/quranenc/types";
import {
  readPreferredQuranEncTranslationKey,
  writePreferredQuranEncTranslationKey,
} from "@/lib/browser/quranenc-preference";
import {
  readPreferredTranslationIds,
  writePreferredTranslationIds,
} from "@/lib/quran/translation-preference";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  translations: TranslationCatalogItem[];
  selectedTranslation: string;
  onSelect: (value: string) => void;
  quranEncLanguageGroups: QuranEncLanguageGroupDto[];
  selectedQuranEncKey: string | null;
  onSelectQuranEncKey: (value: string | null) => void;
  quranEncCatalogError?: string | null;
};

export function TranslationPickerSheet({
  open,
  onClose,
  translations,
  selectedTranslation,
  onSelect,
  quranEncLanguageGroups,
  selectedQuranEncKey,
  onSelectQuranEncKey,
  quranEncCatalogError,
}: Props) {
  const stored = readPreferredTranslationIds();
  const storedQe = readPreferredQuranEncTranslationKey();

  return (
    <BottomSheet open={open} onClose={onClose} zClass="z-[55]">
      <div className="flex justify-center pt-2 pb-1 md:hidden">
        <span className="h-1 w-10 rounded-full bg-black/15" aria-hidden />
      </div>
      <div className="border-b border-black/[0.06] px-5 py-4 flex items-center justify-between gap-3 shrink-0">
        <div>
          <h2
            id="translation-sheet-title"
            className="font-display text-lg font-semibold text-ink"
          >
            Translations
          </h2>
          <p className="text-[0.7rem] text-muted mt-0.5">
            Arabic Mushaf typography stays authored by Quran Foundation — parallel lines are layered
            for understanding only.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-muted hover:bg-mint/40 hover:text-accent"
        >
          Done
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto overscroll-contain px-3 py-2 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-1">
        <li className="pb-1">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-accent px-4">
            Quran Foundation
          </p>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              onSelect("pref");
              onClose();
            }}
            className={cn(
              "w-full text-left rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
              selectedTranslation === "pref"
                ? "bg-accent/12 text-accent ring-1 ring-accent/25"
                : "text-ink hover:bg-mint/30",
            )}
          >
            Content API default
            {stored ? (
              <span className="block text-[0.65rem] font-normal text-muted mt-0.5">
                Saved resource ids: {stored}
              </span>
            ) : null}
          </button>
        </li>
        {translations
          .filter((t) => t.id != null)
          .map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  const v = String(t.id);
                  writePreferredTranslationIds(v);
                  onSelect(v);
                  onClose();
                }}
                className={cn(
                  "w-full text-left rounded-2xl px-4 py-3 text-sm transition-colors",
                  selectedTranslation === String(t.id)
                    ? "bg-accent/12 text-accent ring-1 ring-accent/25 font-semibold"
                    : "text-ink/90 hover:bg-mint/30 font-medium",
                )}
              >
                <span className="text-xs uppercase tracking-wide text-muted">
                  {t.languageName ?? "—"}
                </span>
                <span className="block mt-0.5">{t.name ?? t.id}</span>
              </button>
            </li>
          ))}
        <li className="pt-5 pb-1">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-accent px-4">
            QuranEnc (multilingual)
          </p>
          <p className="text-[0.65rem] text-muted px-4 mt-1 leading-relaxed">
            Verbatim text & narrations per QuranEnc terms — never rewritten in-app.
          </p>
        </li>
        {quranEncCatalogError ? (
          <li className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-xs text-amber-950 mx-2">
            {quranEncCatalogError}
          </li>
        ) : null}
        <li>
          <button
            type="button"
            onClick={() => {
              writePreferredQuranEncTranslationKey(null);
              onSelectQuranEncKey(null);
              onClose();
            }}
            className={cn(
              "w-full text-left rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
              selectedQuranEncKey === null
                ? "bg-mint/50 text-accent ring-1 ring-accent/20"
                : "text-ink hover:bg-mint/30",
            )}
          >
            QuranEnc off
            {storedQe ? (
              <span className="block text-[0.65rem] font-normal text-muted mt-0.5">
                Last saved QuranEnc row: {storedQe}
              </span>
            ) : (
              <span className="block text-[0.65rem] font-normal text-muted mt-0.5">
                Use Quran Foundation wording only underneath Arabic.
              </span>
            )}
          </button>
        </li>
        <li className="px-2 py-2">
          <TranslationSelector
            hideGlobalClear
            languageGroups={quranEncLanguageGroups}
            selectedKey={selectedQuranEncKey}
            onSelectKey={(key) => {
              onSelectQuranEncKey(key);
              onClose();
            }}
            onClearSelection={() => {
              onSelectQuranEncKey(null);
              onClose();
            }}
          />
        </li>
      </ul>
    </BottomSheet>
  );
}
