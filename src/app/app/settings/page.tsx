import { redirect } from "next/navigation";

import { SettingsForm } from "@/components/settings/SettingsForm";
import { APP_DISCLAIMER } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Settings</h1>
      <p className="text-muted mt-2 leading-relaxed">
        Manage your profile and account. DeenNotes is a learning journal—not a
        substitute for scholars or imams.
      </p>

      <div className="mt-8 space-y-6">
        <SettingsForm
          email={user.email ?? ""}
          displayName={profile?.display_name ?? ""}
        />

        <section className="rounded-2xl border border-black/5 bg-surface p-5 text-sm text-muted leading-relaxed">
          <h2 className="font-semibold text-ink">Privacy &amp; safety</h2>
          <p className="mt-2">{APP_DISCLAIMER}</p>
        </section>
      </div>
    </div>
  );
}
