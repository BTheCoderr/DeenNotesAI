import { cn } from "@/lib/utils";

import { type BrandSize, compactWordmarkText } from "./brand-classes";

export type DeenNotesCompactLogoProps = {
  size?: BrandSize;
  className?: string;
  primaryClassName?: string;
};

/**
 * Tight top bars: “DeenNotes” only (no “AI” suffix).
 */
export function DeenNotesCompactLogo({
  size = "md",
  className,
  primaryClassName = "text-accent",
}: DeenNotesCompactLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-display font-medium tracking-tight leading-none",
        compactWordmarkText[size],
        className,
      )}
    >
      <span className={cn(primaryClassName)}>DeenNotes</span>
    </span>
  );
}
