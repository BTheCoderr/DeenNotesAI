import { cn } from "@/lib/utils";

import { type BrandSize } from "./brand-classes";

const scale: Record<BrandSize, string> = {
  sm: "text-[0.6rem] tracking-[0.22em]",
  md: "text-[0.65rem] sm:text-xs tracking-[0.24em]",
  lg: "text-xs sm:text-sm tracking-[0.26em]",
};

export type DeenNotesTaglineProps = {
  size?: BrandSize;
  className?: string;
  variant?: "default" | "subtle";
};

/**
 * REFLECT. REMEMBER. GROW. — landing and marketing hero only (not auth / global chrome).
 */
export function DeenNotesTagline({
  size = "md",
  className,
  variant = "default",
}: DeenNotesTaglineProps) {
  return (
    <p
      className={cn(
        "font-sans font-medium uppercase leading-relaxed text-stoneMuted",
        scale[size],
        variant === "subtle" ? "opacity-90" : undefined,
        className,
      )}
    >
      Reflect. Remember. Grow.
    </p>
  );
}
