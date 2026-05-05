import { cn } from "@/lib/utils";

import { type BrandSize, secondaryMarkBox } from "./brand-classes";

export type DeenNotesSecondaryMarkProps = {
  size?: BrandSize;
  className?: string;
};

const MINT = "#CFE8E0";

/**
 * Secondary mark: note with dog-ear, lines, sprig; sparkle in mint. Never primary chrome.
 */
export function DeenNotesSecondaryMark({
  size = "md",
  className,
}: DeenNotesSecondaryMarkProps) {
  return (
    <svg
      className={cn(secondaryMarkBox[size], "shrink-0 text-accent", className)}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Page fill (soft) */}
      <path
        fill="currentColor"
        fillOpacity="0.1"
        d="M12 10h14.5L28 11.5l6 6V37a2.5 2.5 0 0 1-2.5 2.5H12A2.5 2.5 0 0 1 9.5 37V12.5A2.5 2.5 0 0 1 12 10Z"
      />
      {/* Outline: body + dog-ear fold */}
      <path
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        d="M26.5 10H12a2.5 2.5 0 0 0-2.5 2.5V37A2.5 2.5 0 0 0 12 39.5h19.5A2.5 2.5 0 0 0 34 37V17.5L26.5 10Z"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        d="M26.5 10v6.5a1.5 1.5 0 0 0 1.5 1.5H34"
      />
      {/* Lines */}
      <line
        x1="15"
        y1="22.5"
        x2="29.5"
        y2="22.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="27"
        x2="27"
        y2="27"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <line
        x1="15"
        y1="31.5"
        x2="30"
        y2="31.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      {/* Sprig */}
      <path
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m11.5 39.5 2.2-4.4c.4-.8 1-1.3 1.8-1.5M13 36.2c.9-.5 1.7-.7 2.6-.6m2 2.2c.2-.9 0-1.8-.6-2.5"
      />
      {/* Sparkle — mint */}
      <path
        fill={MINT}
        d="M34.8 10.9a.55.55 0 0 1 .55.55v.75h.75a.55.55 0 0 1 0 1.1h-.75v.75a.55.55 0 0 1-1.1 0v-.75h-.75a.55.55 0 0 1 0-1.1h.75v-.75a.55.55 0 0 1 .55-.55Z"
      />
    </svg>
  );
}
