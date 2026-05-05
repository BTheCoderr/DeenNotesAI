"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signError) {
      setError(signError.message);
      setLoading(false);
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-black/5 bg-surface p-6 shadow-card"
    >
      {searchParams.get("error") === "auth" ? (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
          Sign-in link expired or was invalid. Try again.
        </p>
      ) : null}
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
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-black/10 bg-background px-3 py-2.5 text-ink outline-none focus:ring-2 focus:ring-accent/30"
        />
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
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-muted text-center">
        No account?{" "}
        <Link href="/signup" className="text-accent font-medium hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
