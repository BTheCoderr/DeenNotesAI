"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type Props = Omit<HTMLMotionProps<"button">, "children"> & {
  /** Accessible name for FAB (icon-only). */
  label: string;
  children?: React.ReactNode;
};

/**
 * Raised circular action matching iOS ergonomics — used by primary mobile nav FAB.
 */
export function FloatingActionButton({
  label,
  className,
  children,
  ...rest
}: Props) {
  const rm = useReducedMotion();

  return (
    <motion.button
      aria-label={label}
      whileTap={rm ? undefined : { scale: 0.9 }}
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-elev-fab",
        "ring-4 ring-background hover:bg-accent-hover transition-colors duration-ds",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
