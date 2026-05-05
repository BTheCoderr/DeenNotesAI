import { cn } from "@/lib/utils";

import {
  type BrandSize,
  wordmarkAiSuffix,
  wordmarkText,
} from "./brand-classes";

export type DeenNotesWordmarkProps = {
  size?: BrandSize;
  className?: string;
  /** Include “AI” suffix */
  withSuffix?: boolean;
  primaryClassName?: string;
  suffixClassName?: string;
};

/**
 * Typographic row: DeenNotes (serif) + optional AI (sans). No taper — use
 * {@link DeenNotesLogo} for the editorial taper; use this in ShareCard / dense UI.
 */
export function DeenNotesWordmark({
  size = "md",
  className,
  withSuffix = true,
  primaryClassName = "text-accent",
  suffixClassName = "text-accent",
}: DeenNotesWordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display font-medium tracking-tight leading-none",
        wordmarkText[size],
        className,
      )}
    >
      <span className={cn(primaryClassName)}>DeenNotes</span>
      {withSuffix ? (
        <span
          className={cn(
            "ml-[0.2em] align-[0.15em] font-sans uppercase leading-none",
            wordmarkAiSuffix[size],
            suffixClassName,
          )}
        >
          AI
        </span>
      ) : null}
    </span>
  );
}
