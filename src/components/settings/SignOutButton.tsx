"use client";

import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-red-700/18 bg-red-50/55 px-4 py-3.5 text-left transition hover:bg-red-50"
    >
      <span className="font-semibold text-red-900">Sign out</span>
      <span className="text-sm text-red-800/85">Leaves this device only</span>
    </button>
  );
}
