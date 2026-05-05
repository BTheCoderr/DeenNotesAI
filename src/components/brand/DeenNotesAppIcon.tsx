import { cn } from "@/lib/utils";

import { type BrandSize, appIconBox, appIconInnerScale } from "./brand-classes";

export type DeenNotesAppIconProps = {
  size?: BrandSize;
  variant?: "light" | "dark";
  className?: string;
};

/**
 * Rounded DN monogram + tapered glow. Static gradient ids per variant (one icon per variant per view is typical).
 */
export function DeenNotesAppIcon({
  size = "md",
  variant = "light",
  className,
}: DeenNotesAppIconProps) {
  const bg = variant === "light" ? "#F6F4F0" : "#127A63";
  const fg = variant === "light" ? "#127A63" : "#F6F4F0";
  const gradId = variant === "light" ? "dnAppGlowLight" : "dnAppGlowDark";
  const glowMid = variant === "light" ? "0.45" : "0.32";
  const k = appIconInnerScale[size];

  return (
    <svg
      className={cn(appIconBox[size], "shrink-0", className)}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="64" height="64" rx="16" fill={bg} />
      <defs>
        <linearGradient
          id={gradId}
          x1="8"
          y1="0"
          x2="56"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={fg} stopOpacity="0" />
          <stop offset="0.5" stopColor={fg} stopOpacity={glowMid} />
          <stop offset="1" stopColor={fg} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={`translate(32 32) scale(${k}) translate(-32 -32)`}>
        <text
          x="32"
          y="40"
          textAnchor="middle"
          fill={fg}
          fontFamily="var(--font-fraunces), Georgia, 'Times New Roman', serif"
          fontSize="26"
          fontWeight="600"
        >
          DN
        </text>
        <ellipse cx="32" cy="48" rx="20" ry="2" fill={`url(#${gradId})`} />
      </g>
    </svg>
  );
}
