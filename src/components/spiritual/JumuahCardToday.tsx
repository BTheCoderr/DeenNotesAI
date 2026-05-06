"use client";

/** Simple Friday grounding — complements prayer strip when Jumu’ah toggles are on. */

export function JumuahCardToday() {
  if (new Date().getDay() !== 5) return null;

  return (
    <section className="rounded-2xl border border-[#6B563F]/20 bg-[#F7F3EC] px-4 py-4">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#5C4A32]/85">
        Jumu’ah today
      </p>
      <p className="font-display text-base font-semibold text-ink mt-1 leading-relaxed">
        A weekly pause · seek barakah around Khutbah and salaah in your locality.
      </p>
      <p className="text-xs text-muted mt-2 leading-relaxed">
        Use your Prayer hub for midday timing — congregations vary.
      </p>
    </section>
  );
}
