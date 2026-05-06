import { useMemo } from "react";

/** Normalise JSON/array columns into display lines. */
export function useStringLines(value: unknown): string[] {
  return useMemo(() => {
    if (value == null) return [];
    if (typeof value === "string" && value.trim()) return [value.trim()];
    if (!Array.isArray(value)) return [];
    const out: string[] = [];
    for (const x of value) {
      if (typeof x === "string" && x.trim()) out.push(x.trim());
    }
    return out;
  }, [value]);
}

export function formatQuranRefs(refs: unknown): string[] {
  if (!Array.isArray(refs) || refs.length === 0) return [];
  const lines: string[] = [];
  for (const r of refs) {
    if (!r || typeof r !== "object") continue;
    const o = r as Record<string, unknown>;
    const ch = typeof o.chapter === "number" ? o.chapter : typeof o.surah === "number" ? o.surah : null;
    const vs = typeof o.verse === "number" ? o.verse : typeof o.ayah === "number" ? o.ayah : null;
    if (ch != null && vs != null) lines.push(`${ch}:${vs}`);
    else lines.push(JSON.stringify(r));
  }
  return lines;
}
