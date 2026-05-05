import { cn } from "@/lib/utils";

import { type BrandSize, logoTaperMax } from "./brand-classes";
import { DeenNotesWordmark } from "./DeenNotesWordmark";

function BrandTaper({ size, className }: { size: BrandSize; className?: string }) {
  return (
    <div
      className={cn("relative mx-auto h-3 w-full shrink-0", logoTaperMax[size], className)}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full",
          "bg-[radial-gradient(ellipse_at_center,rgba(18,122,99,0.42)_0%,rgba(18,122,99,0.18)_45%,transparent_72%)]",
          "blur-[0.6px]",
        )}
      />
    </div>
  );
}

export type DeenNotesLogoProps = {
  size?: BrandSize;
  className?: string;
  wordmarkClassName?: string;
  showGlow?: boolean;
  primaryClassName?: string;
  suffixClassName?: string;
};

/**
 * Primary brand: DeenNotes AI + soft tapered line (calm glow).
 */
export function DeenNotesLogo({
  size = "md",
  className,
  wordmarkClassName,
  showGlow = true,
  primaryClassName,
  suffixClassName,
}: DeenNotesLogoProps) {
  return (
    <span
      className={cn("inline-flex w-fit flex-col items-center gap-1.5", className)}
    >
      <DeenNotesWordmark
        size={size}
        className={wordmarkClassName}
        primaryClassName={primaryClassName}
        suffixClassName={suffixClassName}
      />
      {showGlow ? <BrandTaper size={size} className="w-full" /> : null}
    </span>
  );
}
