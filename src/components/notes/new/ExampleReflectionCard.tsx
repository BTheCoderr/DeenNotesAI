import { DeenNotesSecondaryMark } from "@/components/brand/DeenNotesSecondaryMark";

export function ExampleReflectionCard() {
  return (
    <section
      aria-labelledby="today-reflection-title"
      className="rounded-2xl bg-[#F6F4F0] px-5 py-7 shadow-sm text-center space-y-6 border border-[#CFE8E0]/80"
    >
      <div className="flex justify-center">
        <DeenNotesSecondaryMark size="sm" className="text-[#127A63]" />
      </div>
      <h2
        id="today-reflection-title"
        className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-[#127A63]/85"
      >
        Today&apos;s Reflection
      </h2>

      <div className="space-y-6">
        <p className="font-display text-xl sm:text-[1.35rem] leading-snug font-medium text-ink text-balance">
          Patience is tied to tawakkul — keep doing your part without tying your
          whole heart only to the outcome you want today.
        </p>

        <div className="space-y-3 text-left max-w-sm mx-auto">
          <p className="text-center text-xs font-medium uppercase tracking-wide text-[#127A63]/80">
            This week
          </p>
          <ul className="space-y-3 text-[0.95rem] text-ink/90 leading-relaxed">
            <li className="flex gap-2 justify-start text-left">
              <span className="text-[#127A63] mt-0.5" aria-hidden>
                ·
              </span>
              Pause before reacting when stress hits — one breath, one dhikr.
            </li>
            <li className="flex gap-2 justify-start text-left">
              <span className="text-[#127A63] mt-0.5" aria-hidden>
                ·
              </span>
              Revisit &quot;after hardship comes ease&quot; once daily, briefly
              and sincerely.
            </li>
            <li className="flex gap-2 justify-start text-left">
              <span className="text-[#127A63] mt-0.5" aria-hidden>
                ·
              </span>
              Protect one small good deed — no new heroics.
            </li>
          </ul>
        </div>

        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium uppercase tracking-wide text-[#127A63]/80">
            Reflection question
          </p>
          <p className="text-[0.95rem] text-ink/85 leading-relaxed italic text-balance">
            Where have I been treating delay as rejection, when it might be
            redirection?
          </p>
        </div>

        <div className="space-y-2 border-t border-[#CFE8E0] pt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[#127A63]/80">
            Dua
          </p>
          <p className="text-[0.95rem] text-[#127A63] font-medium leading-relaxed">
            Rabbana afrigh &apos;alayna sabran wa thabbit aqdamana…
          </p>
          <p className="text-xs text-muted leading-relaxed">
            Patience and steadfastness — use what you know or your own words.
          </p>
        </div>
      </div>
    </section>
  );
}
