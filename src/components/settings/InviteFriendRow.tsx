"use client";

import { useState } from "react";

/** Share or copy app link; never a dead control. */

export function InviteFriendRow() {
  const label = "Invite a friend";
  const [hint, setHint] = useState<string | null>(null);

  async function onInvite() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/app`
        : "https://deennotesai.netlify.app/app";

    const sharePayload = {
      title: "DeenNotes",
      text: "Organize khutbah and lecture reflections (not rulings)—try DeenNotes.",
      url,
    };
    setHint(null);

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
        return;
      }
    } catch {
      /* dismissed */
    }

    try {
      await navigator.clipboard.writeText(`${sharePayload.text}\n${url}`);
      setHint("Invite link copied.");
    } catch {
      setHint(`Paste this invite link: ${url}`);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void onInvite()}
        className="flex w-full items-center justify-between gap-4 rounded-2xl border border-black/[0.06] bg-surface px-4 py-3.5 text-left shadow-sm transition hover:border-accent/25"
      >
        <span className="font-semibold text-ink">{label}</span>
        <span className="text-accent text-xs font-semibold shrink-0">Share link</span>
      </button>
      {hint ? (
        <p className="text-xs text-muted leading-relaxed px-1">{hint}</p>
      ) : null}
    </div>
  );
}
