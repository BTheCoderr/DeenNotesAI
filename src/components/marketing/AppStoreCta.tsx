import type { ComponentPropsWithoutRef } from "react";

import { APP_STORE_URL } from "@/lib/app-download";
import { cn } from "@/lib/utils";

/** High-contrast, touch-friendly outbound link styled like Apple’s App Store cue. */

type Variant = "primary" | "secondary";

export function AppStoreCta(props: Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  variant?: Variant;
  subtitle?: boolean;
}) {
  const {
    variant = "primary",
    subtitle = true,
    className,
    children,
    ...rest
  } = props;

  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      {...rest}
      className={cn(
        variant === "primary"
          ? "inline-flex flex-col justify-center rounded-2xl bg-[#121212] px-6 py-3.5 sm:py-4 text-left text-white shadow-lg shadow-black/20 transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          : "inline-flex flex-col justify-center rounded-2xl border border-black/[0.12] bg-surface px-6 py-3.5 sm:py-4 text-left text-ink shadow-card transition-colors hover:border-accent/25 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        "min-h-[3.25rem] w-full min-w-0 justify-center items-center gap-1 sm:flex-initial sm:w-auto sm:justify-center md:gap-2",
        className,
      )}
    >
      {children ?? (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "text-[0.7rem] font-semibold uppercase tracking-[0.18em]",
              variant === "primary" ? "text-white/70" : "text-muted",
            )}
          >
            Install
          </span>
          <span
            className={cn(
              "text-base font-semibold leading-tight",
              variant === "primary" ? "text-white" : "text-ink",
            )}
          >
            Download on the App Store
          </span>
          {subtitle ? (
            <span
              className={cn(
                "hidden text-[0.7rem] font-medium sm:block max-w-[16rem]",
                variant === "primary"
                  ? "text-white/60"
                  : "text-muted",
              )}
            >
              Reflect and save reminders from iPhone — links open securely in a new tab.
            </span>
          ) : null}
        </>
      )}
    </a>
  );
}
