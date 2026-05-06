"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  QuranSettingsPrinciple,
  QuranSettingsSubnav,
} from "@/features/quran/components/settings/QuranSettingsChrome";
import {
  readPreferredReciterResourceId,
  writePreferredReciterResourceId,
} from "@/lib/browser/quran-content-prefs";
import { splitQuranApiJson, quranFetchErrorForApp } from "@/lib/quran/api-contract";
import type { RecitationResourceDto } from "@/lib/quran/types";
import { cn } from "@/lib/utils";

export function QuranReciterSettingsScreen() {
  const [list, setList] = useState<RecitationResourceDto[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<string | undefined>(() => readPreferredReciterResourceId());

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/quran/recitations");
      const raw: unknown = await res.json();
      if (!res.ok) {
        setErr(quranFetchErrorForApp(raw));
        setList([]);
        return;
      }
      const { data } = splitQuranApiJson<{ recitations?: RecitationResourceDto[] }>(raw);
      setList(data.recitations ?? []);
    } catch {
      setErr("Network error loading reciters.");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSel(readPreferredReciterResourceId());
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-24">
      <div className="space-y-2">
        <Link href="/app/quran" className="text-xs font-bold text-accent hover:underline">
          ← Back to Quran
        </Link>
        <h2 className="font-display text-[1.65rem] font-semibold text-ink">Reciter</h2>
        <p className="text-sm text-muted leading-relaxed">
          Default recitation from Quran Foundation CDN when you press Listen. Change anytime before
          playing an ayah in the reader.
        </p>
      </div>
      <QuranSettingsSubnav active="/app/quran/settings/reciter" />
      <QuranSettingsPrinciple />
      {loading ? <p className="text-center text-sm text-muted py-8">Loading…</p> : null}
      {err ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm">{err}</p>
      ) : null}
      <ul className="space-y-2">
        {list.map((r) => {
          const idStr = typeof r.id === "number" ? String(r.id) : "";
          const picked = idStr && sel === idStr;
          return (
            <li key={r.id ?? `${r.reciterName}-${r.style}`}>
              <button
                type="button"
                disabled={!idStr}
                onClick={() => {
                  if (!idStr) return;
                  setSel(idStr);
                  writePreferredReciterResourceId(idStr);
                }}
                className={cn(
                  "w-full rounded-2xl border px-4 py-4 text-left transition",
                  picked
                    ? "border-emerald-900/35 bg-emerald-950/[0.05]"
                    : "border-black/[0.06] bg-white/90 hover:border-emerald-900/18",
                  !idStr && "opacity-60 cursor-not-allowed",
                )}
              >
                <p className="font-display text-[0.95rem] font-semibold text-ink">
                  {r.reciterName ?? "Recitation"}
                  {r.style ? (
                    <span className="text-muted font-normal"> · {r.style}</span>
                  ) : null}
                </p>
                {r.translatedName ? (
                  <p className="text-[0.8rem] text-muted mt-1">{r.translatedName}</p>
                ) : null}
                {idStr ? (
                  <p className="text-[0.65rem] text-muted mt-2 font-mono uppercase tracking-wide">
                    resource #{idStr}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
