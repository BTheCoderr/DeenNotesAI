"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice?: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Chromium may fire `beforeinstallprompt`; iOS relies on Share → Add to Home Screen — gentle copy either way.
 */

export function PwaInstallPrompt() {
  const [event, setEvent] = useState<InstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return typeof window !== "undefined" &&
        sessionStorage.getItem("deennotes.pwa.install.dismissed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        // iOS standalone PWA
        Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone));

    if (standalone || dismissed) return;

    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIos = /iphone|ipad|ipod/i.test(ua);

    const onBip = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallPromptEvent);
      setIosHint(false);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    if (isIos) setIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, [dismissed]);

  if (dismissed) return null;
  if (!event && !iosHint) return null;

  async function promptInstall() {
    if (!event) return;
    try {
      await event.prompt?.();
      await event.userChoice;
    } catch {
      /* noop */
    }
    setEvent(null);
    try {
      sessionStorage.setItem("deennotes.pwa.install.dismissed", "1");
    } catch {
      /* noop */
    }
    setDismissed(true);
  }

  function dismiss() {
    try {
      sessionStorage.setItem("deennotes.pwa.install.dismissed", "1");
    } catch {
      /* noop */
    }
    setDismissed(true);
  }

  return (
    <aside className="mb-6 rounded-[1.35rem] border border-accent/22 bg-accent-soft/30 px-5 py-4 text-sm text-ink">
      <p className="font-display font-semibold text-emerald-950">Keep DeenNotes close</p>
      {event ? (
        <p className="text-muted mt-2 leading-relaxed">
          Add this quiet companion to your home screen — familiar routes wherever the browser allows.
        </p>
      ) : (
        <p className="text-muted mt-2 leading-relaxed">
          On iPhone or iPad use{" "}
          <span className="font-semibold text-emerald-900">Share → Add to Home Screen</span> for a softer
          full-screen frame.
        </p>
      )}
      <div className="flex flex-wrap gap-2 mt-4">
        {event ? (
          <button
            type="button"
            onClick={() => void promptInstall()}
            className="rounded-full bg-emerald-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-900"
          >
            Install or add shortcut
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-full border border-black/15 px-4 py-2.5 text-xs font-semibold text-muted hover:text-ink"
        >
          Maybe later
        </button>
      </div>
    </aside>
  );
}
