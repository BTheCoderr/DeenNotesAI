"use client";

import { useState } from "react";

type Props = {
  supportEmail?: string;
};

/**
 * Feedback UI — wires to mailto until a submissions API exists.
 */
export function ContactForm({ supportEmail }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSend =
    Boolean(supportEmail) && message.trim().length >= 8 && email.includes("@");

  function openMailto() {
    if (!supportEmail) return;
    const subject = encodeURIComponent(
      `DeenNotes feedback${name.trim() ? ` — ${name.trim()}` : ""}`,
    );
    const body = encodeURIComponent(
      [
        message.trim(),
        "",
        "---",
        `Reply-to / contact: ${email.trim()}`,
        name.trim() ? `Name: ${name.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <div className="mt-8 space-y-6">
      {!supportEmail ? (
        <p className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          Configure <code className="text-xs">NEXT_PUBLIC_BETA_FEEDBACK_EMAIL</code>{" "}
          so visitors can reach you by email from this form.
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted">
            Name <span className="font-normal text-muted/70">(optional)</span>
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-background px-4 py-3 text-sm text-ink outline-none ring-accent/25 focus:ring-2"
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-background px-4 py-3 text-sm text-ink outline-none ring-accent/25 focus:ring-2"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted">
          Message
        </span>
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full resize-y rounded-xl border border-black/[0.08] bg-background px-4 py-3 text-sm text-ink outline-none ring-accent/25 focus:ring-2"
          placeholder="Feedback, partnerships, Quran API questions…"
        />
      </label>

      <button
        type="button"
        disabled={!canSend}
        onClick={() => openMailto()}
        className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-40 motion-safe:active:scale-[0.99]"
      >
        Send via email
      </button>

      {submitted ? (
        <p className="text-center text-sm text-accent font-semibold" role="status">
          Your email app should open — if nothing happens, copy your message and write us
          directly.
        </p>
      ) : null}
    </div>
  );
}
