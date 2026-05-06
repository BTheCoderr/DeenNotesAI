"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  staggerContainerVariants,
  listItemVariants,
} from "@/lib/ds-motion";
import { cn } from "@/lib/utils";

export { listItemVariants as animatedListItemVariants };

type Props = Omit<
  React.ComponentProps<typeof motion.ul>,
  "children" | "variants" | "initial" | "animate"
> & {
  children: React.ReactNode;
  /** Choreograph direct `motion.li` children with staggering. */
  stagger?: boolean;
};

/**
 * Opinionated stagger for vertical lists — pass `motion.li` children with variants support.
 */
export function AnimatedList({ children, className, stagger = true, ...rest }: Props) {
  const rm = useReducedMotion();
  const on = stagger && !rm;

  return (
    <motion.ul
      className={cn("list-none space-y-0", className)}
      initial={on ? "hidden" : false}
      animate={on ? "visible" : undefined}
      variants={on ? staggerContainerVariants(!!rm) : undefined}
      {...rest}
    >
      {children}
    </motion.ul>
  );
}
