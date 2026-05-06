"use client";

import { BottomSheet } from "@/components/ds/BottomSheet";
import type { TranslationCatalogItem } from "@/features/quran/hooks/useQuranData";
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
};

export function TranslationPickerSheet({
  open,
  onClose,
  translations,
  selectedTranslation,
  onSelect,
}: Props) {
  const stored = readPreferredTranslationIds();

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
            Translation
          </h2>
          <p className="text-[0.7rem] text-muted mt-0.5">
            Choose a resource for understanding—Arabic text is unchanged.
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
            Server default
            {stored ? (
              <span className="block text-[0.65rem] font-normal text-muted mt-0.5">
                Saved preference: {stored}
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
      </ul>
    </BottomSheet>
  );
}
