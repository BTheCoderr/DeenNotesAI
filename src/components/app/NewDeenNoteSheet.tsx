"use client";

import Link from "next/link";
import { useEffect } from "react";

import { NEW_DEEN_NOTE_MENU_ITEMS } from "@/lib/new-deen-note-menu";
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
          "relative z-10 w-full max-w-lg md:max-w-md rounded-t-[1.75rem] md:rounded-3xl",
          "border border-black/8 bg-surface shadow-card max-h-[85dvh] flex flex-col",
        )}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-black/10 md:hidden" />
        <div className="px-5 pt-4 pb-3 border-b border-black/5">
          <h2
            id="new-deennote-title"
            className="font-display text-xl font-semibold text-ink text-center md:text-left"
          >
            New DeenNote
          </h2>
        </div>
        <ul className="overflow-y-auto px-3 py-3 space-y-2 pb-safe">
          {NEW_DEEN_NOTE_MENU_ITEMS.map((item) => (
            <li key={item.type}>
              <Link
                href={`/app/new?type=${item.type}`}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "block rounded-2xl border border-black/[0.06] bg-background px-4 py-3.5",
                  "transition hover:border-accent/25 hover:bg-mint/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                )}
              >
                <p className="font-display text-base font-semibold text-ink">
                  {item.title}
                </p>
                <p className="text-sm text-muted mt-1 leading-relaxed">
                  {item.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
        <div className="px-5 pb-5 pt-0">
          <p className="text-xs text-center text-muted leading-relaxed">
            Audio, YouTube, upload, and scan are coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
