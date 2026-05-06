import type {
  QuranEncLanguageGroupDto,
  QuranEncTranslationListItemDto,
} from "./types";

function normalizeLangCode(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (!v || v === "unknown") return "und";
  return v.slice(0, 8);
}

/** Human-readable label for BCP‑47-ish language codes (ISO 639-1 / similar). */
export function languageIsoToLabel(
  languageIso: string,
  displayLocale: string,
): string {
  const iso = normalizeLangCode(languageIso);
  if (iso === "und") return "Other";
  const locales = [displayLocale?.trim() || "en", "en"];
  const tried = new Set<string>();
  for (const loc of locales) {
    if (tried.has(loc)) continue;
    tried.add(loc);
    try {
      const dn = new Intl.DisplayNames([loc], { type: "language" });
      const name = dn.of(iso);
      if (name) return name;
    } catch {
      /* locale unsupported */
    }
  }
  return iso.toUpperCase();
}

/**
 * Notion-like grouping — sort languages by localized name, translations by title.
 * Safe for client bundles (no server secrets).
 */
export function groupQuranEncTranslationsByLanguage(
  items: QuranEncTranslationListItemDto[],
  displayLocale: string = "en",
): QuranEncLanguageGroupDto[] {
  const map = new Map<string, QuranEncTranslationListItemDto[]>();
  for (const t of items) {
    const iso = normalizeLangCode(t.language_iso_code ?? "und");
    const list = map.get(iso) ?? [];
    list.push(t);
    map.set(iso, list);
  }

  const groups: QuranEncLanguageGroupDto[] = [];
  for (const [languageIso, translations] of map) {
    const sortedT = [...translations].sort((a, b) => {
      const ta = (a.title ?? a.key).toLowerCase();
      const tb = (b.title ?? b.key).toLowerCase();
      return ta.localeCompare(tb);
    });
    groups.push({
      languageIso,
      languageLabel: languageIsoToLabel(languageIso, displayLocale),
      translations: sortedT,
    });
  }

  return groups.sort((a, b) =>
    a.languageLabel.localeCompare(b.languageLabel, displayLocale, {
      sensitivity: "base",
    }),
  );
}
