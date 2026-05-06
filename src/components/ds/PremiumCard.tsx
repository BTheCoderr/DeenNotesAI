"use client";

import { motion, useReducedMotion } from "framer-motion";

import { dsTransition } from "@/lib/ds-motion";
import { cn } from "@/lib/utils";

const elevations = {
  none: "",
  sm: "shadow-sm border-black/[0.05]",
  md: "shadow-elev-2 border-black/[0.06]",
  lg: "shadow-elev-3 border-black/[0.07]",
};

type Props = {
  children: React.ReactNode;
  elevated?: keyof typeof elevations;
  interactive?: boolean;
  className?: string;
};

/**
 * Raised surface with DS elevation + optional tactile feedback.
 */
export function PremiumCard({
  children,
  elevated = "md",
  interactive = false,
  className,
}: Props) {
  const reduceMotion = useReducedMotion();

  const base = cn(
    "rounded-[1.35rem] border bg-surface/95 backdrop-blur-[2px]",
    elevations[elevated],
    interactive && "cursor-pointer select-none",
    className,
  );

  if (!interactive) {
    return <div className={base}>{children}</div>;
  }

  return (
    <motion.div
      className={base}
      whileHover={reduceMotion ? undefined : { y: -2, transition: dsTransition(false, "sm") }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={dsTransition(!!reduceMotion, "xs")}
    >
      {children}
    </motion.div>
  );
}
