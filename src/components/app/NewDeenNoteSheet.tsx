"use client";

import Link from "next/link";
import { useEffect } from "react";

import { NEW_DEEN_NOTE_MENU_ROWS } from "@/lib/new-deen-note-menu";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewDeenNoteSheet({ open, onOpenChange }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:items-center md:justify-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-deennote-title"
    >
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg md:max-w-md rounded-t-[2.25rem] md:rounded-[1.85rem]",
          "border border-black/8 bg-[#FEFDFB] shadow-[0_-8px_40px_rgba(40,36,30,0.12)] max-h-[88dvh] flex flex-col",
        )}
      >
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-black/10 md:hidden" />
        <div className="px-5 pt-5 pb-4 space-y-2">
          <h2
            id="new-deennote-title"
            className="font-display text-[1.35rem] font-semibold text-[#2C2419] text-center tracking-tight"
          >
            New DeenNote
          </h2>
          <p className="text-[0.75rem] text-muted text-center px-5 leading-relaxed">
            Quran-centered journaling — khutbah, halaqa, Qur’an reflection, dua nudges, and Ramadan
            prep rhythms.
          </p>
        </div>
        <ul className="overflow-y-auto px-3 pb-8 space-y-2.5 pb-safe max-h-[70dvh]">
          {NEW_DEEN_NOTE_MENU_ROWS.map((item) => (
            <li key={item.mode}>
              <Link
                href={`/app/new?mode=${item.mode}`}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white/90 px-4 py-3.5 shadow-sm",
                  "transition hover:border-emerald-900/20 hover:bg-[#F9F6F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800",
                )}
              >
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display text-[0.98rem] font-semibold text-[#2C2419]">
                      {item.title}
                    </p>
                    {item.comingSoon ? (
                      <span className="text-[0.6rem] uppercase font-bold tracking-wide text-amber-900/90 bg-amber-100 px-2 py-0.5 rounded-full">
                        Soon
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[0.8rem] text-muted mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="text-muted text-lg font-semibold pr-1 tabular-nums"
                >
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="pb-4 pt-0 flex justify-center md:pb-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 w-11 rounded-full border border-black/10 bg-white text-muted flex items-center justify-center text-lg shadow-sm hover:bg-background"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
