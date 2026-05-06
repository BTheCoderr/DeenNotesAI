import "server-only";

import { logQuranSdkError, withQuranSdk } from "./client";
import { isMockQuranMode } from "./config";
import {
  mockTafsirResources,
  mockTranslationResources,
} from "./mock/mock-data";
import type { TafsirResourceDto, TranslationResourceDto } from "./types";

/** Translation resource catalogue (Content API). */
export async function fetchTranslationResources(): Promise<
  TranslationResourceDto[]
> {
  if (isMockQuranMode()) return mockTranslationResources();
  try {
    const list = await withQuranSdk((c) =>
      c.content.v4.resources.translations.list({}),
    );
    return list.map((t) => ({
      id: t.id,
      name: t.name,
      authorName: t.authorName,
      languageName: t.languageName,
      slug: t.slug,
    }));
  } catch (e) {
    logQuranSdkError("fetchTranslationResources", e);
    throw e;
  }
}

/** Tafsir resource catalogue (Content API). */
export async function fetchTafsirResources(): Promise<TafsirResourceDto[]> {
  if (isMockQuranMode()) return mockTafsirResources();
  try {
    const list = await withQuranSdk((c) =>
      c.content.v4.resources.tafsirs.list({}),
    );
    return list.map((t) => ({
      id: t.id,
      name: t.name,
      authorName: t.authorName,
      languageName: t.languageName,
    }));
  } catch (e) {
    logQuranSdkError("fetchTafsirResources", e);
    throw e;
  }
}
