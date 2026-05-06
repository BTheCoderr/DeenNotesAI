"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import type { QuranEncLanguageGroupDto } from "@/lib/quranenc/types";
import {
  dequeueLanguagePack,
  queueLanguagePackDownload,
  readLanguagePackQueue,
  readTranslationSelectorExpandedLang,
  writeTranslationSelectorExpandedLang,
} from "@/lib/browser/quran-language-memory";
import { writePreferredQuranEncTranslationKey } from "@/lib/browser/quranenc-preference";
import { QURANENC_TERMS_URL } from "@/lib/quranenc/types";
import { cn } from "@/lib/utils";

type Props = {
  languageGroups: QuranEncLanguageGroupDto[];
  selectedKey: string | null;
  onSelectKey: (key: string) => void;
  onClearSelection: () => void;
  compact?: boolean;
  ariaLabelledBy?: string;
  hideGlobalClear?: boolean;
};

export function TranslationSelector({
  languageGroups,
  selectedKey,
  onSelectKey,
  onClearSelection,
  compact = false,
  ariaLabelledBy,
  hideGlobalClear = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [openIso, setOpenIso] = useState<string | null>(null);
  const [queued, setQueued] = useState<ReturnType<
    typeof readLanguagePackQueue
  >>(() => []);

  useEffect(() => {
    setQueued(readLanguagePackQueue());
  }, [languageGroups]);

  useEffect(() => {
    const saved = readTranslationSelectorExpandedLang();
    if (saved && languageGroups.some((g) => g.languageIso === saved)) {
      setOpenIso(saved);
    }
  }, [languageGroups]);

  useEffect(() => {
    writeTranslationSelectorExpandedLang(openIso);
  }, [openIso]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q)
      return languageGroups.map((g) => ({
        ...g,
        translations: [...g.translations],
      }));

    const out: QuranEncLanguageGroupDto[] = [];
    for (const g of languageGroups) {
      const matchLang =
        g.languageLabel.toLowerCase().includes(q) ||
        g.languageIso.toLowerCase().includes(q);
      const tl = g.translations.filter((t) => {
        const blob = `${t.title ?? ""} ${t.key} ${t.description ?? ""}`.toLowerCase();
        return blob.includes(q);
      });
      if (matchLang || tl.length) {
        out.push({
          ...g,
          translations: matchLang ? [...g.translations] : tl,
        });
      }
    }
    return out;
  }, [languageGroups, query]);

  function refreshQueued() {
    setQueued(readLanguagePackQueue());
  }

  const rowButton = (
    row: (typeof filteredGroups)[0]["translations"][0],
    group: (typeof filteredGroups)[0],
    showPackRow: boolean,
  ) => {
    const sel = selectedKey === row.key;
    return (
      <div
        className={cn(
          "rounded-xl px-2.5 py-2 flex flex-col gap-1 transition-colors",
          sel ? "bg-accent/10 ring-1 ring-accent/25" : "hover:bg-mint/35",
        )}
      >
        <button
          type="button"
          onClick={() => {
            writePreferredQuranEncTranslationKey(row.key);
            onSelectKey(row.key);
          }}
          className="w-full text-left"
        >
          <span className="text-[0.58rem] uppercase tracking-[0.16em] text-muted">
            {row.version ? `v${row.version}` : "—"}
          </span>
          {showPackRow ? (
            <span className="mt-0.5 block text-[0.56rem] text-muted/90">
              Ayah toolbar: Listen in this language
            </span>
          ) : null}
          <span className="block text-sm font-medium text-ink leading-snug">
            {(row.title ?? row.key).trim() || row.key}
          </span>
          <span className="text-[0.62rem] text-muted font-mono">{row.key}</span>
          {row.last_update != null && row.last_update !== "" ? (
            <span className="block text-[0.55rem] text-muted/90 mt-0.5">
              Catalogue metadata ·{" "}
              <span suppressHydrationWarning>{String(row.last_update)}</span>
            </span>
          ) : null}
        </button>
        {showPackRow ? (
        <PackQueueRow
          translationKey={row.key}
          languageIso={group.languageIso}
          isQueued={queued.some((q) => q.translationKey === row.key)}
          onEnqueue={() => {
            queueLanguagePackDownload(row.key, group.languageIso);
            refreshQueued();
          }}
          onDequeue={() => {
            dequeueLanguagePack(row.key);
            refreshQueued();
          }}
        />
        ) : null}
      </div>
    );
  };

  if (compact) {
    return (
      <div
        className="space-y-2"
        role="region"
        aria-labelledby={ariaLabelledBy}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by language or translation…"
          className={cn(
            "w-full rounded-2xl border border-black/[0.08] bg-background px-3 py-2 text-sm text-ink",
            "placeholder:text-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
          )}
        />
        <div className="max-h-[min(22rem,52vh)] space-y-3 overflow-y-auto overscroll-contain pr-1">
          {filteredGroups.map((group) => (
            <section key={group.languageIso} className="space-y-1.5">
              <h3 className="font-display px-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-accent">
                {group.languageLabel}{" "}
                <span className="font-normal text-muted">
                  ({group.languageIso})
                </span>
              </h3>
              <ul className="space-y-1">
                {group.translations.map((row) => (
                  <li key={row.key}>{rowButton(row, group, false)}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            writePreferredQuranEncTranslationKey(null);
            onClearSelection();
          }}
          className="text-xs font-semibold text-muted hover:text-accent"
        >
          Clear selection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="region" aria-labelledby={ariaLabelledBy}>
      <div className="flex flex-wrap items-start justify-between gap-2 px-1">
        <label className="block min-w-[10rem] flex-1">
          <span className="sr-only">Search QuranEnc translations</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search language or translator…"
            className={cn(
              "w-full rounded-2xl border border-black/[0.08] bg-surface/90 px-4 py-2.5 text-sm text-ink shadow-inner",
              "placeholder:text-muted/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
            )}
          />
        </label>
        {!hideGlobalClear ? (
          <button
            type="button"
            onClick={() => {
              writePreferredQuranEncTranslationKey(null);
              onClearSelection();
              setOpenIso(null);
            }}
            className="shrink-0 rounded-full border border-black/12 px-3 py-2 text-xs font-semibold text-muted hover:bg-mint/40 hover:text-accent"
          >
            Clear QuranEnc overlay
          </button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        {filteredGroups.map((group) => {
          const expanded = openIso === group.languageIso;
          return (
            <div
              key={group.languageIso}
              className={cn(
                "overflow-hidden rounded-[1.15rem] border border-black/[0.06] bg-surface/80 transition-colors",
                expanded && "border-accent/18 bg-accent-soft/15",
              )}
            >
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left"
                aria-expanded={expanded}
                onClick={() =>
                  setOpenIso((cur) =>
                    cur === group.languageIso ? null : group.languageIso,
                  )
                }
              >
                <span className="min-w-0">
                  <span className="block font-display text-sm font-semibold text-ink">
                    {group.languageLabel}
                  </span>
                  <span className="text-[0.65rem] uppercase tracking-[0.12em] text-muted">
                    {group.languageIso.toUpperCase()} · {group.translations.length}{" "}
                    editions
                  </span>
                </span>
                <motion.span
                  aria-hidden
                  className="shrink-0 text-xs text-muted"
                  animate={
                    reduceMotion
                      ? undefined
                      : { rotate: expanded ? 180 : 0 }
                  }
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  ▾
                </motion.span>
              </button>
              {expanded ? (
                <motion.ul
                  initial={reduceMotion ? false : { opacity: 0.92, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="space-y-1 border-t border-black/[0.05] px-2 pb-2 pt-1"
                >
                  {group.translations.map((row) => (
                    <li key={row.key}>{rowButton(row, group, true)}</li>
                  ))}
                </motion.ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="px-2 text-[0.62rem] leading-relaxed text-muted">
        QuranEnc narration MP3 URLs match the translator row you activate — use{" "}
        <strong className="text-ink/80">Listen in this language</strong>
        beside each ayah.&nbsp;
        <a
          href={QURANENC_TERMS_URL}
          className="text-accent underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          QuranEnc policies
        </a>
        .
      </p>
    </div>
  );
}

function PackQueueRow({
  translationKey,
  languageIso,
  isQueued,
  onEnqueue,
  onDequeue,
}: {
  translationKey: string;
  languageIso: string;
  isQueued: boolean;
  onEnqueue: () => void;
  onDequeue: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {!isQueued ? (
        <button
          type="button"
          onClick={onEnqueue}
          title={translationKey}
          className="rounded-full border border-dashed border-accent/35 bg-accent/5 px-2.5 py-1 text-[0.62rem] font-semibold text-accent hover:bg-accent/10"
        >
          Queue language pack
        </button>
      ) : (
        <button
          type="button"
          onClick={onDequeue}
          title={languageIso}
          className="rounded-full border border-black/12 bg-mint/30 px-2.5 py-1 text-[0.62rem] font-semibold text-ink hover:bg-mint/50"
        >
          Queued for download
        </button>
      )}
      <span className="text-[0.58rem] text-muted">Coming soon · local-first</span>
    </div>
  );
}
