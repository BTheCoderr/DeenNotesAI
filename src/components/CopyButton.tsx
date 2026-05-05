"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type CopyButtonProps = {
  text: string;
  className?: string;
};

export function CopyButton({ text, className }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  const label =
    state === "copied"
      ? "Copied"
      : state === "error"
        ? "Try again"
        : "Copy";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-black/10 bg-surface px-4 py-2 text-sm font-medium text-ink shadow-sm hover:border-accent/40 hover:text-accent transition-colors",
        className,
      )}
    >
      {label}
    </button>
  );
}
