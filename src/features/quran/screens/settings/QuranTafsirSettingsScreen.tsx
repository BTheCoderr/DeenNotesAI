"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  QuranSettingsPrinciple,
  QuranSettingsSubnav,
} from "@/features/quran/components/settings/QuranSettingsChrome";
import {
  readPreferredTafsirResourceId,
  writePreferredTafsirResourceId,
} from "@/lib/browser/quran-content-prefs";
import { splitQuranApiJson, quranFetchErrorForApp } from "@/lib/quran/api-contract";
import type { TafsirResourceDto } from "@/lib/quran/types";
import { cn } from "@/lib/utils";

export function QuranTafsirSettingsScreen() {
  const [list, setList] = useState<TafsirResourceDto[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<number | undefined>(() => readPreferredTafsirResourceId());

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/quran/tafsirs");
      const raw: unknown = await res.json();
      if (!res.ok) {
        setErr(quranFetchErrorForApp(raw));
        setList([]);
        return;
      }
      const { data } = splitQuranApiJson<{ tafsirs?: TafsirResourceDto[] }>(raw);
      setList(data.tafsirs ?? []);
    } catch {
      setErr("Network error loading tafsir resources.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSel(readPreferredTafsirResourceId());
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24">
      <div className="space-y-2">
        <Link href="/app/quran" className="text-xs font-bold text-accent hover:underline">
          ← Back to Quran
        </Link>
        <h2 className="font-display text-[1.65rem] font-semibold text-ink">Tafsir source</h2>
        <p className="text-sm text-muted leading-relaxed">
          Choose which tafsir resource the reader prefers when available from our Quran Foundation
          connection. Reflection only — not a fatwa substitute.
        </p>
      </div>
      <QuranSettingsSubnav active="/app/quran/settings/tafsir" />
      <QuranSettingsPrinciple />
      {loading ? <p className="text-center text-sm text-muted py-8">Loading…</p> : null}
      {err ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm">{err}</p>
      ) : null}
      <ul className="space-y-2">
        {list.map((t) => {
          const id = t.id;
          const picked = typeof id === "number" && sel === id;
          return (
            <li key={id ?? `${t.name}-${t.authorName}`}>
              <button
                type="button"
                disabled={typeof id !== "number"}
                onClick={() => {
                  if (typeof id !== "number") return;
                  setSel(id);
                  writePreferredTafsirResourceId(id);
                }}
                className={cn(
                  "w-full rounded-2xl border px-4 py-4 text-left transition",
                  picked
                    ? "border-emerald-900/35 bg-emerald-950/[0.05]"
                    : "border-black/[0.06] bg-white/90 hover:border-emerald-900/18",
                  typeof id !== "number" && "opacity-60 cursor-not-allowed",
                )}
              >
                <p className="font-display text-[0.95rem] font-semibold text-ink">{t.name}</p>
                <p className="text-[0.8rem] text-muted mt-1">
                  {[t.authorName, t.languageName].filter(Boolean).join(" · ")}
                  {typeof id === "number" ? ` · id ${id}` : ""}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
