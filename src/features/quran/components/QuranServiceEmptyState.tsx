"use client";

import Link from "next/link";

import type { QuranPublicApiMeta } from "@/lib/quran/api-contract";
import { offlineReflectionSubtitle } from "@/lib/quran/api-contract";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description: string;
  serviceMeta?: QuranPublicApiMeta | null;
  errorCode?: string | null;
  retryable?: boolean;
  onReconnect?: () => void;
  className?: string;
};

export function QuranServiceEmptyState({
  title = "Qur’an reader is resting",
  description,
  serviceMeta,
  errorCode,
  retryable,
  onReconnect,
  className,
}: Props) {
  const offlineLine = offlineReflectionSubtitle(serviceMeta ?? null);

  return (
    <div
      role="status"
      className={cn(
        "relative overflow-hidden rounded-[1.5rem] border border-black/[0.07] bg-gradient-to-br from-mint/40 via-surface to-accent-soft/30 px-5 py-7 shadow-card",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-accent/14 blur-2xl motion-reduce:opacity-50"
        aria-hidden
      />
      <div className="relative space-y-4">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-accent">
            Calm reconnect
          </p>
          <h2 className="font-display text-lg sm:text-xl font-semibold text-ink mt-2 leading-snug tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted leading-relaxed mt-2 max-w-prose">
            {description}
          </p>
          {offlineLine ? (
            <p className="text-xs text-ink/80 leading-relaxed mt-3 max-w-prose border-l-2 border-accent/35 pl-3">
              {offlineLine}
            </p>
          ) : null}
          {errorCode ? (
            <p className="text-[0.65rem] font-mono uppercase tracking-wide text-muted/90 mt-2">
              {errorCode.replace(/_/g, " · ")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2.5 pt-1">
          {retryable && onReconnect ? (
            <button
              type="button"
              onClick={onReconnect}
              className="rounded-full bg-accent px-5 py-2 text-xs font-bold text-white shadow-inner hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Reconnect & retry
            </button>
          ) : null}
          <Link
            href="/app/new"
            className={cn(
              "rounded-full border border-black/[0.1] bg-surface px-5 py-2 text-xs font-bold text-accent",
              "hover:border-accent/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
            )}
          >
            Offline reflection
          </Link>
          <Link
            href="/app/quran/search"
            className="rounded-full border border-transparent px-3 py-2 text-xs font-semibold text-muted hover:text-accent"
          >
            Browse saved searches
          </Link>
        </div>
      </div>
    </div>
  );
}
