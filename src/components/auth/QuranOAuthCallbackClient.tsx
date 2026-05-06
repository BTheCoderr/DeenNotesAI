"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Phase = "connecting" | "ready";

type Props = {
  ok: boolean;
  errorLabel?: string;
};

/** Minimum “connecting” beat so redirects feel deliberate (OAuth review / slow networks). */
const CONNECT_MS = 900;

/**
 * Quran Foundation OAuth callback placeholder — graceful loading, then success/error copy.
 */
export function QuranOAuthCallbackClient({ ok, errorLabel }: Props) {
  const [phase, setPhase] = useState<Phase>("connecting");

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("ready"), CONNECT_MS);
    return () => window.clearTimeout(t);
  }, []);

  const title =
    phase === "connecting"
      ? "Connecting your Quran account…"
      : ok
        ? "Connected"
        : "Something went wrong";

  const detail =
    phase === "connecting"
      ? "Securely completing the Quran Foundation authorization handshake. Please keep this tab open briefly."
      : ok
        ? "Authorization succeeded. Finish setup in DeenNotes (token exchange runs on your server when you enable it). You can return to the app."
        : errorLabel
          ? `We could not complete sign-in (${errorLabel}). Close this tab and try again from DeenNotes.`
          : "No authorization code was returned. If you did not start this from DeenNotes, you can close this tab.";

  return (
    <div className="w-full max-w-md rounded-3xl border border-black/[0.06] bg-surface p-8 shadow-card space-y-5 text-center">
      <div className="flex justify-center" aria-hidden>
        {phase === "connecting" ? (
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent/25 border-t-accent animate-spin motion-reduce:animate-none motion-reduce:border-accent" />
        ) : ok ? (
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-mint text-2xl font-bold text-accent ring-4 ring-accent/15">
            ✓
          </span>
        ) : (
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl font-bold text-red-700 ring-4 ring-red-100">
            !
          </span>
        )}
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-xl font-semibold text-ink sm:text-2xl">
          {title}
        </h1>
        <p className="text-sm text-muted leading-relaxed">{detail}</p>
      </div>

      {phase === "ready" ? (
        <div className="flex flex-col gap-2 pt-2">
          <Link
            href="/app"
            className="inline-flex justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Go to Today
          </Link>
          <Link
            href="/"
            className="inline-flex justify-center text-sm font-semibold text-accent hover:underline"
          >
            Home
          </Link>
        </div>
      ) : (
        <p className="text-[0.65rem] uppercase tracking-[0.14em] text-muted pt-2">
          OAuth redirect · Production callback URL
        </p>
      )}
    </div>
  );
}
