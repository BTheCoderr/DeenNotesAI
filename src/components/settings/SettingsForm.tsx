"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Props = {
  email: string;
  displayName: string;
};

export function SettingsForm({ email, displayName }: Props) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }
    const { error: upError } = await supabase
      .from("profiles")
      .update({ display_name: name.trim() || null })
      .eq("id", user.id);
    if (upError) {
      setError(upError.message);
      setLoading(false);
      return;
    }
    setMessage("Saved.");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={saveProfile}
        className="rounded-2xl border border-black/5 bg-surface p-5 md:p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-xl border border-black/10 bg-background/60 px-3 py-2.5 text-muted cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">
            Display name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-black/10 bg-background px-3 py-2.5 text-ink outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-accent font-medium" role="status">
            {message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-accent text-white font-semibold px-6 py-2.5 hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
