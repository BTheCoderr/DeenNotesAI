"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type Props = {
  surah: number;
  ayah: number;
  className?: string;
  /** Drawer / sheet selection — skips navigation Link. */
  onActivate?: () => void;
};

/**
 * Quran reference chip — navigation by default; optional handler for overlays.
 */
export function VersePill({ surah, ayah, className, onActivate }: Props) {
  const rm = useReducedMotion();

  const styles = cn(
    "inline-flex rounded-full border border-accent/28 bg-white/85 px-4 py-2 text-xs font-bold tabular-nums text-accent shadow-elev-1 backdrop-blur-sm",
    "transition-all duration-ds hover:border-accent hover:bg-accent hover:text-white motion-safe:active:opacity-95",
    onActivate &&
      "cursor-pointer hover:border-accent hover:bg-accent hover:text-white",
    className,
  );

  if (onActivate) {
    return (
      <motion.button
        type="button"
        whileTap={rm ? undefined : { scale: 0.94 }}
        onClick={onActivate}
        className={styles}
      >
        {surah}:{ayah}
      </motion.button>
    );
  }

  return (
    <motion.div whileTap={rm ? undefined : { scale: 0.94 }}>
      <Link href={`/app/quran/${surah}/${ayah}`} className={styles}>
        {surah}:{ayah}
      </Link>
    </motion.div>
  );
}
