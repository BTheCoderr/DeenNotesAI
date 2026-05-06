"use client";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

import { GlassPanel } from "./GlassPanel";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Calm drifting glow — disabled when prefers-reduced-motion. */
  glow?: boolean;
};

/**
 * Immersive hero shell — Quran.com×Headspace softness without ornate kitsch.
 */
export function GradientHero({ children, className, glow = true }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <GlassPanel
      className={cn(
        "relative overflow-hidden border-accent/16 p-6 shadow-elev-2 sm:p-7",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-hero-mesh opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(18,122,99,0.12),transparent_55%)]"
        aria-hidden
      />
      {glow && !reduceMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-[-20%] h-44 w-44 rounded-full bg-accent/14 blur-[80px]"
          animate={{
            opacity: [0.35, 0.55, 0.42],
            scale: [0.94, 1.05, 0.98],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <div className="relative z-10">{children}</div>
    </GlassPanel>
  );
}
