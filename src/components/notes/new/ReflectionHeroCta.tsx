"use client";

const SCROLL_FOCUS_DELAY_MS = 380;

export function ReflectionHeroCta() {
  function handleContinue() {
    const target = document.getElementById("new-reflection");
    const input = document.getElementById(
      "reflection-input",
    ) as HTMLTextAreaElement | null;

    target?.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(() => {
      input?.focus({ preventScroll: true });
    }, SCROLL_FOCUS_DELAY_MS);
  }

  return (
    <button
      type="button"
      onClick={handleContinue}
      aria-controls="reflection-input"
      aria-label="Scroll to reflection form and move cursor to your notes"
      className="w-full rounded-xl bg-accent px-5 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      Create reflection
    </button>
  );
}
