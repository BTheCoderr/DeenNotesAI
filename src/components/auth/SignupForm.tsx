"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (signError) {
      if (process.env.NODE_ENV === "development") {
        const e = signError as Error & { status?: number };
        console.log("[deennotes signup]", {
          name: e.name,
          message: e.message,
          status: typeof e.status === "number" ? e.status : undefined,
        });
      }
      setError(signError.message);
      setLoading(false);
      return;
    }
    router.replace("/app");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-black/5 bg-surface p-6 shadow-card"
    >
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Name (optional)
        </label>
        <input
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-background px-3 py-2.5 text-ink outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Email
        </label>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-background px-3 py-2.5 text-ink outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Password
        </label>
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-background px-3 py-2.5 text-ink outline-none focus:ring-2 focus:ring-accent/30"
        />
        <p className="mt-1 text-xs text-muted">At least 8 characters.</p>
      </div>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-accent text-white font-semibold py-3 hover:bg-accent-hover disabled:opacity-60 transition-colors"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-sm text-muted text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
