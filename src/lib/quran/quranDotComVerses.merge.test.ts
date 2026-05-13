import { describe, expect, it } from "vitest";

import {
  indexUthmaniByVerseKey,
  zipChapterTranslationsOrdered,
} from "./quranDotComVerses.merge";

describe("indexUthmaniByVerseKey", () => {
  it("indexes by verse_key", () => {
    const m = indexUthmaniByVerseKey([
      { verse_key: "1:1", text_uthmani: "a" },
      { verse_key: "1:2", text_uthmani: "b" },
    ]);
    expect(m.get("1:1")?.text_uthmani).toBe("a");
    expect(m.get("2:3")).toBeUndefined();
  });
});

describe("zipChapterTranslationsOrdered", () => {
  it("maps verse numbers when lengths match", () => {
    const map = zipChapterTranslationsOrdered([1, 2, 3], [
      { text: "t1", resource_id: 85 },
      { text: "t2", resource_id: 85 },
      { text: "t3", resource_id: 85 },
    ]);
    expect(map.get(2)?.text).toBe("t2");
  });

  it("returns empty map on length mismatch", () => {
    const map = zipChapterTranslationsOrdered([1, 2], [{ text: "x" }]);
    expect(map.size).toBe(0);
  });
});
