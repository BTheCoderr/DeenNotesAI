export type BrandSize = "sm" | "md" | "lg";

/** Primary wordmark “DeenNotes” + optional AI */
export const wordmarkText: Record<BrandSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl md:text-2xl",
};

/** “AI” suffix scales with lockup size */
export const wordmarkAiSuffix: Record<BrandSize, string> = {
  sm: "text-[0.52em] font-normal tracking-[0.2em]",
  md: "text-[0.58em] font-light tracking-[0.16em]",
  lg: "text-[0.68em] font-light tracking-[0.13em]",
};

/** Compact lockup (no “AI”) */
export const compactWordmarkText: Record<BrandSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export const appIconBox: Record<BrandSize, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
};

/** Scale monogram + glow inside 64×64 viewBox */
export const appIconInnerScale: Record<BrandSize, number> = {
  sm: 0.82,
  md: 0.92,
  lg: 1,
};

export const secondaryMarkBox: Record<BrandSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

/** Max width for tapered line under primary lockup */
export const logoTaperMax: Record<BrandSize, string> = {
  sm: "max-w-[9.75rem]",
  md: "max-w-[12rem]",
  lg: "max-w-[15rem]",
};
