/**
 * Lightweight “ayah anchor” rotation for dashboard retention — thematic cues only,
 * not translations. Users should read authoritative Arabic + tafsīr in-app.
 */
export type DailyAnchoredAyah = {
  surah: number;
  ayah: number;
  /** Soft reflection prompt — not Qur’anic wording. */
  cue: string;
};

const ANCHORS: DailyAnchoredAyah[] = [
  { surah: 94, ayah: 6, cue: "A chapter that names ease after constriction." },
  { surah: 2, ayah: 186, cue: "A reminder that longing for Allah’s response is sacred." },
  { surah: 55, ayah: 13, cue: "A rhythmic pause to count quiet blessings." },
  { surah: 39, ayah: 53, cue: "Mercy spoken wide — revisit when guilt feels heavier than hope." },
  { surah: 93, ayah: 4, cue: "The Prophet’s consolation — read without rushing." },
  { surah: 18, ayah: 105, cue: "A verse that resets intention before acts." },
  { surah: 14, ayah: 7, cue: "Gratitude named as widening — linger on the wording slowly." },
  { surah: 23, ayah: 118, cue: "A closing dua-shaped cadence worth memorising gently." },
  { surah: 27, ayah: 19, cue: "Humility echoed in creaturely praise." },
  { surah: 36, ayah: 58, cue: "Salām as destination — savour the serenity of the refrain." },
  { surah: 67, ayah: 2, cue: "Creation as layered mercy — skim with eyes, listen with ears." },
  { surah: 78, ayah: 35, cue: "A scene of respite — imagination held with adab." },
  { surah: 89, ayah: 28, cue: "The soul returned in peace — soften your breath here." },
  { surah: 103, ayah: 3, cue: "The shortest oath that still asks for steadfastness." },
  { surah: 113, ayah: 4, cue: "Seeking shelter from jealousy’s fray — nightly balm." },
  { surah: 114, ayah: 4, cue: "Whispered protection closing the Quran’s guard rails." },
  { surah: 2, ayah: 152, cue: "Remembrance braided with mutual nearness." },
  { surah: 3, ayah: 200, cue: "The patient framed as triumphant finishers." },
  { surah: 51, ayah: 56, cue: "Worship clarified as existential purpose—not performance." },
  { surah: 17, ayah: 11, cue: "A call to recount favours aloud with family." },
  { surah: 25, ayah: 63, cue: "The footsteps of adab through the night." },
  { surah: 11, ayah: 114, cue: "Prayer portions bookending the day's drift." },
  { surah: 13, ayah: 28, cue: "Hearts locating stillness inside remembrance." },
  { surah: 87, ayah: 14, cue: "Return to effort rewarded — uplift after slump." },
  { surah: 33, ayah: 35, cue: "A mosaic of vowed believers framed in symmetry." },
  { surah: 48, ayah: 1, cue: "Opening of an expansive victory — posture of relief." },
  { surah: 59, ayah: 19, cue: "Heedless forgetfulness mirrored as warning." },
  { surah: 65, ayah: 7, cue: "Burden measured to shoulder — tenderness in law metaphors." },
  { surah: 71, ayah: 28, cue: "A prophet’s farewell covering family and forgiven debts." },
  { surah: 91, ayah: 9, cue: "The soul purified by conscience — microscopic ethics." },
];

function dayOfYear(d = new Date()) {
  const y = new Date(d.getFullYear(), 0, 0).getTime();
  return Math.floor((d.getTime() - y) / 86400000);
}

export function getDailyAnchoredAyah(date = new Date()): DailyAnchoredAyah {
  const i = Math.abs(dayOfYear(date)) % ANCHORS.length;
  const base = ANCHORS[i];
  if (!base) return ANCHORS[0];
  return base;
}
