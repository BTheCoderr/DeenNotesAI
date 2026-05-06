"use client";

import { useEffect, useState } from "react";

import {
  offlineReflectionSubtitle,
  parseQuranErrorPayload,
  quranFetchErrorForApp,
  splitQuranApiJson,
} from "@/lib/quran/api-contract";
import { QURAN_NOTE_REFERENCES_HINT } from "@/lib/quran/ui-copy";
import type { VerseDto } from "@/lib/quran/types";
import { cn } from "@/lib/utils";

type Props = {
  surah: number;
  ayah: number;
  onOpen?: () => void;
  compact?: boolean;
};

/**
 * Quiet inline Qur’an excerpt — typography-forward, authoritative Arabic line preserved.
 */
export function NoteAyahEmbedCard({
  surah,
  ayah,
  onOpen,
  compact,
}: Props) {
  const [verse, setVerse] = useState<VerseDto | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [offlineHelp, setOfflineHelp] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    void (async () => {
      setErr(null);
      setOfflineHelp(null);
      setVerse(null);
      try {
        const res = await fetch(`/api/quran/verses/${surah}/${ayah}`, {
          cache: "force-cache",
        });
        let raw: unknown;
        try {
          raw = await res.json();
        } catch {
          raw = null;
        }

        if (!res.ok || raw === null) {
          if (!cancel) {
            const split = splitQuranApiJson<Record<string, unknown>>(raw ?? {});
            const pe = parseQuranErrorPayload(raw);
            setOfflineHelp(offlineReflectionSubtitle(split.meta ?? pe.meta));
            setErr(quranFetchErrorForApp(raw ?? {}));
          }
          return;
        }

        const { data, meta } = splitQuranApiJson<{ verse?: VerseDto | null }>(raw);
        if (!data.verse) {
          if (!cancel) {
            setErr("Ayah excerpt unavailable.");
            setOfflineHelp(offlineReflectionSubtitle(meta));
          }
          return;
        }
        if (!cancel) {
          setErr(null);
          setOfflineHelp(offlineReflectionSubtitle(meta));
          setVerse(data.verse);
        }
      } catch {
        if (!cancel) {
          setErr("Connection interrupted.");
          setOfflineHelp(null);
        }
      }
    })();
    return () => {
      cancel = true;
    };
  }, [surah, ayah]);

  return (
    <figure
      className={cn(
        "rounded-[1.25rem] border border-black/[0.07] bg-gradient-to-br from-mint/30 via-surface to-accent-soft/25 p-5 shadow-inner",
        compact && "p-4",
      )}
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-accent tabular-nums">
          Quran · {surah}:{ayah}
        </span>
        {onOpen ? (
          <button
            type="button"
            onClick={onOpen}
            className="text-[0.65rem] font-bold text-accent hover:underline"
          >
            Open reader
          </button>
        ) : null}
      </figcaption>
      {offlineHelp && verse ? (
        <p className="text-[0.65rem] text-muted leading-snug mb-2 border-l-2 border-accent/35 pl-2">
          {offlineHelp}
        </p>
      ) : null}
      {err ? (
        <p className="text-xs text-muted leading-relaxed">
          {err}
          {offlineHelp && !verse ? (
            <>
              {" "}
              <span className="block mt-2 text-[0.65rem] border-l border-accent/30 pl-2">
                {offlineHelp}
              </span>
            </>
          ) : null}
        </p>
      ) : verse ? (
        <>
          <p
            dir="rtl"
            translate="no"
            className={cn(
              "text-right leading-[2] text-ink font-normal tracking-wide",
              compact ? "text-[1rem]" : "text-[1.05rem] sm:text-[1.15rem]",
            )}
          >
            {verse.textUthmani || verse.textImlaei || "—"}
          </p>
          {verse.translations?.[0]?.text ? (
            <blockquote className="mt-4 border-l-2 border-accent/35 pl-3 text-sm text-ink/88 leading-relaxed">
              {verse.translations[0].text}
            </blockquote>
          ) : null}
          <p className="mt-3 text-[0.58rem] text-muted">{QURAN_NOTE_REFERENCES_HINT}</p>
        </>
      ) : (
        <p className="text-xs text-muted animate-pulse motion-reduce:animate-none">Loading ayah…</p>
      )}
    </figure>
  );
}
