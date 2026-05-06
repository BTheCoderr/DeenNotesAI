"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { useEffect } from "react";

import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Full panel chrome (drag handle + header + scroll body). */
  children: React.ReactNode;
  panelClassName?: string;
  zClass?: string;
};

const panelEase: Transition = {
  duration: 0.36,
  ease: [0.22, 1, 0.36, 1],
};

function useDismissOnEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
}

/**
 * Backdrop + springy ascending panel — use for Quran pickers & lightweight sheets.
 */
export function BottomSheet({
  open,
  onClose,
  children,
  panelClassName,
  zClass = "z-[55]",
}: Props) {
  const rm = useReducedMotion();
  useDismissOnEscape(open, onClose);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="ds-bottom-sheet"
          className={cn(
            "fixed inset-0 md:flex md:items-end md:justify-center",
            zClass,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: rm ? 0 : 0.2 }}
        >
          <motion.button
            type="button"
            aria-label="Close sheet"
            className="absolute inset-0 z-0 bg-ink/45 backdrop-blur-[2px] motion-reduce:backdrop-blur-none"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 flex max-h-[76dvh] w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-black/10 bg-surface shadow-[0_-14px_42px_rgba(28,27,24,0.14)] md:relative md:inset-auto md:max-h-[min(480px,72dvh)] md:w-full md:max-w-lg md:rounded-3xl",
              panelClassName,
            )}
            initial={rm ? false : { y: 48, opacity: 0.94 }}
            animate={{ y: 0, opacity: 1 }}
            exit={rm ? { opacity: 0 } : { y: 42, opacity: 0 }}
            transition={rm ? { duration: 0 } : panelEase}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
