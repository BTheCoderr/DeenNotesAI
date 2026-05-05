"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type Props = {
  noteId: string;
  shareCardText: string;
  className?: string;
};

export function SaveShareCardButton({ noteId, shareCardText, className }: Props) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function save() {
    setState("saving");
    try {
      const res = await fetch("/api/saved-share-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId, shareCardText }),
      });
      if (!res.ok) {
        setState("error");
        return;
      }
      setState("saved");
    } catch {
      setState("error");
    }
  }

  const label =
    state === "saving"
      ? "Saving…"
      : state === "saved"
        ? "Saved"
        : state === "error"
          ? "Retry save"
          : "Save card";

  return (
    <button
      type="button"
      onClick={save}
      disabled={state === "saving" || state === "saved"}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-accent/30 bg-surface px-4 py-2 text-sm font-semibold text-accent hover:bg-accent-soft transition-colors disabled:opacity-60",
        className,
      )}
    >
      {label}
    </button>
  );
}
