import type { Transition, Variants } from "framer-motion";

/** Design-system timing — pair with Tailwind transition utilities where relevant. */
export const DS_DURATION = {
  xs: 0.12,
  sm: 0.22,
  md: 0.36,
  lg: 0.48,
  sheet: 0.42,
} as const;

export const DS_EASE = [0.22, 1, 0.36, 1] as const;

export function dsTransition(reducedMotion: boolean, dur: keyof typeof DS_DURATION): Transition {
  const d = DS_DURATION[dur];
  return {
    duration: reducedMotion ? 0 : d,
    ease: DS_EASE,
  };
}

export function fadeUpVariants(reducedMotion: boolean): Variants {
  const y = reducedMotion ? 0 : 14;
  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: dsTransition(reducedMotion, "md"),
    },
  };
}

export function staggerContainerVariants(reducedMotion: boolean): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.07,
        delayChildren: reducedMotion ? 0 : 0.04,
      },
    },
  };
}

export function listItemVariants(reducedMotion: boolean): Variants {
  const y = reducedMotion ? 0 : 10;
  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: dsTransition(reducedMotion, "sm"),
    },
  };
}
