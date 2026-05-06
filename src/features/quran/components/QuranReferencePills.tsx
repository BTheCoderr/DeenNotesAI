"use client";

import { motion, useReducedMotion } from "framer-motion";

import { animatedListItemVariants, VersePill } from "@/components/ds";
import type { QuranRef } from "@/lib/quran/types";
import { cn } from "@/lib/utils";
import { staggerContainerVariants } from "@/lib/ds-motion";

type Props = {
  refs: QuranRef[];
  hint: string;
  onSelect: (ref: QuranRef) => void;
  className?: string;
  animated?: boolean;
};

export function QuranReferencePills({
  refs,
  hint,
  onSelect,
  className,
  animated = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const staggerOn = animated && !reduceMotion;

  if (!refs.length) return null;

  return (
    <section
      className={cn(
        "rounded-[1.35rem] border border-accent/18 bg-gradient-to-br from-mint/35 via-surface to-accent-soft/25 px-4 py-4 shadow-[0_8px_28px_rgba(18,122,99,0.08)]",
        className,
      )}
      aria-label="Quran references in this note"
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent">
        Qurʼan references
      </p>
      <p className="text-[0.65rem] text-muted mt-1.5 leading-snug">{hint}</p>
      <motion.ul
        className="mt-4 flex flex-wrap gap-2 list-none"
        initial={staggerOn ? "hidden" : false}
        animate={staggerOn ? "visible" : undefined}
        variants={staggerOn ? staggerContainerVariants(!!reduceMotion) : undefined}
      >
        {refs.map((r) => (
          <motion.li
            key={`${r.chapter}:${r.verse}`}
            variants={staggerOn ? animatedListItemVariants(!!reduceMotion) : undefined}
          >
            <VersePill
              surah={r.chapter}
              ayah={r.verse}
              onActivate={() => onSelect(r)}
            />
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
